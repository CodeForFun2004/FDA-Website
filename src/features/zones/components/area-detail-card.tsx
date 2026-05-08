'use client';

import React from 'react';
import { Card, Button } from '@/components/ui/common';
import { Building2, Satellite, Sparkles, AlertCircle, X } from 'lucide-react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import {
  AiApiError,
  extractSatelliteGeoJsonFromAnalysisResponse,
  extractPredictGeoJsonFromPredictResponse,
  fetchPredictFloodAssemble,
  fetchSatelliteAnalysis,
  normalizeAreaId
} from '@/features/zones/api/area-ai.api';
import { resolveModelUiTier } from '@/features/zones/lib/flood-severity-ui';
import {
  PredictFloodAiPanel,
  describePredictAreaMismatch,
  type PredictFloodData
} from '@/features/zones/components/predict-flood-ai-panel';
import { buildClippedPredictFeatureCollection } from '@/features/zones/lib/predict-geometry-merge';

type Props = {
  feature: any;
  onClose: () => void;
  onSatelliteGeoJson?: (fc: FeatureCollection | null) => void;
  onPredictGeoJson?: (fc: FeatureCollection | null) => void;
};

type SatelliteAnalysisPayload = {
  area_id?: string;
};

function describeSatelliteAreaIdMismatch(
  requested: string,
  json: SatelliteAnalysisPayload | null
): string | null {
  if (!json || !requested) return null;
  const fromApi = normalizeAreaId(json.area_id);
  if (!fromApi) return null;
  if (fromApi === requested) return null;
  return 'Phản hồi vệ tinh không khớp khu vực đang chọn trên bản đồ.';
}

type PredictRoot = {
  success?: boolean;
  message?: string;
  data?: PredictFloodData;
};

function toPredictUserMessage(error: unknown): string {
  if (!(error instanceof AiApiError)) {
    return error instanceof Error ? error.message : 'Lỗi không xác định';
  }
  if (error.status === 429) {
    return 'Hệ thống đang nhận nhiều yêu cầu. Vui lòng chờ vài giây rồi thử lại.';
  }
  if (error.status === 403) {
    return 'Không có quyền truy cập AI. Vui lòng đăng nhập hoặc kiểm tra API key.';
  }
  if (error.status === 404) {
    return 'Không tìm thấy khu vực dự báo. Vui lòng chọn khu vực khác.';
  }
  if (error.status >= 500) {
    return 'Hệ thống AI tạm thời gián đoạn. Vui lòng thử lại sau.';
  }
  return `${error.message} (${error.status})`;
}

