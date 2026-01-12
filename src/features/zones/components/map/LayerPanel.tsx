'use client';

import type { MapLayerPrefs } from '../../map/map.type';

// Nếu bạn dùng shadcn:
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch";
// import { Slider } from "@/components/ui/slider";
// import { Badge } from "@/components/ui/badge";

type Props = {
  prefs: MapLayerPrefs;
  setPrefsPartial: (patch: Partial<MapLayerPrefs>) => void;
  syncState: 'idle' | 'saving' | 'unsynced' | 'offline' | 'error';
  isAuthenticated: boolean;
  saveManual: () => Promise<void>;
};

export default function LayerPanel({
  prefs,
  setPrefsPartial,
  syncState,
  isAuthenticated,
  saveManual
}: Props) {
  const syncLabel =
    syncState === 'idle'
      ? 'Đã đồng bộ'
      : syncState === 'saving'
        ? 'Đang lưu...'
        : syncState === 'offline'
          ? 'Offline (chờ đồng bộ)'
          : syncState === 'unsynced'
            ? 'Chưa đồng bộ'
            : 'Lỗi đồng bộ';

  return (
    <div className='bg-background/95 space-y-4 rounded-2xl border p-4 shadow-lg backdrop-blur'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='text-base font-semibold'>Layers</div>
          <div className='text-muted-foreground text-xs'>
            {isAuthenticated ? 'Logged-in' : 'Guest'} • {syncLabel}
          </div>
        </div>

        <div className='rounded-full border px-2 py-1 text-xs'>
          {prefs.baseMap === 'standard' ? 'Standard' : 'Satellite'}
        </div>
      </div>

      {/* Base map */}
      <div className='space-y-2'>
        <div className='text-sm font-medium'>Base map</div>
        <div className='flex gap-2'>
          <button
            className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
              prefs.baseMap === 'standard' ? 'bg-primary text-background' : ''
            }`}
            onClick={() => setPrefsPartial({ baseMap: 'standard' })}
          >
            Standard
          </button>
          <button
            className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
              prefs.baseMap === 'satellite' ? 'bg-primary text-background' : ''
            }`}
            onClick={() => setPrefsPartial({ baseMap: 'satellite' })}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Overlays */}
      <div className='space-y-3'>
        <div className='text-sm font-medium'>Overlays</div>

        <ToggleRow
          label='Flood severity'
          value={prefs.overlays.flood}
          onChange={(v) =>
            setPrefsPartial({ overlays: { ...prefs.overlays, flood: v } })
          }
        />

        <ToggleRow
          label='Traffic'
          value={prefs.overlays.traffic}
          onChange={(v) =>
            setPrefsPartial({ overlays: { ...prefs.overlays, traffic: v } })
          }
        />

        <ToggleRow
          label='Weather'
          value={prefs.overlays.weather}
          onChange={(v) =>
            setPrefsPartial({ overlays: { ...prefs.overlays, weather: v } })
          }
        />
      </div>

      {/* Opacity */}
      <div className='space-y-3'>
        <div className='text-sm font-medium'>Opacity</div>

        <OpacityRow
          label='Flood'
          value={prefs.opacity?.flood ?? 80}
          onChange={(val) =>
            setPrefsPartial({ opacity: { ...prefs.opacity, flood: val } })
          }
        />

        <OpacityRow
          label='Weather'
          value={prefs.opacity?.weather ?? 70}
          onChange={(val) =>
            setPrefsPartial({ opacity: { ...prefs.opacity, weather: val } })
          }
        />
      </div>

      <div className='text-muted-foreground text-xs'>
        Tip: Nhấn lưu để áp dụng cài đặt cho lần sau.
      </div>

      {isAuthenticated && (
        <button
          onClick={() => saveManual()}
          disabled={syncState === 'saving'}
          className='bg-primary text-primary-foreground w-full rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50'
        >
          {syncState === 'saving' ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <div className='text-sm'>{label}</div>
      <button
        type='button'
        className={`focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
          value ? 'bg-primary' : 'bg-input'
        }`}
        onClick={() => onChange(!value)}
        aria-pressed={value}
      >
        <span
          className={`bg-background pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform ${
            value ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function OpacityRow({
  label,
  value,
  onChange
}: {
  label: string;
  value: number; // 0-100
  onChange: (v: number) => void;
}) {
  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between'>
        <div className='text-sm'>{label}</div>
        <div className='text-muted-foreground text-xs tabular-nums'>
          {value}%
        </div>
      </div>
      <input
        type='range'
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className='accent-primary h-2 w-full cursor-pointer'
      />
    </div>
  );
}
