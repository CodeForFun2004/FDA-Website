import type maplibregl from 'maplibre-gl';

export function addOrUpdateRasterOverlay(
  map: maplibregl.Map,
  args: { id: string; tiles: string[]; opacity: number; beforeLayerId?: string }
) {
  const sourceId = `${args.id}-src`;
  const layerId = `${args.id}-lyr`;

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'raster',
      tiles: args.tiles,
      tileSize: 256
    } as any);
  }

  if (!map.getLayer(layerId)) {
    map.addLayer(
      {
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': args.opacity
        }
      } as any,
      args.beforeLayerId
    );
  } else {
    map.setPaintProperty(layerId, 'raster-opacity', args.opacity);
  }
}

export function removeOverlay(map: maplibregl.Map, id: string) {
  const sourceId = `${id}-src`;
  const layerId = `${id}-lyr`;

  if (map.getLayer(layerId)) map.removeLayer(layerId);
  if (map.getSource(sourceId)) map.removeSource(sourceId);
}

export function setOverlayVisibility(
  map: maplibregl.Map,
  id: string,
  visible: boolean
) {
  const layerId = `${id}-lyr`;
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
}

export function setOverlayOpacity(
  map: maplibregl.Map,
  id: string,
  opacity: number
) {
  const layerId = `${id}-lyr`;
  if (!map.getLayer(layerId)) return;
  map.setPaintProperty(layerId, 'raster-opacity', opacity);
}
