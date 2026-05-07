/**
 * Làm mượt vòng Polygon WGS84: densify các cạnh dài + Chaikin (đóng vòng).
 * Dùng lúc build GeoJSON cố định (import module), không nhằm chỉnh sửa realtime.
 */

export type LngLat = [number, number];

function cross(o: LngLat, a: LngLat, b: LngLat) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function uniqPoints(points: LngLat[]) {
  const seen = new Set<string>();
  const out: LngLat[] = [];
  for (const p of points) {
    const k = `${p[0].toFixed(9)},${p[1].toFixed(9)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

/**
 * Convex hull (Monotonic chain) trên mặt phẳng lng/lat.
 * Trả về ring đóng (điểm cuối lặp lại điểm đầu) theo chiều CCW.
 */
export function convexHullClosedRing(points: LngLat[]): LngLat[] {
  const pts = uniqPoints(points)
    .slice()
    .sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  if (pts.length <= 2) {
    const r = pts.slice();
    if (r.length === 1) r.push(r[0]);
    if (r.length === 2) r.push(r[0]);
    return r;
  }

  const lower: LngLat[] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: LngLat[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  // last point of each list is the starting point of the other list
  upper.pop();
  lower.pop();
  const hull = lower.concat(upper);
  hull.push(hull[0]);
  return hull;
}

function ringOpen(ring: LngLat[]): LngLat[] {
  if (ring.length < 2) return ring.slice();
  const a = ring[0];
  const b = ring[ring.length - 1];
  if (a[0] === b[0] && a[1] === b[1]) return ring.slice(0, -1);
  return ring.slice();
}

/** Chèn điểm trên mỗi cạnh nếu cạnh dài hơn maxSegmentDeg (độ,tổng hợp Euclidean). */
export function densifyClosedRing(
  ring: LngLat[],
  maxSegmentDeg = 0.4
): LngLat[] {
  const pts = ringOpen(ring);
  if (pts.length < 3) return ring.slice();
  const out: LngLat[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    out.push(a);
    const dLng = b[0] - a[0];
    const dLat = b[1] - a[1];
    const len = Math.hypot(dLng, dLat);
    if (len < 1e-9) continue;
    const steps = Math.max(1, Math.ceil(len / maxSegmentDeg));
    for (let k = 1; k < steps; k++) {
      const t = k / steps;
      out.push([a[0] + dLng * t, a[1] + dLat * t]);
    }
  }
  return out;
}

/** Chaikin trên polygon đã mở (không điểm lặp cuối). */
export function chaikinClosedOpenRing(
  openRing: LngLat[],
  iterations: number
): LngLat[] {
  let r = openRing;
  if (r.length < 3) return r;
  for (let it = 0; it < iterations; it++) {
    const next: LngLat[] = [];
    const n = r.length;
    for (let i = 0; i < n; i++) {
      const p0 = r[i];
      const p1 = r[(i + 1) % n];
      next.push([p0[0] * 0.75 + p1[0] * 0.25, p0[1] * 0.75 + p1[1] * 0.25]);
      next.push([p0[0] * 0.25 + p1[0] * 0.75, p0[1] * 0.25 + p1[1] * 0.75]);
    }
    r = next;
  }
  return r;
}

export function smoothClosedRing(
  controlRing: LngLat[],
  opts?: { maxSegmentDeg?: number; chaikinIterations?: number }
): LngLat[] {
  const maxSegmentDeg = opts?.maxSegmentDeg ?? 0.38;
  const chaikinIterations = opts?.chaikinIterations ?? 2;
  let open = ringOpen(controlRing);
  if (open.length < 3) {
    open.push(open[0]);
    return [...open];
  }
  open = densifyClosedRing(open, maxSegmentDeg);
  const smoothed = chaikinClosedOpenRing(open, chaikinIterations);
  smoothed.push(smoothed[0]);
  return smoothed;
}

/** Vòng đa giác đều (kỳ dị) trong mặt phẳng lng/lat — chỉ để bọc ô minh họa. */
export function regularNGon(
  center: LngLat,
  rx: number,
  ry: number,
  n = 10
): LngLat[] {
  const [cx, cy] = center;
  const out: LngLat[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    out.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]);
  }
  out.push(out[0]);
  return out;
}