export function AreaDetailCard({
  feature,
  onClose,
  onSatelliteGeoJson,
  onPredictGeoJson
}: Props) {
  const props = feature?.properties ?? {};
  const name =
    props.name ??
    props.wardName ??
    props.areaName ??
    props.title ??
    'Khu hành chính';
  const code = props.code ?? props.wardCode ?? '—';
  const rawId =
    props.id ??
    props.areaId ??
    props.wardId ??
    props.administrativeAreaId ??
    feature?.id ??
    '';
  const areaId = normalizeAreaId(rawId);

  const [satLoading, setSatLoading] = React.useState(false);
  const [predLoading, setPredLoading] = React.useState(false);
  const [satError, setSatError] = React.useState<string | null>(null);
  const [predError, setPredError] = React.useState<string | null>(null);
  const [satelliteMismatch, setSatelliteMismatch] = React.useState<
    string | null
  >(null);
  const [predictMismatch, setPredictMismatch] = React.useState<string | null>(
    null
  );
  const [predictRoot, setPredictRoot] = React.useState<PredictRoot | null>(
    null
  );
  const [predictCooldownUntil, setPredictCooldownUntil] = React.useState(0);
  const [predictCooldownLeftSec, setPredictCooldownLeftSec] = React.useState(0);
  const lastPredictClickAtRef = React.useRef(0);

  const aiPanelScrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setPredictRoot(null);
    setSatError(null);
    setPredError(null);
    setSatelliteMismatch(null);
    setPredictMismatch(null);
    onSatelliteGeoJson?.(null);
    onPredictGeoJson?.(null);
  }, [areaId, onSatelliteGeoJson, onPredictGeoJson]);

  React.useEffect(() => {
    // Khi bật dự đoán, đảm bảo panel scroll về đầu để không bị "thụt lùi/mất UI".
    if (!predictRoot?.data) return;
    aiPanelScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [predictRoot?.data]);

  React.useEffect(() => {
    if (!predictCooldownUntil) return;
    const tick = () => {
      const remainMs = Math.max(0, predictCooldownUntil - Date.now());
      setPredictCooldownLeftSec(Math.ceil(remainMs / 1000));
      if (remainMs <= 0) {
        setPredictCooldownUntil(0);
        setPredictCooldownLeftSec(0);
      }
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [predictCooldownUntil]);

  async function runSatellite() {
    if (!areaId) {
      setSatError('Không có id khu vực.');
      return;
    }
    setSatLoading(true);
    setSatError(null);
    setSatelliteMismatch(null);
    try {
      const json = (await fetchSatelliteAnalysis(
        areaId
      )) as SatelliteAnalysisPayload;
      setSatelliteMismatch(describeSatelliteAreaIdMismatch(areaId, json));
      const fc = await extractSatelliteGeoJsonFromAnalysisResponse(json);
      if (!fc || fc.features.length === 0) {
        setSatError('API không trả polygon flood (geojson rỗng).');
        onSatelliteGeoJson?.(null);
        return;
      }

      // Clip satellite geojson vào admin area bounds (tương tự predict)
      const satelliteFc = buildClippedPredictFeatureCollection({
        extracted: fc,
        adminGeometry: feature?.geometry ?? null,
        predictTier: 'satellite'
      });

      if (!satelliteFc) {
        setSatError('Dữ liệu vệ tinh nằm ngoài ranh giới khu vực.');
        onSatelliteGeoJson?.(null);
        return;
      }

      onSatelliteGeoJson?.(satelliteFc);
    } catch (e) {
      const msg =
        e instanceof AiApiError
          ? `${e.message} (${e.status})`
          : e instanceof Error
            ? e.message
            : 'Lỗi không xác định';
      setSatError(msg);
      onSatelliteGeoJson?.(null);
    } finally {
      setSatLoading(false);
    }
  }

  async function runPredict() {
    if (!areaId) {
      setPredError('Không có id khu vực.');
      return;
    }

    const now = Date.now();
    if (now - lastPredictClickAtRef.current < 600) return;
    lastPredictClickAtRef.current = now;

    // Toggle off: nếu đã có kết quả dự đoán -> tắt luôn layer + panel dữ liệu
    if (predictRoot?.data && !predLoading) {
      setPredictRoot(null);
      setPredError(null);
      setPredictMismatch(null);
      onPredictGeoJson?.(null);
      return;
    }

    setPredLoading(true);
    setPredError(null);
    setPredictMismatch(null);
    try {
      const raw = (await fetchPredictFloodAssemble(areaId)) as PredictRoot;
      setPredictRoot(raw);
      setPredictMismatch(describePredictAreaMismatch(areaId, raw?.data));

      // Extract geojson polygon cho layer tô màu
      const fc = await extractPredictGeoJsonFromPredictResponse(raw);
      const aiPred = raw?.data?.forecast?.aiPrediction;
      const tier = resolveModelUiTier({
        ensembleProbability:
          typeof aiPred?.ensembleProbability === 'number'
            ? aiPred.ensembleProbability
            : null,
        riskLevel:
          typeof aiPred?.riskLevel === 'string' ? aiPred.riskLevel : null,
        severityLevel:
          typeof raw?.data?.severityLevel === 'number'
            ? raw.data.severityLevel
            : null
      });

      const predictFc = buildPredictOverlayFeatureCollection({
        extracted: fc,
        fallbackFeature: feature,
        tier
      });

      onPredictGeoJson?.(predictFc);
    } catch (e) {
      const msg = toPredictUserMessage(e);
      if (e instanceof AiApiError && e.status === 429) {
        setPredictCooldownUntil(Date.now() + 12_000);
      }
      setPredError(msg);
      onPredictGeoJson?.(null);
    } finally {
      setPredLoading(false);
    }
  }

  const pd = predictRoot?.data;
  const hasAiResult = Boolean(pd);

  return (
    <div
      className={`pointer-events-auto max-w-full ${
        hasAiResult ? 'w-full' : 'w-fit'
      }`}
    >
      <Card
        className={`overflow-hidden rounded-2xl border-none bg-white/95 shadow-xl backdrop-blur-md ${
          hasAiResult ? 'flex max-h-[calc(100dvh-96px)] flex-col' : ''
        }`}
      >
        <div className={hasAiResult ? 'shrink-0 p-4 pb-2' : 'p-4 pb-2'}>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <h2 className='text-lg leading-tight font-bold text-slate-800'>
                {name}
              </h2>
              <div className='mt-1.5 text-[10px] text-slate-500'>
                <span className='font-semibold'>{code}</span>
              </div>
            </div>
            <Button
              size='icon'
              variant='ghost'
              className='-mt-2 -mr-2 h-7 w-7 flex-shrink-0 rounded-full bg-slate-100 text-sm hover:bg-slate-200'
              onClick={onClose}
            >
              ×
            </Button>
          </div>
        </div>

        {(satelliteMismatch || predictMismatch) && (
          <div className='space-y-1 border-t border-amber-200 bg-amber-50 px-4 py-2 text-[11px] text-amber-950'>
            {satelliteMismatch && (
              <div>
                <span className='font-semibold'>Vệ tinh: </span>
                {satelliteMismatch}
              </div>
            )}
            {predictMismatch && (
              <div>
                <span className='font-semibold'>Dự đoán AI: </span>
                {predictMismatch}
              </div>
            )}
          </div>
        )}

        <div
          className={`border-t border-slate-100 px-3 pt-3 pb-4 ${
            hasAiResult
              ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain'
              : ''
          }`}
        >
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='gap-1.5'
              disabled={satLoading || !areaId}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                void runSatellite();
              }}
            >
              <Satellite className='h-3.5 w-3.5' />
              {satLoading ? 'Đang phân tích…' : 'Chụp ảnh vệ tinh'}
            </Button>
            <Button
              type='button'
              size='sm'
              variant={pd ? 'outline' : undefined}
              className={
                pd
                  ? 'gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'gap-1.5 bg-violet-600 text-white hover:bg-violet-700'
              }
              disabled={
                predLoading || !areaId || Date.now() < predictCooldownUntil
              }
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                void runPredict();
              }}
            >
              {pd ? (
                <>
                  <X className='h-3.5 w-3.5' />
                  Tắt dự đoán
                </>
              ) : (
                <>
                  <Sparkles className='h-3.5 w-3.5' />
                  {predLoading
                    ? 'Đang gọi AI…'
                    : predictCooldownLeftSec > 0
                      ? `Thử lại sau ${predictCooldownLeftSec}s`
                      : 'Dự đoán AI'}
                </>
              )}
            </Button>
          </div>

          {satError && (
            <div className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{satError}</span>
            </div>
          )}
          {predError && (
            <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{predError}</span>
            </div>
          )}

          <div className='grid grid-cols-2 gap-3 text-xs text-slate-600'>
            <div className='rounded-xl bg-slate-50 p-3'>
              <div className='text-[10px] text-slate-500'>Tên</div>
              <div className='mt-1 line-clamp-2 text-sm font-semibold text-slate-800'>
                {name}
              </div>
            </div>
            <div className='rounded-xl bg-slate-50 p-3'>
              <div className='text-[10px] text-slate-500'>Mã</div>
              <div className='mt-1 text-sm font-semibold text-slate-800'>
                {code}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700'>
            <Building2 className='h-3.5 w-3.5' />
            <span>Đã zoom vào ranh giới khu vực được chọn.</span>
          </div>

          <div className='border-t border-slate-100 pt-3'>
            <div className='mb-2 text-xs font-semibold text-slate-700'>
              AI gợi ý
            </div>
            {!pd && !predLoading && (
              <p className='text-muted-foreground text-xs'>
                Bấm &quot;Dự đoán AI&quot; để xem trạm, dự báo, mô hình và tóm
                tắt.
              </p>
            )}
            {predLoading && (
              <p className='text-muted-foreground text-xs'>Đang tải…</p>
            )}
            {pd && (
              <div ref={aiPanelScrollRef} className='pr-1'>
                <PredictFloodAiPanel data={pd} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function buildPredictOverlayFeatureCollection(args: {
  extracted: FeatureCollection | null;
  fallbackFeature: any;
  tier: string;
}): FeatureCollection | null {
  const fallbackGeometry = args.fallbackFeature?.geometry as
    | Geometry
    | undefined;

  if (args.extracted && args.extracted.features.length > 0) {
    const clipped = buildClippedPredictFeatureCollection({
      extracted: args.extracted,
      adminGeometry: fallbackGeometry ?? null,
      predictTier: args.tier
    });
    if (clipped) return clipped;
  }

  const geometry = fallbackGeometry;
  if (!geometry) return null;
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
    return null;
  }

  const fallback: Feature = {
    type: 'Feature',
    id:
      args.fallbackFeature?.id ??
      args.fallbackFeature?.properties?.id ??
      'predict-area-fallback',
    geometry,
    properties: {
      ...(args.fallbackFeature?.properties ?? {}),
      predictTier: args.tier
    }
  };

  return {
    type: 'FeatureCollection',
    features: [fallback]
  };
}
