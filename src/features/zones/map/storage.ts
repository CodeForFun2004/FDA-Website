import type { MapLayerPrefs } from './map.type';
import { DEFAULT_MAP_PREFS } from './defaults';

const GUEST_KEY = 'fda_map_prefs_guest_v1';
const PENDING_KEY = 'fda_map_prefs_pending_v1';

export function readGuestPrefs(): MapLayerPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeGuestPrefs(prefs: MapLayerPrefs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_KEY, JSON.stringify(prefs));
}

export function clearGuestPrefs() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_KEY);
}

export function readPendingPrefs(): MapLayerPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writePendingPrefs(prefs: MapLayerPrefs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PENDING_KEY, JSON.stringify(prefs));
}

export function clearPendingPrefs() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_KEY);
}

// optional helper
export function sanitizePrefs(p: any): MapLayerPrefs {
  // có thể thêm validation nhẹ, fallback default nếu thiếu field
  return {
    baseMap: p?.baseMap === 'satellite' ? 'satellite' : 'standard',
    overlays: {
      flood: !!p?.overlays?.flood,
      traffic: !!p?.overlays?.traffic,
      weather: !!p?.overlays?.weather
    },
    opacity: {
      flood: clampNum(
        p?.opacity?.flood ?? DEFAULT_MAP_PREFS.opacity?.flood ?? 80,
        0,
        100
      ),
      weather: clampNum(
        p?.opacity?.weather ?? DEFAULT_MAP_PREFS.opacity?.weather ?? 70,
        0,
        100
      )
    }
  };
}

function clampNum(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
