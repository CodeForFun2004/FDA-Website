'use client';

import React from 'react';
import { Card, Button } from '@/components/ui/common';
import { Building2, Satellite, Sparkles, AlertCircle } from 'lucide-react';
import type { FeatureCollection } from 'geojson';
import {
  AiApiError,
  extractSatelliteGeoJsonFromAnalysisResponse,
  fetchPredictFloodAssemble,
  fetchSatelliteAnalysis,
  normalizeAreaId
} from '@/features/zones/api/area-ai.api';
import {
  PredictFloodAiPanel,
  describePredictAreaMismatch,
  type PredictFloodData
} from '@/features/zones/components/predict-flood-ai-panel';

type Props = {
  feature: any;
  onClose: () => void;
  onSatelliteGeoJson?: (fc: FeatureCollection | null) => void;
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

export function AreaDetailCard({
  feature,
  onClose,
  onSatelliteGeoJson
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

  React.useEffect(() => {
    setPredictRoot(null);
    setSatError(null);
    setPredError(null);
    setSatelliteMismatch(null);
    setPredictMismatch(null);
    onSatelliteGeoJson?.(null);
  }, [areaId, onSatelliteGeoJson]);

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
      onSatelliteGeoJson?.(fc);
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
    setPredLoading(true);
    setPredError(null);
    setPredictMismatch(null);
    try {
      const raw = (await fetchPredictFloodAssemble(areaId)) as PredictRoot;
      setPredictRoot(raw);
      setPredictMismatch(describePredictAreaMismatch(areaId, raw?.data));
    } catch (e) {
      const msg =
        e instanceof AiApiError
          ? `${e.message} (${e.status})`
          : e instanceof Error
            ? e.message
            : 'Lỗi không xác định';
      setPredError(msg);
    } finally {
      setPredLoading(false);
    }
  }

  const pd = predictRoot?.data;

  return (
    <div className='pointer-events-auto w-full max-w-md'>
      <Card className='overflow-hidden rounded-2xl border-none bg-white/95 shadow-xl backdrop-blur-md'>
        <div className='p-4 pb-2'>
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

        <div className='space-y-3 border-t border-slate-100 px-3 pt-3 pb-4'>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='gap-1.5'
              disabled={satLoading || !areaId}
              onClick={() => void runSatellite()}
            >
              <Satellite className='h-3.5 w-3.5' />
              {satLoading ? 'Đang phân tích…' : 'Chụp ảnh vệ tinh'}
            </Button>
            <Button
              type='button'
              size='sm'
              className='gap-1.5 bg-violet-600 text-white hover:bg-violet-700'
              disabled={predLoading || !areaId}
              onClick={() => void runPredict()}
            >
              <Sparkles className='h-3.5 w-3.5' />
              {predLoading ? 'Đang gọi AI…' : 'Dự đoán AI'}
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
              <div className='max-h-[min(480px,65vh)] overflow-y-auto'>
                <PredictFloodAiPanel data={pd} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
