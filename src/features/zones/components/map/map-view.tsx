'use client';

// import "maplibre-gl/dist/maplibre-gl.css";
import * as React from 'react';
import type maplibregl from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import type { MapLayerPrefs } from '../../map/map.type';
import { getBaseStyle } from '../../map/styles';
import {
  addOrUpdateRasterOverlay,
  removeOverlay,
  setOverlayOpacity,
  setOverlayVisibility
} from '../../map/utils';
import { useFloodSeverity } from '../../hooks/useFloodSeverity';
import { useFloodSeverityData } from '../../hooks/useFloodSeverityData';
import { useAdministrativeAreasMapData } from '../../hooks/useAdministrativeAreasMapData';
import { useAdministrativeAreasLayer } from '../../hooks/useAdministrativeAreasLayer';
import { useSatelliteAnalysisOverlay } from '../../hooks/useSatelliteAnalysisOverlay';
import { pickBestAdminAreaFeature } from '../../lib/pick-admin-area-feature';
import { useFloodStationsStore } from '../../store/flood-stations-store';

import { FloodDetailCard } from '../flood-detail-card';
import { AreaDetailCard } from '../area-detail-card';

// ✅ Flood roads overlay (new)
import {
  ensureFloodRoadsOverlay,
  removeFloodRoadsOverlay
} from './flood-roads';
import type { FloodRoadFC } from '../../mocks/floodRoadMock';
import { startMockFloodFeed } from '../../mocks/floodRoadMock';

type Props = {
  prefs: MapLayerPrefs;
};

const FLOOD_LAYER_ID = 'flood-severity-circle';
const AREA_FILL_LAYER_ID = 'administrative-areas-fill';
const AREA_LINE_LAYER_ID = 'administrative-areas-outline';
const FLOOD_ROADS_MOCK_URL = '/mock/fda_danang_flood_roads_mock.geojson';
const ENABLE_FLOOD_ROADS_MOCK = false;

