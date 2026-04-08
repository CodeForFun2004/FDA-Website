'use client';

import type { MapLayerPrefs } from '../../map/map.type';

// Nếu bạn dùng shadcn:
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch";
// import { Slider } from "@/components/ui/slider";
// import { Badge } from "@/components/ui/badge";

type Props = {
  prefs: MapLayerPrefs;
  /** Đã áp dụng lên map (sau Save); layer nặng chỉ dùng từ đây. */
  appliedPrefs: MapLayerPrefs;
  setPrefsPartial: (patch: Partial<MapLayerPrefs>) => void;
  syncState: 'idle' | 'saving' | 'unsynced' | 'offline' | 'error';
  isAuthenticated: boolean;
  saveManual: () => Promise<void>;
};

export default function LayerPanel({
  prefs,
  appliedPrefs,
  setPrefsPartial,
  syncState,
  isAuthenticated,
  saveManual
}: Props) {
  const syncLabel =
    syncState === 'idle'
      ? 'Synced'
      : syncState === 'saving'
        ? 'Saving...'
        : syncState === 'offline'
          ? 'Offline (pending sync)'
          : syncState === 'unsynced'
            ? 'Not synced'
            : 'Sync error';

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
        <div className='text-sm font-medium'>Data layer</div>

        <div className='grid grid-cols-2 gap-2'>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              prefs.overlays.adminAreas
                ? 'bg-primary text-primary-foreground'
                : 'bg-background'
            }`}
            onClick={() =>
              setPrefsPartial({
                overlays: {
                  ...prefs.overlays,
                  adminAreas: !prefs.overlays.adminAreas
                }
              })
            }
          >
            Admin Areas
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              prefs.overlays.stations
                ? 'bg-primary text-primary-foreground'
                : 'bg-background'
            }`}
            onClick={() =>
              setPrefsPartial({
                overlays: {
                  ...prefs.overlays,
                  stations: !prefs.overlays.stations
                }
              })
            }
          >
            Stations
          </button>
          <button
            className={`col-span-2 rounded-xl border px-3 py-2 text-sm ${
              prefs.overlays.communityReports
                ? 'bg-primary text-primary-foreground'
                : 'bg-background'
            }`}
            onClick={() =>
              setPrefsPartial({
                overlays: {
                  ...prefs.overlays,
                  communityReports: !prefs.overlays.communityReports
                }
              })
            }
          >
            Community reports
          </button>
        </div>

        {(prefs.overlays.stations && !appliedPrefs.overlays.stations) ||
        (prefs.overlays.communityReports &&
          !appliedPrefs.overlays.communityReports) ? (
          <p className='text-muted-foreground text-[11px] leading-snug'>
            Lưu cài đặt để hiển thị stations / phản ánh cộng đồng trên bản đồ.
          </p>
        ) : null}
      </div>

      <button
        type='button'
        onClick={() => void saveManual()}
        disabled={syncState === 'saving'}
        className='bg-primary text-primary-foreground w-full rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50'
      >
        {syncState === 'saving' ? 'Saving...' : 'Save settings'}
      </button>
    </div>
  );
}
