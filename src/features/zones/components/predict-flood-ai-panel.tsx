'use client';

import { cn } from '@/libs/utils';
import { normalizeAreaId } from '@/features/zones/api/area-ai.api';
import {
  FLOOD_TIER_UI,
  probabilityBandLabelVi,
  resolveModelUiTier,
  resolveTierFromEnsembleProbability,
  tierFromSeverityString
} from '@/features/zones/lib/flood-severity-ui';

/** Payload `data` từ POST …/predict-flood-assemble */
export type PredictFloodData = {
  administrativeAreaId?: string;
  status?: string;
  severityLevel?: number;
  summary?: string;
  contributingStations?: Array<{
    stationId?: string;
    stationCode?: string;
    distance?: number;
    waterLevel?: number;
    severity?: string;
    weight?: number;
    street?: { id?: string; name?: string; code?: string };
    ward?: { id?: string; name?: string; code?: string };
  }>;
  communityReports?: Array<{
    id?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    severity?: string;
    trustScore?: number;
    status?: string;
    createdAt?: string;
  }>;
  evaluatedAt?: string;
  administrativeArea?: {
    id?: string;
    name?: string;
    level?: string;
    code?: string;
    parentId?: string | null;
    parentName?: string | null;
  };
  geoJson?: unknown;
  forecast?: {
    validPeriod?: {
      start?: string;
      end?: string;
      durationHours?: number;
      nextUpdateExpected?: string;
    };
    windows?: Array<{
      horizon?: string;
      probability?: number;
      status?: string;
      severityLevel?: number;
    }>;
    aiPrediction?: {
      ensembleProbability?: number;
      riskLevel?: string;
      confidence?: number;
      accuracyMetrics?: Record<string, string>;
      components?: Record<string, unknown>;
      impact?: {
        /** BE có thể trả _m nhưng giá trị đang là cm theo spec mới */
        estimated_depth_m?: number;
        /** Nếu BE đổi field sang cm */
        estimated_depth_cm?: number;
        estimated_area_affected?: string;
        recommendation?: string;
      };
    };
  };
  aiConsultant?: {
    provider?: string;
    finalSummary?: string;
  };
  satelliteVerification?: {
    available?: boolean;
    source?: string;
    status?: string;
    message?: string;
    metadata?: unknown;
    visuals?: Record<string, unknown>;
  };
};

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='space-y-2'>
      <h4 className='text-xs font-semibold text-slate-700'>{title}</h4>
      {children}
    </section>
  );
}

/**
 * Nhãn trái + chú thích trong ngoặc: mỗi giai đoạn gồm nguồn / thành phần gì
 * (khớp mô tả API: WeatherAPI → Open-Meteo → Copernicus → DEM → full stack).
 */
function accuracyMetricLabelWithNote(key: string): string {
  const map: Record<string, string> = {
    baseline_accuracy:
      'Cơ sở (WeatherAPI — đường cơ sở, chỉ dự báo thời tiết tổng quát)',
    phase_1_accuracy:
      'Giai đoạn 1 (Open-Meteo — thời tiết theo tọa độ khu vực)',
    phase_2_accuracy: 'Giai đoạn 2 (Copernicus — độ ẩm đất / ngấm nước)',
    phase_3_accuracy:
      'Giai đoạn 3 (DEM địa hình — độ dốc, thoát nước, nguy cơ ngập)',
    total_improvement:
      'Cải thiện tổng (full stack — gộp toàn bộ tín hiệu + địa hình)'
  };
  return map[key] ?? key.replace(/_/g, ' ');
}

/** Chỉ lấy phần % (bỏ hậu tố trong ngoặc, vd "65-72% (WeatherAPI)" → "65-72%") */
function accuracyPercentOnly(raw: string): string {
  const s = String(raw).trim();
  const idx = s.indexOf('(');
  if (idx === -1) return s;
  return s.slice(0, idx).trim();
}

function severityLabelVi(s?: string): string {
  if (!s) return '';
  const m: Record<string, string> = {
    critical: 'Nghiêm trọng',
    high: 'Cao',
    moderate: 'Trung bình',
    low: 'Thấp',
    normal: 'Bình thường'
  };
  return m[s.toLowerCase()] ?? s;
}

