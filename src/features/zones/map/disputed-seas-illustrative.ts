import type { FeatureCollection } from 'geojson';
import type { GeoJSONSource, Map } from 'maplibre-gl';
import { convexHullClosedRing, smoothClosedRing } from './disputed-seas-smooth';
import { VN_NAME_OVERRIDE_LAYER_ID } from './styles';

type Bounds = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};

/**
 * Vỏ bọc HS: chỉ 1 viền ngoài (không polygon phụ), nới Đông–Nam để ăn đủ khoanh vùng gốc
 * và che raster label khi zoom gần.
 */
const PARACELS_POINTS: Array<[number, number]> = [
  // anchors
  [110.7, 15.1],
  [110.86, 15.22],
  [111.02, 15.36],
  [111.1, 15.5],
  [111.08, 17.28],
  [110.72, 16.62],
  [113.22, 17.58],
  [112.38, 17.78],
  [113.86, 17.08],
  [114.06, 16.68],
  [114.02, 16.08],
  [113.72, 15.78],
  // user clicks
  [111.5963187653349, 15.648659767574244],
  [112.23029118905953, 15.707372010238231],
  [111.61838700599827, 15.65639650200032],
  [112.22258093272404, 15.693381344075746]
];

/**
 * TS: chỉ 1 hull lớn (không vòng tròn), thu mép Nam để không “ăn quá lố” land/island,
 * vẫn kéo đủ Tây để che nhãn Trung.
 */
const SPRATLYS_POINTS: Array<[number, number]> = [
  // anchors (bao vùng lớn)
  [116.82, 9.72],
  [116.74, 10.88],
  [116.22, 11.72],
  [115.48, 12.28],
  [114.62, 12.52],
  [113.78, 12.18],
  [113.08, 11.48],
  [112.76, 10.25],
  [115.55, 8.56],
  [116.45, 8.92],
  // user click clusters (SW + south edge + mid)
  [112.18422080212707, 8.786318799375977], // Khánh Hòa trên biển
  // gap points (user): lấp khoảng trống tây-nam
  [111.65196478648045, 8.754240270246086],
  [111.92016090500897, 8.507232168838428],
  [111.57461186637101, 8.623741321949495],
  [111.95365341791762, 8.474968749921501],
  // curve points (user): bám theo cung trái để không hở
  [111.65916497406874, 8.839651749812646],
  [111.59280351299924, 8.521152977161634],
  [111.95442538780975, 8.46978777750843],
  [111.57549182750466, 8.745556437239344],
  [111.55337134048148, 8.643830732506814],
  [111.78130853284773, 8.503080821072743],
  // curve points (user v2): tăng mật độ cung để ăn hết vùng trống
  [111.61576755282863, 8.843967644992205],
  [111.5701850799939, 8.793016643760097],
  [111.5044267585256, 8.718423564194993],
  [111.4984487293018, 8.645293118826402],
  [111.51040478775104, 8.584709673828812],
  [111.56943782634096, 8.516726493624915],
  [111.66135002566506, 8.479774039819418],
  [111.71664679598837, 8.48568667161338],
  [111.8369546341288, 8.473122220318572],
  [111.90420746290141, 8.450209517543996],
  [111.97370205263456, 8.459818236266884],
  // curve points (user v3): nới thêm chút cuối cùng để kín hẳn
  [111.88206026075807, 8.450742451080359],
  [111.91556099199295, 8.446365841422747],
  [111.95569866054876, 8.450429837751699],
  [111.54018627345926, 8.80701563585481],
  [111.51830052760602, 8.763757700007929],
  [111.48892755290751, 8.707400998606602],
  [111.4877756715469, 8.63907846666585],
  [111.50275012923635, 8.58213356204196],
  [111.53500280733641, 8.543975693405145],
  [111.58107806176537, 8.501826744994219],
  [111.63809618912154, 8.479041598186427],
  [111.66631728245943, 8.475054058508292],
  // curve points (user v4): chặn “liếm” sát cung
  [111.52849036079061, 8.794264316928007],
  [111.51628213281128, 8.773973122486652],
  [111.50074438811066, 8.748744685680649],
  [111.48964599903854, 8.720772029201584],
  [111.48576156286367, 8.692248732297813],
  [111.47799269051399, 8.659334538558909],
  [111.48631648231725, 8.62367424585878],
  [111.49408535466819, 8.589656675778926],
  [111.51350753554357, 8.558379765970216],
  [111.53071003860487, 8.534783203236131],
  [111.55734617237772, 8.511733989747157],
  [111.5950806952228, 8.489232228411723],
  [111.89779981438681, 8.448134522322718],
  [111.91423416556717, 8.446656698920833],
  [111.93559882210116, 8.446361133561183],
  [112.69248151851758, 9.532329738262533],
  [114.1830343859661, 8.516153292747873],
  [111.8192845028857, 8.653639486187117],
  [112.15299036873108, 8.950437350501474],
  // additional latest clicks
  [112.68288505523901, 9.545263412001006],
  [111.7789911968818, 8.655866630928926],
  [112.05939688175687, 8.648123202309293],
  [112.14242202867496, 8.999512283679522],
  [112.36016722530997, 9.058302157233996],
  [112.18628437044453, 8.663609900237972],
  [112.33353651780845, 8.490122709446766],
  [114.23064796828618, 8.547033236546852]
];

