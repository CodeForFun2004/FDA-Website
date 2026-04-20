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
import { useStationsMapLayerData } from '../../hooks/useStationsMapLayerData';
import { useAdministrativeAreasMapData } from '../../hooks/useAdministrativeAreasMapData';
import { useAdministrativeAreasLayer } from '../../hooks/useAdministrativeAreasLayer';
import { useCommunityReportsMapData } from '../../hooks/useCommunityReportsMapData';
import {
  useCommunityReportsLayer,
  COMMUNITY_REPORTS_LAYER_ID
} from '../../hooks/useCommunityReportsLayer';
import { useSatelliteAnalysisOverlay } from '../../hooks/useSatelliteAnalysisOverlay';
import { usePredictFloodOverlay } from '../../hooks/usePredictFloodOverlay';
import { pickBestAdminAreaFeature } from '../../lib/pick-admin-area-feature';
import { useFloodStationsStore } from '../../store/flood-stations-store';

import { FloodDetailCard } from '../flood-detail-card';
import { AreaDetailCard } from '../area-detail-card';
import { CommunityReportCard } from '../community-report-card';
import LegendFlood from './legend-flood';
import type { CommunityFloodReport } from '../../api/flood-reports-community.api';
import { StationHoverCard } from './station-hover-card';
import { useStationRealtimeFromMap } from '@/features/stations/hooks/useStationRealtimeFromMap';
import type { FloodFeatureProperties } from '../../api/flood-severity.api';

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
const FLOOD_CRITICAL_LAYER_ID = 'flood-severity-critical-radius';
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
  const [selectedFeature, setSelectedFeature] = React.useState<{
    properties: any;
    stationLike: {
      id: string;
      code: string;
      latitude: number;
      longitude: number;
    } | null;
  } | null>(null);
  const selectedStationIdRef = React.useRef<string | null>(null);
  const hoveredStationIdRef = React.useRef<string | null>(null);
  const hoverRafRef = React.useRef<number | null>(null);
  const hoverPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const [hoverUi, setHoverUi] = React.useState<{
    point: { x: number; y: number };
    properties: FloodFeatureProperties;
    stationLike: {
      id: string;
      code: string;
      latitude: number;
      longitude: number;
    } | null;
  } | null>(null);
  const [hoverStationStable, setHoverStationStable] = React.useState<{
    id: string;
    code: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedAreaFeature, setSelectedAreaFeature] =
    React.useState<any>(null);
  const [satelliteOverlayFc, setSatelliteOverlayFc] =
    React.useState<FeatureCollection | null>(null);
  const [predictOverlayFc, setPredictOverlayFc] =
    React.useState<FeatureCollection | null>(null);
  const [selectedCommunityReport, setSelectedCommunityReport] =
    React.useState<CommunityFloodReport | null>(null);

  const onSatelliteGeoJson = React.useCallback(
    (fc: FeatureCollection | null) => {
      setSatelliteOverlayFc(fc);
    },
    []
  );

  const onPredictGeoJson = React.useCallback((fc: FeatureCollection | null) => {
    setPredictOverlayFc(fc);
  }, []);

  React.useEffect(() => {
    setSatelliteOverlayFc(null);
    setPredictOverlayFc(null);
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
    prefs.overlays.communityReports,
    prefs.overlays.traffic, // ✅ traffic toggle => flood roads
    prefs.overlays.weather,
    prefs.opacity?.flood,
    prefs.opacity?.weather
  ]);

  const { data: floodGeojson } = useStationsMapLayerData({
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
  } = useAdministrativeAreasMapData(prefs.overlays.adminAreas);

  const communityReportsQuery = useCommunityReportsMapData(
    prefs.overlays.communityReports
  );

  useCommunityReportsLayer({
    mapRef,
    enabled: prefs.overlays.communityReports,
    data: communityReportsQuery.featureCollection
  });

  // Flood severity layer: render only (independent from data fetching)
  useFloodSeverity({
    mapRef,
    enabled: prefs.overlays.stations,
    opacity: (prefs.opacity?.flood ?? 80) / 100,
    data: floodGeojson
  });

  // Debounce hover realtime fetch to avoid spamming network while mouse moves across markers.
  React.useEffect(() => {
    if (!hoverUi?.stationLike) {
      setHoverStationStable(null);
      return;
    }
    const t = setTimeout(() => {
      setHoverStationStable(hoverUi.stationLike);
    }, 220);
    return () => clearTimeout(t);
  }, [hoverUi?.stationLike]);

  const stationRealtime = useStationRealtimeFromMap({
    station: hoverStationStable,
    enabled: !!hoverStationStable,
    zoom: 14,
    radiusKm: 2,
    pollMs: 30000
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

  usePredictFloodOverlay({
    mapRef,
    enabled: !!predictOverlayFc && predictOverlayFc.features.length > 0,
    data: predictOverlayFc,
    opacity: 0.28
  });

  /** Stations (dưới) → Community 🚩 (giữa) → Admin (trên). */
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const reorder = () => {
      if (!map.isStyleLoaded()) return;
      try {
        if (
          map.getLayer(COMMUNITY_REPORTS_LAYER_ID) &&
          map.getLayer(AREA_FILL_LAYER_ID)
        ) {
          map.moveLayer(COMMUNITY_REPORTS_LAYER_ID, AREA_FILL_LAYER_ID);
        }
        if (
          map.getLayer('flood-zone-fill') &&
          map.getLayer(COMMUNITY_REPORTS_LAYER_ID)
        ) {
          map.moveLayer('flood-zone-fill', COMMUNITY_REPORTS_LAYER_ID);
        }
        if (
          map.getLayer('flood-zone-outline') &&
          map.getLayer(COMMUNITY_REPORTS_LAYER_ID)
        ) {
          map.moveLayer('flood-zone-outline', COMMUNITY_REPORTS_LAYER_ID);
        }
        if (
          map.getLayer(FLOOD_LAYER_ID) &&
          map.getLayer(COMMUNITY_REPORTS_LAYER_ID)
        ) {
          map.moveLayer(FLOOD_LAYER_ID, COMMUNITY_REPORTS_LAYER_ID);
        }
        if (
          map.getLayer(FLOOD_CRITICAL_LAYER_ID) &&
          map.getLayer(COMMUNITY_REPORTS_LAYER_ID)
        ) {
          map.moveLayer(FLOOD_CRITICAL_LAYER_ID, COMMUNITY_REPORTS_LAYER_ID);
        }
      } catch {
        /* layer có thể chưa tạo */
      }
    };
    map.on('idle', reorder);
    queueMicrotask(reorder);
    return () => {
      map.off('idle', reorder);
    };
  }, [
    prefs.overlays.stations,
    prefs.overlays.communityReports,
    prefs.overlays.adminAreas
  ]);

  React.useEffect(() => {
    if (!prefs.overlays.communityReports) setSelectedCommunityReport(null);
  }, [prefs.overlays.communityReports]);

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
        setSelectedCommunityReport(null);
        const f = features[0];
        const props = f.properties;
        const nextId =
          String(props?.stationId ?? props?.id ?? '').trim() || null;
        const nextCode =
          String(props?.stationCode ?? props?.code ?? '').trim() || '';
        const coords = (f as any)?.geometry?.coordinates as
          | [number, number]
          | undefined;
        const longitude = Array.isArray(coords) ? Number(coords[0]) : NaN;
        const latitude = Array.isArray(coords) ? Number(coords[1]) : NaN;

        // Clear previous selected feature-state
        const prevId = selectedStationIdRef.current;
        if (prevId) {
          try {
            map.setFeatureState(
              { source: 'flood-severity', id: prevId },
              { selected: false }
            );
          } catch {
            /* ignore */
          }
        }
        selectedStationIdRef.current = nextId;
        if (nextId) {
          try {
            map.setFeatureState(
              { source: 'flood-severity', id: nextId },
              { selected: true }
            );
          } catch {
            /* ignore */
          }
        }

        setSelectedFeature({
          properties: props,
          stationLike:
            nextId &&
            nextCode &&
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
              ? { id: nextId, code: nextCode, latitude, longitude }
              : null
        });
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
      setSelectedCommunityReport(null);
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

    const onCommunityClick = (e: any) => {
      if (!prefs.overlays.communityReports) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: [COMMUNITY_REPORTS_LAYER_ID]
      });
      if (!features?.length) return;
      const id = String(features[0].properties?.id ?? '');
      const list = communityReportsQuery.data ?? [];
      const row = list.find((r) => r.id === id);
      if (!row) return;
      setSelectedFeature(null);
      setSelectedAreaFeature(null);
      setSelectedCommunityReport(row);
    };

    map.on('click', FLOOD_LAYER_ID, onStationClick);
    map.on('click', AREA_FILL_LAYER_ID, onAreaClick);
    map.on('click', AREA_LINE_LAYER_ID, onAreaClick);
    map.on('click', COMMUNITY_REPORTS_LAYER_ID, onCommunityClick);

    return () => {
      map.off('click', FLOOD_LAYER_ID, onStationClick);
      map.off('click', AREA_FILL_LAYER_ID, onAreaClick);
      map.off('click', AREA_LINE_LAYER_ID, onAreaClick);
      map.off('click', COMMUNITY_REPORTS_LAYER_ID, onCommunityClick);
    };
  }, [
    prefs.overlays.adminAreas,
    prefs.overlays.stations,
    prefs.overlays.communityReports,
    communityReportsQuery.data
  ]);

  // Hover preview for station markers (desktop only behavior)
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const clearHover = () => {
      const prevId = hoveredStationIdRef.current;
      if (prevId) {
        try {
          map.setFeatureState(
            { source: 'flood-severity', id: prevId },
            { hover: false }
          );
        } catch {
          /* ignore */
        }
      }
      hoveredStationIdRef.current = null;
      setHoverUi(null);
    };

    if (!prefs.overlays.stations) {
      clearHover();
      return;
    }

    const scheduleHoverUiCommit = () => {
      if (hoverRafRef.current != null) return;
      hoverRafRef.current = requestAnimationFrame(() => {
        hoverRafRef.current = null;
        const p = hoverPointRef.current;
        if (!p) return;
        setHoverUi((prev) => (prev ? { ...prev, point: p } : prev));
      });
    };

    const onMove = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [FLOOD_LAYER_ID]
      });
      if (!features?.length) {
        clearHover();
        return;
      }

      const f = features[0] as any;
      const props = (f.properties ?? {}) as FloodFeatureProperties;
      const stationId = String(props.stationId ?? props.id ?? '').trim();
      const stationCode = String(props.stationCode ?? props.code ?? '').trim();
      const coords = f.geometry?.coordinates as [number, number] | undefined;
      const longitude = Array.isArray(coords) ? Number(coords[0]) : NaN;
      const latitude = Array.isArray(coords) ? Number(coords[1]) : NaN;

      // Update hover feature-state only when station changes
      if (stationId && stationId !== hoveredStationIdRef.current) {
        const prevId = hoveredStationIdRef.current;
        if (prevId) {
          try {
            map.setFeatureState(
              { source: 'flood-severity', id: prevId },
              { hover: false }
            );
          } catch {
            /* ignore */
          }
        }
        hoveredStationIdRef.current = stationId;
        try {
          map.setFeatureState(
            { source: 'flood-severity', id: stationId },
            { hover: true }
          );
        } catch {
          /* ignore */
        }

        if (
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          stationId &&
          stationCode
        ) {
          setHoverUi({
            point: { x: e.point.x, y: e.point.y },
            properties: props,
            stationLike: {
              id: stationId,
              code: stationCode,
              latitude,
              longitude
            }
          });
        } else {
          setHoverUi({
            point: { x: e.point.x, y: e.point.y },
            properties: props,
            stationLike: null
          });
        }
      }

      hoverPointRef.current = { x: e.point.x, y: e.point.y };
      scheduleHoverUiCommit();
    };

    const onLeave = () => clearHover();

    map.on('mousemove', FLOOD_LAYER_ID, onMove);
    map.on('mouseleave', FLOOD_LAYER_ID, onLeave);

    return () => {
      map.off('mousemove', FLOOD_LAYER_ID, onMove);
      map.off('mouseleave', FLOOD_LAYER_ID, onLeave);
      if (hoverRafRef.current != null)
        cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = null;
    };
  }, [prefs.overlays.stations]);

  // When turning off stations overlay, clear selection + feature-states.
  React.useEffect(() => {
    if (prefs.overlays.stations) return;
    const map = mapRef.current;
    if (map) {
      const selectedId = selectedStationIdRef.current;
      if (selectedId) {
        try {
          map.setFeatureState(
            { source: 'flood-severity', id: selectedId },
            { selected: false }
          );
        } catch {
          /* ignore */
        }
      }
      const hoverId = hoveredStationIdRef.current;
      if (hoverId) {
        try {
          map.setFeatureState(
            { source: 'flood-severity', id: hoverId },
            { hover: false }
          );
        } catch {
          /* ignore */
        }
      }
    }
    selectedStationIdRef.current = null;
    hoveredStationIdRef.current = null;
    setSelectedFeature(null);
    setHoverUi(null);
    setHoverStationStable(null);
  }, [prefs.overlays.stations]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = '';
    };
    map.on('mouseenter', COMMUNITY_REPORTS_LAYER_ID, onEnter);
    map.on('mouseleave', COMMUNITY_REPORTS_LAYER_ID, onLeave);
    return () => {
      map.off('mouseenter', COMMUNITY_REPORTS_LAYER_ID, onEnter);
      map.off('mouseleave', COMMUNITY_REPORTS_LAYER_ID, onLeave);
    };
  }, [prefs.overlays.communityReports]);

  return (
    <div className='relative h-full w-full'>
      <div ref={containerRef} className='h-full w-full' />
      <div className='pointer-events-none absolute bottom-3 left-3 z-40'>
        <LegendFlood
          key={prefs.overlays.stations ? 'legend-on' : 'legend-off'}
          visible={prefs.overlays.stations}
        />
      </div>
      {selectedFeature && prefs.overlays.stations && (
        <div className='animate-in slide-in-from-left-4 fade-in absolute top-5 left-4 z-50 duration-300'>
          <FloodDetailCard
            properties={selectedFeature.properties}
            stationLike={selectedFeature.stationLike}
            onClose={() => {
              const map = mapRef.current;
              const prevId = selectedStationIdRef.current;
              if (map && prevId) {
                try {
                  map.setFeatureState(
                    { source: 'flood-severity', id: prevId },
                    { selected: false }
                  );
                } catch {
                  /* ignore */
                }
              }
              selectedStationIdRef.current = null;
              setSelectedFeature(null);
            }}
          />
        </div>
      )}

      {hoverUi && prefs.overlays.stations && (
        <StationHoverCard
          x={hoverUi.point.x}
          y={hoverUi.point.y}
          properties={hoverUi.properties}
          realtime={{
            isLoading: stationRealtime.isLoading,
            error: stationRealtime.error,
            refreshedAt: stationRealtime.refreshedAt,
            waterLevel:
              stationRealtime.properties?.waterLevel ??
              hoverUi.properties.waterLevel,
            unit: stationRealtime.properties?.unit ?? hoverUi.properties.unit,
            measuredAt:
              stationRealtime.properties?.measuredAt ??
              hoverUi.properties.measuredAt,
            stationStatus:
              stationRealtime.properties?.stationStatus ??
              hoverUi.properties.stationStatus,
            severity:
              stationRealtime.properties?.severity ??
              (hoverUi.properties as any).severity,
            alertLevel:
              stationRealtime.properties?.alertLevel ??
              hoverUi.properties.alertLevel
          }}
        />
      )}
      {selectedAreaFeature && prefs.overlays.adminAreas && (
        <div className='animate-in slide-in-from-left-4 fade-in absolute top-5 left-4 z-50 duration-300'>
          <AreaDetailCard
            feature={selectedAreaFeature}
            onClose={() => setSelectedAreaFeature(null)}
            onSatelliteGeoJson={onSatelliteGeoJson}
            onPredictGeoJson={onPredictGeoJson}
          />
        </div>
      )}
      {selectedCommunityReport && prefs.overlays.communityReports && (
        <div className='animate-in slide-in-from-left-4 fade-in absolute top-5 left-4 z-50 duration-300'>
          <CommunityReportCard
            report={selectedCommunityReport}
            onClose={() => setSelectedCommunityReport(null)}
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
