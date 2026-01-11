'use client';

// import "maplibre-gl/dist/maplibre-gl.css";
import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import type { MapLayerPrefs } from '../../map/map.type';
import { getBaseStyle } from '../../map/styles';
import {
  addOrUpdateRasterOverlay,
  removeOverlay,
  setOverlayOpacity,
  setOverlayVisibility
} from '../../map/utils';
import { useFloodSeverity } from '../../hooks/useFloodSeverity';

type Props = {
  prefs: MapLayerPrefs;
};

export default function MapView({ prefs }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);

  // giữ cache flood data để rehydrate khi setStyle
  const floodDataCacheRef = React.useRef<any>(null);

  // Init map
  React.useEffect(() => {
    let mounted = true;

    async function init() {
      if (!containerRef.current || mapRef.current) return;

      const maplibre = await import('maplibre-gl');
      if (!mounted) return;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: getBaseStyle(prefs.baseMap),
        center: [108.2022, 16.0544], // Đà Nẵng (default)
        zoom: 12
      });

      mapRef.current = map;

      map.addControl(
        new maplibre.NavigationControl({ visualizePitch: true }),
        'bottom-right'
      );

      map.on('load', () => {
        // overlays lần đầu
        applyOverlays(map, prefs, floodDataCacheRef.current);
      });
    }

    init();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle baseMap change -> setStyle + rehydrate
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextStyle = getBaseStyle(prefs.baseMap);

    // setStyle sẽ reset layer/source => cần rehydrate sau style.load
    map.setStyle(nextStyle as any);

    const onStyleLoad = () => {
      applyOverlays(map, prefs, floodDataCacheRef.current);
    };

    map.once('style.load', onStyleLoad);
  }, [prefs.baseMap]); // chỉ khi đổi basemap

  // Apply overlay toggles + opacity (không cần setStyle)
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    applyOverlays(map, prefs, floodDataCacheRef.current);
  }, [
    prefs.overlays.flood,
    prefs.overlays.traffic,
    prefs.overlays.weather,
    prefs.opacity?.flood,
    prefs.opacity?.weather
  ]);

  // Flood hook: fetch + update geojson source
  useFloodSeverity({
    mapRef,
    enabled: prefs.overlays.flood,
    opacity: (prefs.opacity?.flood ?? 80) / 100,
    onData: (geojson) => {
      floodDataCacheRef.current = geojson;
    }
  });

  return <div ref={containerRef} className='h-full w-full' />;
}

function applyOverlays(
  map: maplibregl.Map,
  prefs: MapLayerPrefs,
  floodGeojson: any
) {
  // Traffic raster overlay (placeholder)
  const trafficTiles = process.env.NEXT_PUBLIC_TRAFFIC_TILE_URL;
  if (prefs.overlays.traffic && trafficTiles) {
    addOrUpdateRasterOverlay(map, {
      id: 'traffic',
      tiles: [trafficTiles],
      opacity: 1,
      // traffic dưới flood
      beforeLayerId: undefined
    });
    setOverlayVisibility(map, 'traffic', true);
  } else {
    removeOverlay(map, 'traffic');
  }

  // Weather raster overlay (placeholder)
  const weatherTiles = process.env.NEXT_PUBLIC_WEATHER_TILE_URL;
  if (prefs.overlays.weather && weatherTiles) {
    addOrUpdateRasterOverlay(map, {
      id: 'weather',
      tiles: [weatherTiles],
      opacity: (prefs.opacity?.weather ?? 70) / 100,
      beforeLayerId: undefined
    });
    setOverlayVisibility(map, 'weather', true);
    setOverlayOpacity(map, 'weather', (prefs.opacity?.weather ?? 70) / 100);
  } else {
    removeOverlay(map, 'weather');
  }

  // Flood layer được add/update trong hook useFloodSeverity.
  // Nhưng khi style reset, nếu đã có cache geojson, hook sẽ setData sau.
  // (Nếu bạn muốn rehydrate ngay lập tức, có thể để hook chạy theo enabled)
}