// loại điểm lạc vĩ độ nếu có (bảo vệ data input)
const SPRATLYS_POINTS_FILTERED = SPRATLYS_POINTS.filter((p) => p[1] < 13);

const PARACELS_HULL = convexHullClosedRing(PARACELS_POINTS);
const PARACELS_EXTERIOR = smoothClosedRing(PARACELS_HULL, {
  maxSegmentDeg: 0.36,
  chaikinIterations: 2
});

const SPRATLYS_HULL = convexHullClosedRing(SPRATLYS_POINTS_FILTERED);
const SPRATLYS_EXTERIOR = smoothClosedRing(SPRATLYS_HULL, {
  maxSegmentDeg: 0.22,
  chaikinIterations: 3
});

// Khoét 2 đảo (medium): chỉ tác động fill, viền tím chỉ vẽ outer ring.
const SPRATLYS_HOLE_A_CENTER: [number, number] = [
  113.22837281739663, 8.262426664470453
];
const SPRATLYS_HOLE_C_CENTER: [number, number] = [
  114.60347541633342, 8.007687177584828
];
const SPRATLYS_HOLE_RX = 0.25;
const SPRATLYS_HOLE_RY = 0.2;

function reverseRing(ring: [number, number][]) {
  return ring.slice().reverse();
}

const SPRATLYS_HOLE_A = reverseRing(
  ellipsePolygon(
    SPRATLYS_HOLE_A_CENTER,
    SPRATLYS_HOLE_RX,
    SPRATLYS_HOLE_RY,
    24,
    0.25
  )
);
const SPRATLYS_HOLE_C = reverseRing(
  ellipsePolygon(
    SPRATLYS_HOLE_C_CENTER,
    SPRATLYS_HOLE_RX,
    SPRATLYS_HOLE_RY,
    24,
    -0.15
  )
);

const PARACELS_MASK_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'paracels_mask' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[PARACELS_EXTERIOR]]
      }
    }
  ]
};

const SPRATLYS_MASK_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'spratlys_mask' },
      geometry: {
        type: 'MultiPolygon',
        // Polygon with holes: [outer, hole1, hole2]
        coordinates: [[SPRATLYS_EXTERIOR, SPRATLYS_HOLE_A, SPRATLYS_HOLE_C]]
      }
    }
  ]
};

// Outline chỉ vẽ outer ring (không vẽ vòng khoét đảo).
const SPRATLYS_OUTLINE_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'spratlys_outline' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[SPRATLYS_EXTERIOR]]
      }
    }
  ]
};

function ellipsePolygon(
  center: [number, number],
  rx: number,
  ry: number,
  points = 10,
  rotateRad = 0
): [number, number][] {
  const [cx, cy] = center;
  const out: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    const x = Math.cos(t) * rx;
    const y = Math.sin(t) * ry;
    const xr = x * Math.cos(rotateRad) - y * Math.sin(rotateRad);
    const yr = x * Math.sin(rotateRad) + y * Math.cos(rotateRad);
    out.push([cx + xr, cy + yr]);
  }
  out.push(out[0]);
  return out;
}

function multiPolygonFromIslands(
  islands: Array<{
    center: [number, number];
    rx: number;
    ry: number;
    r?: number;
  }>
) {
  return {
    type: 'MultiPolygon',
    // MultiPolygon: [polygon[rings[positions]]]
    coordinates: islands.map((i) => [
      ellipsePolygon(i.center, i.rx, i.ry, 10, i.r ?? 0)
    ])
  } as const;
}

const PARACELS_ISLANDS_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'paracels_islands' },
      geometry: multiPolygonFromIslands([
        { center: [112.28, 16.55], rx: 0.08, ry: 0.05, r: 0.2 },
        { center: [112.38, 16.75], rx: 0.07, ry: 0.045, r: -0.3 },
        { center: [112.12, 16.92], rx: 0.06, ry: 0.04, r: 0.1 },
        { center: [111.88, 16.78], rx: 0.07, ry: 0.045, r: 0.6 },
        { center: [112.02, 16.48], rx: 0.06, ry: 0.04, r: -0.2 },
        { center: [112.62, 16.95], rx: 0.05, ry: 0.035, r: 0.4 }
      ])
    }
  ]
};

