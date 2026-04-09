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
        estimated_depth_m?: number;
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

          {pred.accuracyMetrics &&
            Object.keys(pred.accuracyMetrics).length > 0 && (
              <div className='border-t border-white/10 bg-black/20 px-4 py-3'>
                <p
                  className={cn(
                    'mb-2 text-[11px] font-semibold',
                    tierUi.heroSub
                  )}
                >
                  Độ chính xác ước tính (theo giai đoạn mô hình)
                </p>
                <ul className='space-y-2 text-[11px] leading-snug'>
                  {Object.entries(pred.accuracyMetrics).map(([k, v]) => (
                    <li
                      key={k}
                      className='flex items-start justify-between gap-3'
                    >
                      <span
                        className={cn(
                          'min-w-0 flex-1 text-left text-[10px] leading-snug',
                          tierUi.heroMuted
                        )}
                      >
                        {accuracyMetricLabelWithNote(k)}
                      </span>
                      <span className='shrink-0 text-right font-semibold text-white tabular-nums'>
                        {accuracyPercentOnly(String(v))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {impact && (
            <div className='space-y-2 border-t border-white/10 bg-white/95 px-4 py-4 text-slate-800'>
              {impact.estimated_depth_m != null && (
                <div className='flex items-baseline justify-between gap-2'>
                  <span className='text-xs text-slate-600'>
                    Độ sâu nước ước tính
                  </span>
                  <span className='text-base font-semibold tabular-nums'>
                    {impact.estimated_depth_m} m
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
                        {s.waterLevel} m
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
            {Object.entries(comps).map(([key, obj]) => (
              <details
                key={key}
                className='rounded-lg border border-slate-100 bg-white text-[10px]'
              >
                <summary className='cursor-pointer px-2 py-1.5 font-medium text-slate-700 capitalize'>
                  {labelComponent(key)}
                </summary>
                <pre className='max-h-36 overflow-auto p-2 text-[9px] whitespace-pre-wrap text-slate-500'>
                  {JSON.stringify(obj, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </details>
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
