const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://fda.id.vn/api/v1';

export async function getFloodSeverityGeoJSON(args: {
  bounds: string;
  zoom: number;
  signal?: AbortSignal;
}) {
  const { bounds, zoom, signal } = args;
  const url = new URL(`${API_BASE}/map/flood-severity`);
  url.searchParams.set('bounds', bounds);
  url.searchParams.set('zoom', String(zoom));

  const res = await fetch(url.toString(), {
    method: 'GET',
    signal,
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Flood severity API error');
  return res.json();
}
