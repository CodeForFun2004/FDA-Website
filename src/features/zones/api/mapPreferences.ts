import type { MapLayerPrefs } from '../map/map.type';
import { sanitizePrefs } from '../map/storage';
import { DEFAULT_MAP_PREFS } from '../map/defaults';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://fda.id.vn/api/v1';

export async function getUserMapPreferences(
  jwt: string
): Promise<MapLayerPrefs> {
  const res = await fetch(`${API_BASE}/preferences/map-layers`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${jwt}`
    },
    cache: 'no-store'
  });

  // backend có thể trả 200 với default (kể cả “404 Not Found” logic)
  const json = await res.json().catch(() => null);
  if (!json?.success) {
    // fallback
    return DEFAULT_MAP_PREFS;
  }
  return sanitizePrefs(json.data);
}

export async function putUserMapPreferences(
  jwt: string,
  prefs: MapLayerPrefs
): Promise<void> {
  const res = await fetch(`${API_BASE}/preferences/map-layers`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`
    },
    body: JSON.stringify(prefs)
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const msg = json?.message ?? 'Update map preferences failed';
    throw new Error(msg);
  }
}