export function PredictFloodAiPanel({ data }: { data: PredictFloodData }) {
  const pred = data.forecast?.aiPrediction;
  const comps = pred?.components as
    | Record<string, Record<string, unknown>>
    | undefined;

  const probPct =
    typeof pred?.ensembleProbability === 'number'
      ? (pred.ensembleProbability * 100).toFixed(1)
      : null;
  const confPct =
    typeof pred?.confidence === 'number'
      ? Math.round(pred.confidence * 100)
      : null;
  const risk = pred?.riskLevel ?? '';
  const impact = pred?.impact;
  const estimatedDepthCm =
    impact?.estimated_depth_cm ??
    // theo yêu cầu: đổi từ m sang cm (giá trị đang là cm)
    impact?.estimated_depth_m ??
    null;

  const ensembleP =
    typeof pred?.ensembleProbability === 'number' &&
    Number.isFinite(pred.ensembleProbability)
      ? pred.ensembleProbability
      : null;

  const modelTier = resolveModelUiTier({
    ensembleProbability: ensembleP,
    riskLevel: risk,
    severityLevel:
      typeof data.severityLevel === 'number' ? data.severityLevel : undefined
  });
  const tierUi = FLOOD_TIER_UI[modelTier];

  return (
    <div className='space-y-5 text-sm'>
      {/* —— Ưu tiên: kết quả mô hình —— */}
      {pred && (
        <div
          className={cn(
            'overflow-hidden rounded-2xl border text-white shadow-lg',
            tierUi.hero
          )}
        >
          <div className='px-4 pt-4 pb-2'>
            <p
              className={cn(
                'text-[11px] font-medium tracking-wide',
                tierUi.heroSub
              )}
            >
              Kết quả mô hình dự báo
            </p>
            <div className='mt-3 grid grid-cols-3 gap-2 text-center'>
              {probPct != null && (
                <div className='rounded-xl bg-white/10 px-2 py-3 backdrop-blur-sm'>
                  <div className='text-2xl leading-none font-bold tabular-nums'>
                    {probPct}%
                  </div>
                  <div
                    className={cn(
                      'mt-1.5 text-[10px] leading-tight',
                      tierUi.heroMuted
                    )}
                  >
                    Xác suất lũ
                  </div>
                </div>
              )}
              <div className='rounded-xl bg-white/10 px-2 py-3 backdrop-blur-sm'>
                <div
                  className={cn(
                    'text-lg leading-none font-bold uppercase drop-shadow-sm',
                    tierUi.heroSub
                  )}
                >
                  {ensembleP != null
                    ? probabilityBandLabelVi(ensembleP)
                    : risk || '—'}
                </div>
                <div
                  className={cn(
                    'mt-1.5 text-[10px] leading-tight',
                    tierUi.heroMuted
                  )}
                >
                  {ensembleP != null ? 'Theo xác suất' : 'Mức rủi ro'}
                </div>
              </div>
              {confPct != null && (
                <div className='rounded-xl bg-white/10 px-2 py-3 backdrop-blur-sm'>
                  <div className='text-2xl leading-none font-bold tabular-nums'>
                    {confPct}%
                  </div>
                  <div
                    className={cn(
                      'mt-1.5 text-[10px] leading-tight',
                      tierUi.heroMuted
                    )}
                  >
                    Độ tin cậy
                  </div>
                </div>
              )}
            </div>
          </div>

          {comps && Object.keys(comps).length > 0 && (
            <div className='border-t border-white/10 bg-black/20 px-4 py-3'>
              <p
                className={cn('mb-2 text-[11px] font-semibold', tierUi.heroSub)}
              >
                Chỉ số đóng góp (tóm tắt)
              </p>
              <div className='grid gap-2 sm:grid-cols-2'>
                {Object.entries(comps)
                  .filter(([, obj]) => shouldShowComponentSummary(obj))
                  .slice(0, 6)
                  .map(([key, obj]) => (
                    <div
                      key={key}
                      className='rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm'
                      title={labelComponent(key)}
                    >
                      <div className='flex items-center justify-between gap-2'>
                        <span
                          className={cn(
                            'text-[11px] font-semibold',
                            tierUi.heroSub
                          )}
                        >
                          {labelComponent(key)}
                        </span>
                      </div>

                      <div className='mt-2 flex flex-wrap gap-1.5'>
                        {extractComponentHighlights(obj).length > 0 ? (
                          extractComponentHighlights(obj)
                            .slice(0, 3)
                            .map((item) => (
                              <span
                                key={`${key}-${item.label}`}
                                className='rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700'
                              >
                                <span className='text-slate-500'>
                                  {item.label}:
                                </span>{' '}
                                <span className='font-semibold text-slate-900'>
                                  {item.value}
                                </span>
                              </span>
                            ))
                        ) : (
                          <span className='rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700'>
                            {summarizeComponentShort(obj)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {impact && (
            <div className='space-y-2 border-t border-white/10 bg-white/95 px-4 py-4 text-slate-800'>
              {estimatedDepthCm != null && (
                <div className='flex items-baseline justify-between gap-2'>
                  <span className='text-xs text-slate-600'>
                    Độ sâu nước ước tính
                  </span>
                  <span className='text-base font-semibold tabular-nums'>
                    {estimatedDepthCm} cm
                  </span>
                </div>
              )}
              {impact.estimated_area_affected && (
                <div className='flex items-baseline justify-between gap-2 border-t border-slate-100 pt-2'>
                  <span className='text-xs text-slate-600'>
                    Phạm vi ảnh hưởng ước tính
                  </span>
                  <span className='text-right text-base font-semibold'>
                    {impact.estimated_area_affected}
                  </span>
                </div>
              )}
              {impact.recommendation && (
                <div
                  className={cn(
                    'mt-3 rounded-xl border px-3 py-3 text-sm leading-relaxed font-medium',
                    tierUi.recBox
                  )}
                >
                  {impact.recommendation}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Trạng thái khu vực — chỉ Normal + mức (không tóm tắt dài / không giờ cập nhật) */}
      {(data.status != null && data.status !== '') ||
      typeof data.severityLevel === 'number' ? (
        <div className='rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-xs font-semibold text-slate-900'>
              Trạng thái khu vực: {data.status ?? '—'}
            </span>
            {typeof data.severityLevel === 'number' && (
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                  FLOOD_TIER_UI[modelTier].badge
                )}
              >
                mức {data.severityLevel}
              </span>
            )}
          </div>
        </div>
      ) : null}

      {/* Chỉ tên + mã — không hiện UUID */}
      {data.administrativeArea && (
        <Section title='Khu vực đánh giá'>
          <div className='rounded-xl border border-slate-100 bg-white px-3 py-2.5'>
            <span className='font-semibold text-slate-900'>
              {data.administrativeArea.name}
            </span>
            {data.administrativeArea.code && (
              <span className='text-muted-foreground ml-2 text-xs'>
                ({data.administrativeArea.code})
              </span>
            )}
            {data.administrativeArea.parentName && (
              <p className='text-muted-foreground mt-1 text-xs'>
                Thuộc: {data.administrativeArea.parentName}
              </p>
            )}
          </div>
        </Section>
      )}

      {data.forecast?.windows && data.forecast.windows.length > 0 && (
        <Section title='Xu hướng theo khung giờ'>
          <div className='flex flex-wrap gap-2'>
            {data.forecast.windows.map((w) => {
              let wt = modelTier;
              if (
                typeof w.probability === 'number' &&
                Number.isFinite(w.probability)
              ) {
                const raw = w.probability;
                const p = raw > 1 ? raw / 100 : raw;
                wt = resolveTierFromEnsembleProbability(p);
              } else if (typeof w.severityLevel === 'number') {
                wt = resolveModelUiTier({
                  ensembleProbability: null,
                  riskLevel: '',
                  severityLevel: w.severityLevel
                });
              }
              return (
                <div
                  key={w.horizon ?? ''}
                  className={cn(
                    'rounded-lg border px-2.5 py-2 text-xs',
                    FLOOD_TIER_UI[wt].windowChip
                  )}
                >
                  <span className='font-semibold'>{w.horizon}</span>
                  {typeof w.probability === 'number' && (
                    <span className='ml-1.5 tabular-nums'>
                      {w.probability <= 1 && w.probability >= 0
                        ? `${Math.round(w.probability * 100)}%`
                        : `${Math.round(w.probability)}%`}
                    </span>
                  )}
                  {w.status && (
                    <span className='ml-1 opacity-90'>· {w.status}</span>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {data.forecast?.validPeriod && (
        <details className='rounded-lg border border-slate-100 bg-white text-xs'>
          <summary className='cursor-pointer px-3 py-2 font-medium text-slate-600'>
            Thời gian hiệu lực dự báo
          </summary>
          <div className='border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500'>
            {data.forecast.validPeriod.start} → {data.forecast.validPeriod.end}
            {data.forecast.validPeriod.durationHours != null && (
              <span className='ml-1'>
                · {data.forecast.validPeriod.durationHours} giờ
              </span>
            )}
          </div>
        </details>
      )}

      {data.contributingStations && data.contributingStations.length > 0 && (
        <Section title='Trạm đo gần khu vực'>
          <details className='rounded-xl border border-slate-200 bg-slate-50/60'>
            <summary className='cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-slate-800 [&::-webkit-details-marker]:hidden'>
              Tổng số trạm đo: {data.contributingStations.length} (bấm để xem
              chi tiết)
            </summary>
            <ul className='space-y-2 border-t border-slate-200 p-2.5'>
              {data.contributingStations.map((s, i) => (
                <li
                  key={s.stationCode ?? i}
                  className='rounded-xl border border-slate-100 bg-white px-3 py-2.5'
                >
                  <div className='font-semibold text-slate-900'>
                    Trạm {s.stationCode}
                  </div>
                  {s.waterLevel != null && (
                    <p className='mt-0.5 text-xs text-slate-600'>
                      Mức nước:{' '}
                      <span className='font-medium tabular-nums'>
                        {s.waterLevel} cm
                      </span>
                      {s.severity && (
                        <span
                          className={cn(
                            'ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium',
                            FLOOD_TIER_UI[
                              tierFromSeverityString(s.severity) ?? modelTier
                            ].pill
                          )}
                        >
                          {severityLabelVi(s.severity)}
                        </span>
                      )}
                    </p>
                  )}
                  {s.street?.name && (
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {s.street.name}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </details>
        </Section>
      )}

      {data.communityReports && data.communityReports.length > 0 && (
        <Section title='Phản ánh từ người dân'>
          <details className='rounded-xl border border-slate-200 bg-slate-50/60'>
            <summary className='cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-slate-800 [&::-webkit-details-marker]:hidden'>
              Tổng số phản ánh: {data.communityReports.length} (bấm để xem chi
              tiết)
            </summary>
            <ul className='space-y-2 border-t border-slate-200 p-2.5'>
              {data.communityReports.map((r, i) => (
                <li
                  key={r.createdAt ?? i}
                  className='rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-xs'
                >
                  <p className='text-slate-800'>{r.description}</p>
                  <p className='text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-[11px]'>
                    <span>Mức độ:</span>
                    {r.severity && (
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-2 py-0.5 font-medium text-slate-800',
                          FLOOD_TIER_UI[
                            tierFromSeverityString(r.severity) ?? modelTier
                          ].pill
                        )}
                      >
                        {severityLabelVi(r.severity) || r.severity}
                      </span>
                    )}
                    {!r.severity && <span>—</span>}
                    {r.createdAt && (
                      <span className='ml-2'>
                        ·{' '}
                        {new Date(r.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        </Section>
      )}

      {data.aiConsultant?.finalSummary && (
        <Section title='Phân tích & khuyến nghị (AI)'>
          <div
            className={cn(
              'rounded-xl border px-3 py-3 text-xs leading-relaxed whitespace-pre-wrap text-slate-800',
              tierUi.recBox
            )}
          >
            {data.aiConsultant.finalSummary}
          </div>
        </Section>
      )}

      {comps && Object.keys(comps).length > 0 && (
        <details className='rounded-xl border border-slate-200 bg-slate-50 text-xs'>
          <summary className='cursor-pointer px-3 py-2.5 font-medium text-slate-600'>
            Chi tiết kỹ thuật (thời tiết, đất, địa hình…)
          </summary>

          <div className='space-y-2 border-t border-slate-200 p-2'>
            {Object.entries(comps)
              .filter(([, obj]) => shouldShowComponentDetails(obj))
              .map(([key, obj]) => {
                return (
                  <details
                    key={key}
                    className='rounded-lg border border-slate-100 bg-white text-[10px]'
                  >
                    <summary className='cursor-pointer px-2 py-1.5 font-medium text-slate-700 capitalize'>
                      {labelComponent(key)}
                    </summary>
                    <pre className='max-h-36 overflow-auto p-2 text-[9px] whitespace-pre-wrap text-slate-500'>
                      {JSON.stringify(localizeComponentObject(obj), null, 2)}
                    </pre>
                  </details>
                );
              })}
          </div>
        </details>
      )}

      {pred.accuracyMetrics && Object.keys(pred.accuracyMetrics).length > 0 && (
        <div className={cn('rounded-xl border px-3 py-3', tierUi.recBox)}>
          <p className='mb-2 text-[11px] font-semibold'>
            Độ chính xác ước tính (theo giai đoạn mô hình)
          </p>
          <ul className='space-y-2 text-[11px] leading-snug'>
            {Object.entries(pred.accuracyMetrics).map(([k, v]) => (
              <li
                key={k}
                className='flex items-start justify-between gap-3 rounded-lg border border-current/10 bg-white/60 px-2.5 py-2'
              >
                <span className='min-w-0 flex-1 text-left text-[10px] leading-snug opacity-90'>
                  {accuracyMetricLabelWithNote(k)}
                </span>
                <span className='shrink-0 rounded-full bg-white px-2 py-0.5 text-right font-semibold tabular-nums'>
                  {accuracyPercentOnly(String(v))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function labelComponent(key: string): string {
  const m: Record<string, string> = {
    weather: 'Thời tiết',
    saturation: 'Độ bão hòa đất',
    terrain: 'Địa hình',
    historical_similarity: 'Tương đồng lịch sử'
  };
  return m[key] ?? key.replace(/_/g, ' ');
}

function summarizeComponentShort(obj: unknown): string {
  if (obj == null) return '';

  if (typeof obj === 'number' && Number.isFinite(obj)) {
    return formatNumberCompact(obj);
  }

  if (typeof obj === 'string') {
    const s = obj.trim();
    if (!s) return '';
    return s.length > 24 ? `${s.slice(0, 22)}...` : s;
  }

  if (typeof obj !== 'object') return '';
  const o = obj as Record<string, unknown>;

  const preferredKeys = [
    'weight',
    'contribution',
    'score',
    'probability',
    'impact',
    'importance',
    'similarity',
    'value'
  ];

  const candidates: Array<{ key: string; value: number }> = [];
  for (const pk of preferredKeys) {
    const v = o[pk];
    const num = coerceFiniteNumber(v);
    if (num != null) candidates.push({ key: pk, value: num });
  }

  if (candidates.length === 0) {
    for (const [k, v] of Object.entries(o)) {
      const num = coerceFiniteNumber(v);
      if (num != null) candidates.push({ key: k, value: num });
    }
  }

  // Chọn top 2 (để gọn)
  candidates.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const top = candidates.slice(0, 2);
  if (top.length === 0) return extractInputsShort(o);

  const inputsHint = extractInputsShort(o);
  const metricPart = top
    .map(
      ({ key, value }) => `${metricLabel(key)}:${formatMetricValue(key, value)}`
    )
    .join(' · ');

  return inputsHint ? `${metricPart} · ${inputsHint}` : metricPart;
}

function extractComponentHighlights(
  obj: unknown
): Array<{ label: string; value: string }> {
  if (!obj || typeof obj !== 'object') return [];
  const o = obj as Record<string, unknown>;

  const preferredKeys = [
    'contribution',
    'weight',
    'score',
    'probability',
    'similarity',
    'best_match_similarity',
    'similarity_signal',
    'distance_to_river',
    'elevation',
    'elevation_m',
    'precipitation_24h_mm',
    'precipitation_6h_mm',
    'precipitation_mm',
    'infiltration_capacity',
    'saturation_level',
    'level',
    'flow_accumulation'
  ];

  const seen = new Set<string>();
  const out: Array<{ label: string; value: string }> = [];

  for (const key of preferredKeys) {
    const direct = o[key];
    const directNum = coerceFiniteNumber(direct);
    if (directNum != null) {
      out.push({
        label: metricLabel(key),
        value: formatMetricValue(key, directNum)
      });
      seen.add(key);
    }
  }

  if (out.length < 3) {
    for (const [key, value] of Object.entries(o)) {
      if (seen.has(key)) continue;
      const num = coerceFiniteNumber(value);
      if (num == null) continue;
      out.push({
        label: metricLabel(key),
        value: formatMetricValue(key, num)
      });
      if (out.length >= 3) break;
    }
  }

  if (out.length === 0) {
    const inputs = extractInputsShort(o);
    if (inputs) {
      return [{ label: 'Tín hiệu', value: inputs }];
    }
  }

  return out;
}

function coerceFiniteNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function formatNumberCompact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n >= 0 && n <= 1) return n.toFixed(2);
  if (Math.abs(n) >= 100) return String(Math.round(n));
  return String(Math.round(n * 100) / 100);
}

function formatMetricValue(key: string, n: number): string {
  const k = key.toLowerCase();

  // Nếu là tỷ lệ/khớp trong [0..1] thì hiển thị %
  const isRatio =
    n >= 0 &&
    n <= 1 &&
    (k.includes('probability') ||
      k.includes('similarity') ||
      k.includes('match') ||
      k.includes('contribution') ||
      k.includes('weight') ||
      k.includes('level'));
  if (isRatio) return `${Math.round(n * 100)}%`;

  // Mưa / mm
  if (k.includes('precipitation') || k.includes('mm') || k.endsWith('_mm')) {
    return `${formatNumberCompact(n)} mm`;
  }

  if (k.includes('distance')) return `${Math.round(n)} m`;
  if (k.includes('elevation')) return `${Math.round(n)} m`;
  if (k.includes('elevation_m')) return `${Math.round(n)} m`;

  return formatNumberCompact(n);
}

function metricLabel(key: string): string {
  const k = key.trim().toLowerCase();
  if (k.includes('precipitation')) {
    if (k.includes('24')) return 'Mưa 24 giờ';
    if (k.includes('6')) return 'Mưa 6 giờ';
    return 'Lượng mưa';
  }

  if (k.includes('infiltration') && k.includes('capacity'))
    return 'Khả năng thấm';

  if (k.includes('elevation')) return 'Cao độ';
  if (k === 'level' || k.endsWith('_level') || k.includes(' level '))
    return 'Mức';

  const map: Record<string, string> = {
    contribution: 'Đóng góp',
    contribution_score: 'Điểm đóng góp',
    weight: 'Trọng số',
    score: 'Điểm',
    probability: 'Xác suất',
    similarity: 'Tương đồng',
    best_match_similarity: 'Khớp tốt nhất',
    similarity_signal: 'Tín hiệu khớp',
    distance_to_river: 'Cách sông',
    elevation: 'Cao độ',
    elevation_m: 'Cao độ',
    flow_accumulation: 'Tích tụ dòng chảy',

    // Weather
    precipitation_24h_mm: 'Mưa 24 giờ',
    precipitation_24h: 'Mưa 24 giờ',
    precipitation_6h_mm: 'Mưa 6 giờ',
    precipitation_6h: 'Mưa 6 giờ',
    precipitation_mm: 'Lượng mưa',

    // Soil / infiltration
    saturation_level: 'Mức độ bão hòa',
    level: 'Mức',
    infiltration_capacity: 'Khả năng thấm',

    // Sources (mục này thường dùng để debug - sẽ bị ẩn ở phần lọc)
    weather_data_source: 'Nguồn dữ liệu thời tiết',
    weather_source: 'Nguồn dữ liệu thời tiết',
    data_source: 'Nguồn dữ liệu',
    source: 'Nguồn',
    importance: 'Mức độ quan trọng',
    impact: 'Tác động',
    value: 'Giá trị'
  };
  return map[k] ?? humanizeKey(k);
}

function humanizeKey(key: string): string {
  return localizeLooseText(
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase())
      .trim()
  );
}

function extractInputsShort(o: Record<string, unknown>): string {
  const keys = ['inputs', 'features', 'signals', 'metrics', 'data', 'sources'];
  for (const k of keys) {
    const v = o[k];
    if (!Array.isArray(v)) continue;
    const strings = (v as unknown[]).filter((x) => typeof x === 'string') as
      | string[]
      | undefined;
    if (!strings?.length) continue;
    const top = strings
      .filter((item) => {
        const s = item.toLowerCase();
        return !(
          s.includes('open_meteo') ||
          s.includes('weather data source') ||
          s.includes('weather_source') ||
          s.includes('data_source') ||
          s.includes('data source')
        );
      })
      .map((item) => localizeLooseText(item))
      .filter((item) => item.trim() !== '')
      .slice(0, 2);
    if (top.length === 0) continue;
    return top.join(', ');
  }
  return '';
}

function shouldShowComponentSummary(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const highlights = extractComponentHighlights(obj);
  if (highlights.length > 0) {
    return !(
      highlights.length === 1 &&
      highlights[0].label === 'Tín hiệu' &&
      highlights[0].value.trim() === ''
    );
  }
  return summarizeComponentShort(obj).trim() !== '';
}

function shouldShowComponentDetails(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return Object.keys(pruneEmptyDeep(obj)).length > 0;
}

function localizeComponentObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj
      .map((item) => localizeComponentObject(item))
      .filter((item) => !isEmptyValue(item));
  }
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? localizeLooseText(obj) : obj;
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const nextValue = localizeComponentObject(value);
    if (isEmptyValue(nextValue)) continue;
    out[metricLabel(key)] = nextValue;
  }
  return out;
}

function pruneEmptyDeep(obj: unknown): Record<string, unknown> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      const cleaned = value.filter((item) => !isEmptyValue(item));
      if (cleaned.length > 0) out[key] = cleaned;
      continue;
    }
    if (value && typeof value === 'object') {
      const nested = pruneEmptyDeep(value);
      if (Object.keys(nested).length > 0) out[key] = nested;
      continue;
    }
    if (!isEmptyValue(value)) out[key] = value;
  }
  return out;
}

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return true;
    const l = s.toLowerCase();
    // xem như "không có data hữu ích" nếu chỉ là chuỗi debug nguồn dữ liệu
    if (
      l.includes('open_meteo') ||
      l.includes('weather data source') ||
      l.includes('weather_source') ||
      l.includes('data_source') ||
      l.includes('nguon du lieu') ||
      l.includes('nguồn dữ liệu')
    ) {
      return true;
    }
  }
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object')
    return Object.keys(value as object).length === 0;
  return false;
}

function localizeLooseText(value: string): string {
  const map: Array<[RegExp, string]> = [
    [/weather data source/gi, 'Nguồn dữ liệu thời tiết'],
    [/open_meteo/gi, 'Open-Meteo'],
    [/weather source/gi, 'nguồn thời tiết'],
    [/weather/gi, 'thời tiết'],
    [/terrain/gi, 'địa hình'],
    [/saturation/gi, 'độ bão hòa đất'],
    [/historical similarity/gi, 'tương đồng lịch sử'],
    [/similarity signal/gi, 'tín hiệu tương đồng'],
    [/best match similarity/gi, 'độ khớp tốt nhất'],
    [/distance to river/gi, 'khoảng cách tới sông'],
    [/flow accumulation/gi, 'tích tụ dòng chảy'],
    [/elevation/gi, 'cao độ'],
    [/precipitation/gi, 'lượng mưa'],
    [/infiltration capacity/gi, 'khả năng thấm'],
    [/infiltration/gi, 'thấm'],
    [/contribution/gi, 'đóng góp'],
    [/weight/gi, 'trọng số'],
    [/probability/gi, 'xác suất'],
    [/similarity/gi, 'tương đồng'],
    [/importance/gi, 'mức độ quan trọng'],
    [/impact/gi, 'tác động'],
    [/value/gi, 'giá trị']
  ];

  let out = value.trim();
  for (const [pattern, replacement] of map) {
    out = out.replace(pattern, replacement);
  }
  // chuẩn hóa "cao độ m" -> "Cao độ"
  out = out.replace(/\b(cao\s*độ)\s*m\b/gi, '$1');
  return out;
}

export function describePredictAreaMismatch(
  requested: string,
  data: PredictFloodData | null | undefined
): string | null {
  if (!data || !requested) return null;
  const got = normalizeAreaId(data.administrativeAreaId);
  if (!got) return null;
  if (got === requested) return null;
  return 'Phản hồi dự đoán AI không khớp khu vực đang chọn trên bản đồ.';
}