const SPRATLYS_ISLANDS_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'spratlys_islands' },
      geometry: multiPolygonFromIslands([
        { center: [114.3, 10.6], rx: 0.09, ry: 0.05, r: 0.3 },
        { center: [114.6, 10.9], rx: 0.07, ry: 0.045, r: -0.4 },
        { center: [114.9, 11.1], rx: 0.08, ry: 0.05, r: 0.1 },
        { center: [115.1, 11.35], rx: 0.06, ry: 0.04, r: 0.5 },
        { center: [115.4, 11.15], rx: 0.07, ry: 0.045, r: -0.2 },
        { center: [115.65, 10.95], rx: 0.06, ry: 0.04, r: 0.2 },
        { center: [115.8, 11.55], rx: 0.05, ry: 0.035, r: -0.1 },
        { center: [114.0, 10.2], rx: 0.06, ry: 0.04, r: 0.2 }
      ])
    }
  ]
};

/** Phải bao đủ cả cụm ~15.4°–17.5°N — nếu minLat sai (vd 17+) mask sẽ TẮT khi zoom gần vào đảo */
const PARACELS_BOUNDS: Bounds = {
  minLng: 110.72,
  minLat: 15.32,
  maxLng: 114.35,
  maxLat: 17.92
};

const SPRATLYS_BOUNDS: Bounds = {
  minLng: 111.9,
  minLat: 8.5,
  maxLng: 116.65,
  maxLat: 12.75
};

const SOURCES = {
  paracelsMask: 'disputed-paracels-mask',
  spratlysMask: 'disputed-spratlys-mask',
  spratlysOutline: 'disputed-spratlys-outline',
  paracelsIslands: 'disputed-paracels-islands',
  spratlysIslands: 'disputed-spratlys-islands'
} as const;

const LAYERS = {
  paracelsMaskFill: 'disputed-paracels-mask-fill',
  spratlysMaskFill: 'disputed-spratlys-mask-fill',
  paracelsMaskOutline: 'disputed-paracels-mask-outline',
  spratlysMaskOutline: 'disputed-spratlys-mask-outline',
  paracelsIslandsFill: 'disputed-paracels-islands-fill',
  spratlysIslandsFill: 'disputed-spratlys-islands-fill',
  paracelsIslandsOutline: 'disputed-paracels-islands-outline',
  spratlysIslandsOutline: 'disputed-spratlys-islands-outline'
} as const;

const WATER_MASK_COLOR = '#aad3df';
const OUTLINE_COLOR = '#967da0';

function intersects(a: Bounds, b: Bounds) {
  return !(
    a.maxLng < b.minLng ||
    a.minLng > b.maxLng ||
    a.maxLat < b.minLat ||
    a.minLat > b.maxLat
  );
}

function getViewportBounds(map: Map): Bounds {
  const b = map.getBounds();
  const sw = b.getSouthWest();
  const ne = b.getNorthEast();
  return { minLng: sw.lng, minLat: sw.lat, maxLng: ne.lng, maxLat: ne.lat };
}

export function viewportIntersectsDisputedSeas(map: Map) {
  const vb = getViewportBounds(map);
  return intersects(vb, PARACELS_BOUNDS) || intersects(vb, SPRATLYS_BOUNDS);
}

function addLayerJustAboveBase(
  map: Map,
  layer: any,
  baseLayerId = 'osm-tiles'
) {
  const style = map.getStyle();
  const layers = style?.layers ?? [];
  const idx = layers.findIndex((l: any) => l?.id === baseLayerId);
  const nextId = idx >= 0 ? (layers[idx + 1] as any)?.id : undefined;
  if (nextId && map.getLayer(nextId)) map.addLayer(layer, nextId);
  else map.addLayer(layer);
}

/**
 * Gọi sau `applyVietnameseNameOverlay`: đặt mask disputed ngay dưới nhãn VI, trên raster
 * (admin/flood vẫn có thể đè lên — nếu cần che hết raster thì chỉnh thứ tự toàn map).
 */
export function restackDisputedSeasMaskLayers(map: Map) {
  const vn = VN_NAME_OVERRIDE_LAYER_ID;
  const anchorBelow = map.getLayer(vn) ? vn : undefined;
  try {
    if (anchorBelow) {
      map.moveLayer(LAYERS.spratlysMaskOutline, anchorBelow);
      map.moveLayer(LAYERS.paracelsMaskOutline, LAYERS.spratlysMaskOutline);
      map.moveLayer(LAYERS.spratlysMaskFill, LAYERS.paracelsMaskOutline);
      map.moveLayer(LAYERS.paracelsMaskFill, LAYERS.spratlysMaskFill);
    } else {
      map.moveLayer(LAYERS.paracelsMaskFill);
      map.moveLayer(LAYERS.spratlysMaskFill);
      map.moveLayer(LAYERS.paracelsMaskOutline);
      map.moveLayer(LAYERS.spratlysMaskOutline);
    }
  } catch {
    /* layer có thể chưa có */
  }
}

