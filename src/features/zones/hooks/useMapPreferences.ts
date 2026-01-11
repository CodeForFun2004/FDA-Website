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
} from '../api/mapPreferences';

/**
 * TODO: chỉnh hàm này theo auth-store của project bạn.
 * - Nếu token đang nằm trong localStorage key khác => sửa tại đây
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const storageVal = localStorage.getItem('fda_auth');
    if (!storageVal) return null;
    const parsed = JSON.parse(storageVal);
    // Zustand persist structure: { state: { accessToken: ... }, version: ... }
    return parsed?.state?.accessToken ?? null;
  } catch (error) {
    console.error('Error parsing fda_auth from localStorage', error);
    return null;
  }
}

type SyncState = 'idle' | 'saving' | 'unsynced' | 'offline' | 'error';

export function useMapPreferences() {
  const [prefs, setPrefs] = React.useState<MapLayerPrefs>(DEFAULT_MAP_PREFS);
  const [syncState, setSyncState] = React.useState<SyncState>('idle');
  const token = getAccessToken();
  const isAuthenticated = !!token;

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
    if (!isAuthenticated) {
      // guest
      const guest = readGuestPrefs();
      setPrefs(guest ?? DEFAULT_MAP_PREFS);
      setSyncState('idle');
      return;
    }

    // logged-in
    (async () => {
      try {
        const guest = readGuestPrefs();
        const server = await getUserMapPreferences(token!);

        setPrefs(server);

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
            await putUserMapPreferences(token!, guest);
            setPrefs(guest);
            setSyncState('idle');
            clearGuestPrefs();
          } else {
            writePendingPrefs(guest);
            setPrefs(guest);
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
          await putUserMapPreferences(token!, pending);
          clearPendingPrefs();
          setSyncState('idle');
        }
      } catch {
        // nếu server lỗi thì vẫn cho user dùng local (fallback)
        const fallback = readGuestPrefs() ?? DEFAULT_MAP_PREFS;
        setPrefs(fallback);
        setSyncState('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Debounced saver (logged-in)
  const debouncedSave = React.useMemo(() => {
    return debounce(async (nextPrefs: MapLayerPrefs, jwt: string) => {
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
    debouncedSave(prefs, token!);
  }, [prefs, isAuthenticated, token, debouncedSave]);

  // retry pending when back online
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const onOnline = async () => {
      const pending = readPendingPrefs();
      if (!pending || !token) return;

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
  }, [isAuthenticated, token]);

  return { prefs, setPrefsPartial, syncState, isAuthenticated };
}

function shallowEqualPrefs(a: MapLayerPrefs, b: MapLayerPrefs) {
  return (
    a.baseMap === b.baseMap &&
    a.overlays.flood === b.overlays.flood &&
    a.overlays.traffic === b.overlays.traffic &&
    a.overlays.weather === b.overlays.weather &&
    (a.opacity?.flood ?? 80) === (b.opacity?.flood ?? 80) &&
    (a.opacity?.weather ?? 70) === (b.opacity?.weather ?? 70)
  );
}