export default function MapView({ prefs }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);

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
  const [selectedAreaFeature, setSelectedAreaFeature] =
    React.useState<any>(null);
  const [satelliteOverlayFc, setSatelliteOverlayFc] =
    React.useState<FeatureCollection | null>(null);

  const onSatelliteGeoJson = React.useCallback(
    (fc: FeatureCollection | null) => {
      setSatelliteOverlayFc(fc);
    },
    []
  );

  React.useEffect(() => {
    setSatelliteOverlayFc(null);
  }, [selectedAreaFeature]);
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

      const onMouseEnter = () => {
        map.getCanvas().style.cursor = 'pointer';
      };
      const onMouseLeave = () => {
        map.getCanvas().style.cursor = '';
      };

      map.on('mouseenter', FLOOD_LAYER_ID, onMouseEnter);
      map.on('mouseleave', FLOOD_LAYER_ID, onMouseLeave);
      map.on('mouseenter', AREA_FILL_LAYER_ID, onMouseEnter);
      map.on('mouseleave', AREA_FILL_LAYER_ID, onMouseLeave);
      map.on('mouseenter', AREA_LINE_LAYER_ID, onMouseEnter);
      map.on('mouseleave', AREA_LINE_LAYER_ID, onMouseLeave);
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
    prefs.overlays.stations,
    prefs.overlays.traffic, // ✅ traffic toggle => flood roads
    prefs.overlays.weather,
    prefs.opacity?.flood,
    prefs.opacity?.weather
  ]);

  const { data: floodGeojson } = useFloodSeverityData({
    mapRef,
    enabled: prefs.overlays.stations,
    onData: (geojson) => {
      setStationsFromGeojson(geojson);
    }
  });

  const {
    featureCollection: administrativeFc,
    isLoading: isLoadingAdminAreas,
    isError: isAdminAreasError,
    error: adminAreasError,
    canFetch: canFetchAdminAreas
  } = useAdministrativeAreasMapData();

  // Flood severity layer: render only (independent from data fetching)
  useFloodSeverity({
    mapRef,
    enabled: prefs.overlays.stations,
    opacity: (prefs.opacity?.flood ?? 80) / 100,
    data: floodGeojson
  });

  useAdministrativeAreasLayer({
    mapRef,
    enabled: prefs.overlays.adminAreas,
    data: administrativeFc,
    fitBounds: true
  });

  useSatelliteAnalysisOverlay({
    mapRef,
    enabled:
      prefs.overlays.adminAreas &&
      !!satelliteOverlayFc &&
      satelliteOverlayFc.features.length > 0,
    data: satelliteOverlayFc,
    fitBounds: true
  });

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onStationClick = (e: any) => {
      if (!prefs.overlays.stations) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: [FLOOD_LAYER_ID]
      });
      if (features && features.length > 0) {
        setSelectedAreaFeature(null);
        setSelectedFeature(features[0].properties);
      }
    };

    const onAreaClick = (e: any) => {
      if (!prefs.overlays.adminAreas) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: [AREA_FILL_LAYER_ID, AREA_LINE_LAYER_ID]
      });
      if (!features || features.length === 0) return;
      // Nhiều polygon chồng ranh → không dùng features[0] (dễ sai phường / sai areaId).
      const area = pickBestAdminAreaFeature(features as any);
      setSelectedFeature(null);
      setSelectedAreaFeature(area);

      const g = area.geometry;
      if (!g) return;
      const b = boundsFromGeometry(g);
      if (!b) return;
      map.fitBounds(
        [
          [b[0], b[1]],
          [b[2], b[3]]
        ],
        { padding: 60, duration: 800, maxZoom: 14 }
      );
    };

    map.on('click', FLOOD_LAYER_ID, onStationClick);
    map.on('click', AREA_FILL_LAYER_ID, onAreaClick);
    map.on('click', AREA_LINE_LAYER_ID, onAreaClick);

    return () => {
      map.off('click', FLOOD_LAYER_ID, onStationClick);
      map.off('click', AREA_FILL_LAYER_ID, onAreaClick);
      map.off('click', AREA_LINE_LAYER_ID, onAreaClick);
    };
  }, [prefs.overlays.adminAreas, prefs.overlays.stations]);

  return (
    <div className='relative h-full w-full'>
      <div ref={containerRef} className='h-full w-full' />
      {selectedFeature && prefs.overlays.stations && (
        <div className='animate-in slide-in-from-left-4 fade-in absolute top-5 left-4 z-50 duration-300'>
          <FloodDetailCard
            properties={selectedFeature}
            onClose={() => setSelectedFeature(null)}
          />
        </div>
      )}
      {selectedAreaFeature && prefs.overlays.adminAreas && (
        <div className='animate-in slide-in-from-left-4 fade-in absolute top-5 left-4 z-50 duration-300'>
          <AreaDetailCard
            feature={selectedAreaFeature}
            onClose={() => setSelectedAreaFeature(null)}
            onSatelliteGeoJson={onSatelliteGeoJson}
          />
        </div>
      )}

      {canFetchAdminAreas && isLoadingAdminAreas && (
        <div className='bg-background/90 text-muted-foreground absolute bottom-14 left-3 z-50 rounded-lg border px-3 py-1.5 text-xs shadow-md backdrop-blur'>
          Đang tải ranh giới phường/xã (admin areas)…
        </div>
      )}

      {canFetchAdminAreas && isAdminAreasError && (
        <div className='bg-destructive/10 text-destructive border-destructive/30 absolute bottom-14 left-3 z-50 max-w-sm rounded-lg border px-3 py-2 text-xs shadow-md backdrop-blur'>
          Không tải được administrative-areas:{' '}
          {adminAreasError instanceof Error
            ? adminAreasError.message
            : 'Lỗi API'}
        </div>
      )}

      {canFetchAdminAreas &&
        !isLoadingAdminAreas &&
        !isAdminAreasError &&
        administrativeFc.features.length === 0 && (
          <div className='absolute bottom-14 left-3 z-50 max-w-sm rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 shadow-md backdrop-blur dark:text-amber-100'>
            API trả về 0 polygon — kiểm tra field geometry trong JSON hoặc quyền
            admin.
          </div>
        )}
    </div>
  );
}

function boundsFromGeometry(
  geometry: any
): [number, number, number, number] | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const ring = (coords: number[][]) => {
    for (const p of coords) {
      const lng = Number(p?.[0]);
      const lat = Number(p?.[1]);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }
  };

  if (geometry?.type === 'Polygon') {
    for (const r of geometry.coordinates ?? []) ring(r);
  } else if (geometry?.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates ?? []) {
      for (const r of poly ?? []) ring(r);
    }
  }

  if (!Number.isFinite(minLng)) return null;
  return [minLng, minLat, maxLng, maxLat];
}
