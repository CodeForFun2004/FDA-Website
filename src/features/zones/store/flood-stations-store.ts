'use client';

import { create } from 'zustand';
import { getFloodSeverityGeoJSON } from '../api/floodSeverity';
import type { FloodStationProperties } from '../api/floodSeverity';

export type FloodStationSummary = {
  stationId: string;
  stationCode: string;
  stationName: string;
  locationDesc: string;
  roadName: string;
  stationStatus: string;
  latitude: number;
  longitude: number;
  severity?: string;
  severityLevel?: number;
};

type FloodStationsStatus = 'idle' | 'loading' | 'success' | 'error';

type FloodStationsState = {
  stations: FloodStationSummary[];
  status: FloodStationsStatus;
  error: string | null;
  setStationsFromGeojson: (geojson: any) => void;
  fetchStations: (args?: { bounds?: string; zoom?: number }) => Promise<void>;
};

const DEFAULT_BOUNDS = '15.9,107.9,16.2,108.4';
const DEFAULT_ZOOM = 12;

const normalizeStation = (
  properties: FloodStationProperties,
  coordinates: [number, number]
): FloodStationSummary => ({
  stationId: properties.stationId,
  stationCode: properties.stationCode,
  stationName: properties.stationName,
  locationDesc: properties.locationDesc,
  roadName: properties.roadName,
  stationStatus: properties.stationStatus,
  latitude: coordinates[1],
  longitude: coordinates[0],
  severity: properties.severity,
  severityLevel: properties.severityLevel
});

const uniqueByStationId = (items: FloodStationSummary[]) => {
  const map = new Map<string, FloodStationSummary>();
  items.forEach((item) => {
    if (!item.stationId) return;
    map.set(item.stationId, item);
  });
  return Array.from(map.values());
};

export const useFloodStationsStore = create<FloodStationsState>()((set) => ({
  stations: [],
  status: 'idle',
  error: null,

  setStationsFromGeojson: (geojson) => {
    const features = geojson?.features ?? [];
    const mapped = features
      .map((feature: any) => {
        const coordinates = feature?.geometry?.coordinates;
        const properties = feature?.properties as FloodStationProperties;
        if (!properties || !Array.isArray(coordinates)) return null;
        return normalizeStation(properties, coordinates);
      })
      .filter(Boolean) as FloodStationSummary[];

    set({
      stations: uniqueByStationId(mapped),
      status: 'success',
      error: null
    });
  },

  fetchStations: async (args) => {
    set({ status: 'loading', error: null });

    try {
      const geojson = await getFloodSeverityGeoJSON({
        bounds: args?.bounds ?? DEFAULT_BOUNDS,
        zoom: args?.zoom ?? DEFAULT_ZOOM
      });

      const features = geojson?.features ?? [];
      const mapped = features
        .map((feature: any) => {
          const coordinates = feature?.geometry?.coordinates;
          const properties = feature?.properties as FloodStationProperties;
          if (!properties || !Array.isArray(coordinates)) return null;
          return normalizeStation(properties, coordinates);
        })
        .filter(Boolean) as FloodStationSummary[];

      set({
        stations: uniqueByStationId(mapped),
        status: 'success',
        error: null
      });
    } catch (error: any) {
      set({
        status: 'error',
        error: error?.message ?? 'Failed to fetch flood stations'
      });
      throw error;
    }
  }
}));