export function ensureDisputedSeasIllustrativeLayers(map: Map) {
  // idempotent
  try {
    if (!map.getSource(SOURCES.paracelsMask)) {
      map.addSource(SOURCES.paracelsMask, {
        type: 'geojson',
        data: PARACELS_MASK_GEOJSON
      });
    } else {
      (map.getSource(SOURCES.paracelsMask) as GeoJSONSource).setData(
        PARACELS_MASK_GEOJSON
      );
    }
    if (!map.getSource(SOURCES.spratlysMask)) {
      map.addSource(SOURCES.spratlysMask, {
        type: 'geojson',
        data: SPRATLYS_MASK_GEOJSON
      });
    } else {
      (map.getSource(SOURCES.spratlysMask) as GeoJSONSource).setData(
        SPRATLYS_MASK_GEOJSON
      );
    }
    if (!map.getSource(SOURCES.spratlysOutline)) {
      map.addSource(SOURCES.spratlysOutline, {
        type: 'geojson',
        data: SPRATLYS_OUTLINE_GEOJSON
      });
    } else {
      (map.getSource(SOURCES.spratlysOutline) as GeoJSONSource).setData(
        SPRATLYS_OUTLINE_GEOJSON
      );
    }
    if (!map.getSource(SOURCES.paracelsIslands)) {
      map.addSource(SOURCES.paracelsIslands, {
        type: 'geojson',
        data: PARACELS_ISLANDS_GEOJSON
      });
    }
    if (!map.getSource(SOURCES.spratlysIslands)) {
      map.addSource(SOURCES.spratlysIslands, {
        type: 'geojson',
        data: SPRATLYS_ISLANDS_GEOJSON
      });
    }

    if (!map.getLayer(LAYERS.paracelsMaskFill)) {
      addLayerJustAboveBase(map, {
        id: LAYERS.paracelsMaskFill,
        type: 'fill',
        source: SOURCES.paracelsMask,
        layout: { visibility: 'none' },
        paint: { 'fill-color': WATER_MASK_COLOR, 'fill-opacity': 1 }
      });
    }
    if (!map.getLayer(LAYERS.spratlysMaskFill)) {
      addLayerJustAboveBase(map, {
        id: LAYERS.spratlysMaskFill,
        type: 'fill',
        source: SOURCES.spratlysMask,
        layout: { visibility: 'none' },
        paint: { 'fill-color': WATER_MASK_COLOR, 'fill-opacity': 1 }
      });
    }

    const maskOutlinePaint = {
      'line-color': OUTLINE_COLOR,
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        4,
        6.4,
        7,
        5.1,
        10,
        4.4,
        14,
        3.6,
        18,
        3.05
      ],
      'line-opacity': 0.96
    } as const;

    if (!map.getLayer(LAYERS.paracelsMaskOutline)) {
      addLayerJustAboveBase(map, {
        id: LAYERS.paracelsMaskOutline,
        type: 'line',
        source: SOURCES.paracelsMask,
        layout: {
          visibility: 'none',
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: maskOutlinePaint
      });
    } else {
      for (const k of Object.keys(maskOutlinePaint) as Array<
        keyof typeof maskOutlinePaint
      >) {
        map.setPaintProperty(
          LAYERS.paracelsMaskOutline,
          k,
          maskOutlinePaint[k]
        );
      }
    }
    if (!map.getLayer(LAYERS.spratlysMaskOutline)) {
      addLayerJustAboveBase(map, {
        id: LAYERS.spratlysMaskOutline,
        type: 'line',
        source: SOURCES.spratlysOutline,
        layout: {
          visibility: 'none',
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: maskOutlinePaint
      });
    } else {
      for (const k of Object.keys(maskOutlinePaint) as Array<
        keyof typeof maskOutlinePaint
      >) {
        map.setPaintProperty(
          LAYERS.spratlysMaskOutline,
          k,
          maskOutlinePaint[k]
        );
      }
    }

    // Hide island-shape layers for cleaner UX.
  } catch {
    // ignore: map might not be ready or disposing
  }
}

export function setDisputedSeasIllustrativeVisible(map: Map, visible: boolean) {
  const v = visible ? 'visible' : 'none';
  for (const id of Object.values(LAYERS)) {
    try {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
    } catch {
      // ignore
    }
  }
}
