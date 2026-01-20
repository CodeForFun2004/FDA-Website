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
import { useFloodStationsStore } from '../../store/flood-stations-store';

import { FloodDetailCard } from '../FloodDetailCard';

// ✅ Flood roads overlay (new)
import {
  ensureFloodRoadsOverlay,
  removeFloodRoadsOverlay
} from '../map/floodRoads';
import type { FloodRoadFC } from '../../mocks/floodRoadMock';
import { startMockFloodFeed } from '../../mocks/floodRoadMock';

type Props = {
  prefs: MapLayerPrefs;
};

const FLOOD_LAYER_ID = 'flood-severity-circle';
const FLOOD_ROADS_MOCK_URL = '/mock/fda_danang_flood_roads_mock.geojson';
const ENABLE_FLOOD_ROADS_MOCK = true; // <-- đổi false nếu chưa muốn random realtime

export default function MapView({ prefs }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);

  // giữ cache flood severity geojson để rehydrate khi setStyle
  const floodDataCacheRef = React.useRef<any>(null);

  // ✅ giữ cache flood roads geojson để rehydrate khi setStyle
  const floodRoadsCacheRef = React.useRef<FloodRoadFC | null>(null);
  const floodRoadsLoadingRef = React.useRef(false);
  const stopFloodRoadsMockRef = React.useRef<null | (() => void)>(null);

  // prefsRef để handler map.on('load') luôn dùng prefs mới nhất
  const prefsRef = React.useRef(prefs);
  React.useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  // Interaction state
  const [selectedFeature, setSelectedFeature] = React.useState<any>(null);
  const setStationsFromGeojson = useFloodStationsStore(
    (state) => state.setStationsFromGeojson
  );

  async function loadFloodRoadsOnce(): Promise<FloodRoadFC | null> {
    if (floodRoadsCacheRef.current) return floodRoadsCacheRef.current;
    if (floodRoadsLoadingRef.current) return null;

    floodRoadsLoadingRef.current = true;
    try {
      const res = await fetch(FLOOD_ROADS_MOCK_URL);
      if (!res.ok) throw new Error('Failed to load flood roads mock');
      const json = (await res.json()) as FloodRoadFC;
      floodRoadsCacheRef.current = json;
      return json;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      floodRoadsLoadingRef.current = false;
    }
  }

  function applyFloodRoads(map: maplibregl.Map, nextPrefs: MapLayerPrefs) {
    // mapping: prefs.overlays.traffic === showFloodRoads
    const enabled = nextPrefs.overlays.traffic;

    if (!enabled) {
      // stop mock if running
      if (stopFloodRoadsMockRef.current) {
        stopFloodRoadsMockRef.current();
        stopFloodRoadsMockRef.current = null;
      }
      // remove overlay
      removeFloodRoadsOverlay(map);
      return;
    }

    // enabled: ensure overlay (sync if cached, else load async)
    const cached = floodRoadsCacheRef.current;
    if (cached) {
      // insert below flood circles if they exist, otherwise default placement
      const beforeId = map.getLayer(FLOOD_LAYER_ID)
        ? FLOOD_LAYER_ID
        : undefined;
      ensureFloodRoadsOverlay(map, cached, { beforeLayerId: beforeId });
    } else {
      // load then ensure
      void loadFloodRoadsOnce().then((data) => {
        const m = mapRef.current;
        if (!m || !data) return;
        const beforeId = m.getLayer(FLOOD_LAYER_ID)
          ? FLOOD_LAYER_ID
          : undefined;
        ensureFloodRoadsOverlay(m, data, { beforeLayerId: beforeId });
      });
    }

    // start mock realtime (random) if wanted
    if (ENABLE_FLOOD_ROADS_MOCK && !stopFloodRoadsMockRef.current) {
      void loadFloodRoadsOnce().then((initial) => {
        const m = mapRef.current;
        if (!m || !initial) return;

        // ensure once before starting
        const beforeId = m.getLayer(FLOOD_LAYER_ID)
          ? FLOOD_LAYER_ID
          : undefined;
        ensureFloodRoadsOverlay(m, initial, { beforeLayerId: beforeId });

        stopFloodRoadsMockRef.current = startMockFloodFeed({
          initial,
          intervalMs: 2000,
          changeRate: 0.12,
          onUpdate: (next) => {
            // update cache
            floodRoadsCacheRef.current = next;

            const mm = mapRef.current;
            if (!mm) return;

            // style reset có thể làm mất source/layer -> ensure lại trước khi setData
            const bId = mm.getLayer(FLOOD_LAYER_ID)
              ? FLOOD_LAYER_ID
              : undefined;
            ensureFloodRoadsOverlay(mm, next, { beforeLayerId: bId });
          }
        });
      });
    }
  }

  function applyOverlays(map: maplibregl.Map, nextPrefs: MapLayerPrefs) {
    // ✅ Flood Roads (mapped to "Traffic" toggle)
    applyFloodRoads(map, nextPrefs);

    // Weather raster overlay (giữ nguyên)
    const weatherTiles = process.env.NEXT_PUBLIC_WEATHER_TILE_URL;
    if (nextPrefs.overlays.weather && weatherTiles) {
      addOrUpdateRasterOverlay(map, {
        id: 'weather',
        tiles: [weatherTiles],
        opacity: (nextPrefs.opacity?.weather ?? 70) / 100,
        beforeLayerId: undefined
      });
      setOverlayVisibility(map, 'weather', true);
      setOverlayOpacity(
        map,
        'weather',
        (nextPrefs.opacity?.weather ?? 70) / 100
      );
    } else {
      removeOverlay(map, 'weather');
    }

    // Flood severity layer add/update trong hook useFloodSeverity (giữ nguyên)
  }

  // Init map
  React.useEffect(() => {
    let mounted = true;

    async function init() {
      if (!containerRef.current || mapRef.current) return;

      const maplibre = await import('maplibre-gl');
      if (!mounted) return;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: getBaseStyle(prefsRef.current.baseMap),
        center: [108.2022, 16.0544], // Đà Nẵng
        zoom: 12
      });

      mapRef.current = map;

      map.addControl(
        new maplibre.NavigationControl({ visualizePitch: true }),
        'bottom-right'
      );

      map.on('load', () => {
        applyOverlays(map, prefsRef.current);
      });

      // Bind interactions for Flood severity circles
      const onClick = (e: any) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [FLOOD_LAYER_ID]
        });
        if (features && features.length > 0) {
          setSelectedFeature(features[0].properties);
        }
      };

      const onMouseEnter = () => {
        map.getCanvas().style.cursor = 'pointer';
      };
      const onMouseLeave = () => {
        map.getCanvas().style.cursor = '';
      };

      map.on('click', FLOOD_LAYER_ID, onClick);
      map.on('mouseenter', FLOOD_LAYER_ID, onMouseEnter);
      map.on('mouseleave', FLOOD_LAYER_ID, onMouseLeave);
    }

    init();

    return () => {
      mounted = false;
      if (stopFloodRoadsMockRef.current) {
        stopFloodRoadsMockRef.current();
        stopFloodRoadsMockRef.current = null;
      }
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

    map.setStyle(nextStyle as any);

    const onStyleLoad = () => {
      applyOverlays(map, prefsRef.current);
    };

    map.once('style.load', onStyleLoad);
  }, [prefs.baseMap]);

  // Apply overlay toggles + opacity (không cần setStyle)
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    applyOverlays(map, prefs);
  }, [
    prefs.overlays.flood,
    prefs.overlays.traffic, // ✅ traffic toggle => flood roads
    prefs.overlays.weather,
    prefs.opacity?.flood,
    prefs.opacity?.weather
  ]);

  // Flood severity hook: fetch + update geojson source
  useFloodSeverity({
    mapRef,
    enabled: prefs.overlays.flood,
    opacity: (prefs.opacity?.flood ?? 80) / 100,
    onData: (geojson) => {
      floodDataCacheRef.current = geojson;
      setStationsFromGeojson(geojson);
    }
  });

  return (
    <div className='relative h-full w-full'>
      <div ref={containerRef} className='h-full w-full' />
      {selectedFeature && (
        <div className='animate-in slide-in-from-left-4 fade-in absolute top-5 left-4 z-50 duration-300'>
          <FloodDetailCard
            properties={selectedFeature}
            onClose={() => setSelectedFeature(null)}
          />
        </div>
      )}
    </div>
  );
}
