/**
 * Mock flood updates for FDA - Da Nang
 * - Works with GeoJSON FeatureCollection<LineString>
 * - Call map.getSource(SOURCE_ID).setData(updated)
 */
import type { FeatureCollection, Feature, LineString } from 'geojson';

export type FloodRoadProps = {
  segment_id: string;
  osm_id?: number;
  road_name?: string;
  road_class?: string;
  depth_cm: number; // water depth
  level: 0 | 1 | 2 | 3 | 4;
  status: 'dry' | 'warning' | 'flooded' | 'impassable';
  confidence?: number;
  sensor_count?: number;
  updated_at: string; // ISO
};

type FloodRoadFeature = Feature<LineString, FloodRoadProps>;
export type FloodRoadFC = FeatureCollection<LineString, FloodRoadProps>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function levelFromDepth(depth: number): FloodRoadProps['level'] {
  if (depth <= 0) return 0;
  if (depth <= 15) return 1;
  if (depth <= 30) return 2;
  if (depth <= 60) return 3;
  return 4;
}

function statusFromLevel(
  level: FloodRoadProps['level']
): FloodRoadProps['status'] {
  if (level === 0) return 'dry';
  if (level === 1) return 'warning';
  if (level === 4) return 'impassable';
  return 'flooded';
}

export function mutateFloodRoads(
  fc: FloodRoadFC,
  opts?: { changeRate?: number; maxDeltaCm?: number }
): FloodRoadFC {
  const changeRate = opts?.changeRate ?? 0.12; // 12% segments change each tick
  const maxDeltaCm = opts?.maxDeltaCm ?? 20;

  const now = new Date().toISOString();

  const features = fc.features.map((f) => {
    const props = { ...f.properties } as FloodRoadProps;

    // small drift for most segments, larger jumps for a subset
    const willChange = Math.random() < changeRate;

    let depth = props.depth_cm ?? 0;
    if (willChange) {
      const delta = (Math.random() * 2 - 1) * maxDeltaCm; // [-maxDelta, +maxDelta]
      depth = clamp(Math.round(depth + delta), 0, 120);
    } else {
      // slow decay towards 0 to mimic water receding
      depth = clamp(Math.round(depth - Math.random() * 3), 0, 120);
    }

    const level = levelFromDepth(depth);
    const status = statusFromLevel(level);

    return {
      ...f,
      properties: {
        ...props,
        depth_cm: depth,
        level,
        status,
        updated_at: now
      }
    } satisfies FloodRoadFeature;
  });

  return { ...fc, features };
}

/**
 * Client-side mock “realtime” loop.
 * - You can swap setInterval => requestAnimationFrame if you want smoother.
 */
export function startMockFloodFeed(args: {
  initial: FloodRoadFC;
  onUpdate: (next: FloodRoadFC) => void;
  intervalMs?: number;
  changeRate?: number;
}) {
  const intervalMs = args.intervalMs ?? 2000;
  let current = args.initial;

  const timer = setInterval(() => {
    current = mutateFloodRoads(current, { changeRate: args.changeRate });
    args.onUpdate(current);
  }, intervalMs);

  return () => clearInterval(timer);
}
