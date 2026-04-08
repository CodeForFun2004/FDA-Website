'use client';

import * as React from 'react';
import debounce from 'lodash.debounce';
import type { MapLayerPrefs } from '../map/map.type';
import { DEFAULT_MAP_PREFS } from '../map/defaults';
import {
  readGuestPrefs,
  writeGuestPrefs,
  clearGuestPrefs,
  readPendingPrefs,
  writePendingPrefs,
  clearPendingPrefs
} from '../map/storage';
import {
  getUserMapPreferences,
  putUserMapPreferences
} from '../api/map-preferences.api';
import { getAccessToken } from '@/libs/auth-utils';
import { useAuthStore } from '@/features/authenticate/store/auth-store';

type SyncState = 'idle' | 'saving' | 'unsynced' | 'offline' | 'error';

export function useMapPreferences() {
  const [prefs, setPrefs] = React.useState<MapLayerPrefs>(DEFAULT_MAP_PREFS);
  const [syncState, setSyncState] = React.useState<SyncState>('idle');
  const authStatus = useAuthStore((state) => state.status);
  const isAuthenticated = authStatus === 'authenticated';

  // helper: merge patch
  const setPrefsPartial = React.useCallback((patch: Partial<MapLayerPrefs>) => {
    setPrefs((prev) => ({
      ...prev,
      ...patch,
      overlays: patch.overlays
        ? { ...prev.overlays, ...patch.overlays }
        : prev.overlays,
      opacity: patch.opacity
        ? { ...(prev.opacity ?? {}), ...patch.opacity }
        : prev.opacity
    }));
  }, []);

  // initial load
  React.useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (!token) {
        // guest
        const guest = readGuestPrefs();
        setPrefs(normalizePrefs(guest ?? DEFAULT_MAP_PREFS));
        setSyncState('idle');
        return;
      }

      // logged-in
      try {
        const guest = readGuestPrefs();
        const server = await getUserMapPreferences(token);

        setPrefs(normalizePrefs(server));

        // Login transition sync:
        // nếu có guest prefs và server đang default => sync guest lên server
        const serverLooksDefault = shallowEqualPrefs(server, DEFAULT_MAP_PREFS);
        if (
          guest &&
          serverLooksDefault &&
          !shallowEqualPrefs(guest, DEFAULT_MAP_PREFS)
        ) {
          setSyncState(navigator.onLine ? 'saving' : 'offline');
          if (navigator.onLine) {
            await putUserMapPreferences(token!, normalizePrefs(guest));
            setPrefs(normalizePrefs(guest));
            setSyncState('idle');
            clearGuestPrefs();
          } else {
            writePendingPrefs(normalizePrefs(guest));
            setPrefs(normalizePrefs(guest));
            setSyncState('offline');
          }
        } else {
          // server wins
          clearGuestPrefs();
          setSyncState('idle');
        }

        // nếu có pending từ lần offline trước -> thử sync
        const pending = readPendingPrefs();
        if (pending && navigator.onLine) {
          setSyncState('saving');
          await putUserMapPreferences(token, pending);
          clearPendingPrefs();
          setSyncState('idle');
        }
      } catch {
        // nếu server lỗi thì vẫn cho user dùng local (fallback)
        const fallback = readGuestPrefs() ?? DEFAULT_MAP_PREFS;
        setPrefs(normalizePrefs(fallback));
        setSyncState('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Debounced saver (logged-in)
  const debouncedSave = React.useMemo(() => {
    return debounce(async (nextPrefs: MapLayerPrefs) => {
      const jwt = await getAccessToken();
      if (!jwt) {
        writeGuestPrefs(nextPrefs);
        setSyncState('idle');
        return;
      }
      if (!navigator.onLine) {
        writePendingPrefs(nextPrefs);
        setSyncState('offline');
        return;
      }

      try {
        setSyncState('saving');
        await putUserMapPreferences(jwt, nextPrefs);
        clearPendingPrefs();
        setSyncState('idle');
      } catch {
        // giữ UI, đánh dấu chưa sync
        writePendingPrefs(nextPrefs);
        setSyncState('unsynced');
      }
    }, 500);
  }, []);

  // Whenever prefs change: persist according to auth state
  React.useEffect(() => {
    if (!isAuthenticated) {
      writeGuestPrefs(prefs);
      setSyncState('idle');
      return;
    }

    // logged-in: debounce PUT
    // debouncedSave(prefs, token!);
  }, [prefs, isAuthenticated, debouncedSave]);

  // retry pending when back online
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const onOnline = async () => {
      const pending = readPendingPrefs();
      if (!pending) return;
      const token = await getAccessToken();
      if (!token) return;

      try {
        setSyncState('saving');
        await putUserMapPreferences(token, pending);
        clearPendingPrefs();
        setSyncState('idle');
      } catch {
        setSyncState('unsynced');
      }
    };

    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [isAuthenticated]);

  // Manual save function
  const saveManual = React.useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;
    try {
      setSyncState('saving');
      await putUserMapPreferences(token, prefs);
      setSyncState('idle');
    } catch {
      setSyncState('unsynced');
    }
  }, [prefs]);

  // Removed auto-save effect to rely on manual save as requested
  // React.useEffect(() => { ... }, [prefs...]);

  return { prefs, setPrefsPartial, syncState, isAuthenticated, saveManual };
}

function shallowEqualPrefs(a: MapLayerPrefs, b: MapLayerPrefs) {
  return (
    a.baseMap === b.baseMap &&
    a.overlays.adminAreas === b.overlays.adminAreas &&
    a.overlays.stations === b.overlays.stations &&
    a.overlays.traffic === b.overlays.traffic &&
    a.overlays.weather === b.overlays.weather &&
    (a.opacity?.flood ?? 80) === (b.opacity?.flood ?? 80) &&
    (a.opacity?.weather ?? 70) === (b.opacity?.weather ?? 70)
  );
}

function normalizePrefs(p: MapLayerPrefs): MapLayerPrefs {
  const hasAdminAreas = typeof p?.overlays?.adminAreas === 'boolean';
  const hasStations = typeof p?.overlays?.stations === 'boolean';
  const stations = hasStations
    ? p.overlays.stations
    : typeof (p as any)?.overlays?.flood === 'boolean'
      ? Boolean((p as any).overlays.flood)
      : DEFAULT_MAP_PREFS.overlays.stations;
  const adminAreas = hasAdminAreas ? p.overlays.adminAreas : !stations;

  return {
    ...p,
    overlays: {
      ...DEFAULT_MAP_PREFS.overlays,
      ...p.overlays,
      adminAreas,
      stations
    },
    opacity: {
      ...DEFAULT_MAP_PREFS.opacity,
      ...(p.opacity ?? {})
    }
  };
}
