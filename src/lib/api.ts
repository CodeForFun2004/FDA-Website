import { useQuery } from '@tanstack/react-query';
import {
  User,
  Device,
  Alert,
  SensorReading,
  Route,
  Zone,
  RouteAnalysis,
  SystemLog
} from './types';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini AI
// Using process.env.API_KEY as required.
// console.log("VITE_GEMINI_API_KEY =", import.meta.env.VITE_GEMINI_API_KEY);

// const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const apiKey =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ??
  process.env.VITE_GEMINI_API_KEY ??
  '';

console.log('GEMINI_API_KEY loaded =', apiKey ? 'YES' : 'NO');

const ai = new GoogleGenAI({ apiKey });

// --- Mock Data Generators ---

const generateUsers = (): User[] => [
  {
    id: '1',
    name: 'Alice Admin',
    email: 'alice@fda.gov',
    role: 'Admin',
    status: 'Active',
    createdAt: '2023-01-10',
    lastLogin: '2023-10-25T08:30:00Z'
  },
  {
    id: '2',
    name: 'Bob Operator',
    email: 'bob@fda.gov',
    role: 'Operator',
    status: 'Active',
    createdAt: '2023-02-15',
    lastLogin: '2023-10-24T14:20:00Z'
  },
  {
    id: '3',
    name: 'Charlie View',
    email: 'charlie@public.com',
    role: 'Viewer',
    status: 'Inactive',
    createdAt: '2023-05-20',
    lastLogin: '2023-09-10T09:00:00Z'
  },
  {
    id: '4',
    name: 'Mobile User 1',
    email: 'm1@mobile.com',
    role: 'Mobile',
    status: 'Active',
    createdAt: '2023-10-01',
    lastLogin: '2023-10-26T10:15:00Z'
  }
];

const generateDevices = (): Device[] => [
  {
    id: 'dev-001',
    name: 'Me Suot Sensor A1',
    type: 'Ultrasonic',
    model: 'JSN-SR04T',
    location: 'Lien Chieu',
    status: 'Online',
    batteryLevel: 85,
    lastHeartbeat: new Date().toISOString(),
    installationHeight: 6.0,
    calibrationOffset: 0.1,
    coordinates: [16.0583, 108.1632]
  },
  {
    id: 'dev-002',
    name: 'Cam Le Rain Gauge',
    type: 'Rain Gauge',
    model: 'RK400-01',
    location: 'Cam Le',
    status: 'Online',
    batteryLevel: 92,
    lastHeartbeat: new Date().toISOString(),
    coordinates: [16.0197, 108.2096]
  },
  {
    id: 'dev-003',
    name: 'Son Tra Cam',
    type: 'Camera',
    model: 'Hikvision IP',
    location: 'Son Tra',
    status: 'Offline',
    batteryLevel: 0,
    lastHeartbeat: new Date(Date.now() - 86400000).toISOString(),
    coordinates: [16.082, 108.2435]
  },
  {
    id: 'dev-004',
    name: 'Hoa Vang Sensor B2',
    type: 'Multi-sensor',
    model: 'ESP32-Custom',
    location: 'Hoa Vang',
    status: 'Warning',
    batteryLevel: 15,
    lastHeartbeat: new Date(Date.now() - 1800000).toISOString(),
    installationHeight: 5.5,
    calibrationOffset: 0.0,
    coordinates: [16.05, 108.08]
  }
];

const generateAlerts = (): Alert[] => [
  {
    id: 'al-1',
    severity: 'High',
    message: 'Water level rising 0.5m',
    zone: 'Me Suot Street',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'New',
    coordinates: [16.0583, 108.1632]
  },
  {
    id: 'al-2',
    severity: 'Medium',
    message: 'Localized heavy rain',
    zone: 'Hoa Vang',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'Acknowledged',
    coordinates: [16.01, 108.15]
  }
];

const generateSensorData = (deviceId: string = 'dev-001'): SensorReading[] => {
  const data: SensorReading[] = [];
  const now = Date.now();

  const isRainGauge = deviceId === 'dev-002'; // Mock ID for Rain Gauge
  const isCamera = deviceId === 'dev-003';

  if (isCamera) return [];

  // Simulate 24 hours of data
  for (let i = 0; i < 24; i++) {
    const hour = i;

    if (isRainGauge) {
      // Rain Gauge Data (mm) - More spikey
      const rainEvent =
        i > 18 && i < 22 ? Math.random() * 15 + 5 : Math.random() * 2;
      data.push({
        id: `sr-${i}`,
        deviceId: deviceId,
        timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
        type: 'Rainfall',
        value: Number(rainEvent.toFixed(1)),
        unit: 'mm'
      });
    } else {
      // Water Level Data (m) - Smooth Sine Wave
      const baseLevel = 2.0;
      const tideEffect = Math.sin(hour / 6) * 1.0;
      const randomNoise = Math.random() * 0.2;

      data.push({
        id: `sr-${i}`,
        deviceId: deviceId,
        timestamp: new Date(now - (23 - i) * 3600 * 1000).toISOString(),
        type: 'WaterLevel',
        value: Number((baseLevel + tideEffect + randomNoise).toFixed(2)),
        unit: 'm'
      });
    }
  }
  return data;
};

const generateLogs = (): SystemLog[] => [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    level: 'CRITICAL',
    source: 'Alert',
    action: 'Threshold Exceeded',
    details: 'Water level at Me Suot reached 3.8m (Limit: 3.5m)',
    userOrDeviceId: 'dev-001'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    level: 'INFO',
    source: 'User',
    action: 'User Login',
    details: 'Admin user logged in via Web',
    userOrDeviceId: 'alice@fda.gov'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    level: 'WARNING',
    source: 'Sensor',
    action: 'Low Battery',
    details: 'Device battery dropped below 20%',
    userOrDeviceId: 'dev-004'
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    level: 'ERROR',
    source: 'Sensor',
    action: 'Heartbeat Missed',
    details: 'Device failed to send heartbeat for 3 cycles',
    userOrDeviceId: 'dev-003'
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    level: 'INFO',
    source: 'System',
    action: 'Daily Backup',
    details: 'Database backup completed successfully',
    userOrDeviceId: 'System'
  },
  {
    id: 'log-6',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    level: 'INFO',
    source: 'User',
    action: 'Config Update',
    details: 'Updated alert threshold for Zone Lien Chieu',
    userOrDeviceId: 'alice@fda.gov'
  },
  {
    id: 'log-7',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    level: 'INFO',
    source: 'Sensor',
    action: 'Calibration',
    details: 'Manual calibration performed. Offset: +0.1m',
    userOrDeviceId: 'dev-001'
  }
];

const generateRoutes = (): Route[] => [
  {
    id: 'r-1',
    name: 'Nguyen Van Linh Street - Airport',
    startPoint: 'Dragon Bridge',
    endPoint: 'Airport',
    status: 'Open',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'r-2',
    name: 'Au Co Street - Hoa Khanh',
    startPoint: 'Hue Junction',
    endPoint: 'Hoa Khanh Market',
    status: 'Blocked',
    lastUpdated: new Date().toISOString()
  }
];

// Updated Zones to cover ALL Districts of Da Nang
const generateZones = (): Zone[] => [
  // 1. Lien Chieu District (High Risk Area usually)
  {
    id: 'z-lienchieu',
    name: 'Lien Chieu District',
    type: 'District',
    riskLevel: 'Flooded',
    deviceCount: 12,
    population: 170000,
    coordinates: [
      [16.14, 108.1],
      [16.14, 108.15],
      [16.08, 108.17],
      [16.05, 108.14],
      [16.08, 108.08]
    ],
    center: [16.09, 108.13],
    details: 'Major flood-prone area, especially around Hoa Khanh and Me Suot.'
  },
  // 2. Thanh Khe District
  {
    id: 'z-thanhkhe',
    name: 'Thanh Khe District',
    type: 'District',
    riskLevel: 'Watch',
    deviceCount: 10,
    population: 180000,
    coordinates: [
      [16.07, 108.17],
      [16.075, 108.195],
      [16.055, 108.2],
      [16.045, 108.175]
    ],
    center: [16.06, 108.185],
    details: 'Localized flooding risk around Khe Can.'
  },
  // 3. Hai Chau District (Center)
  {
    id: 'z-haichau',
    name: 'Hai Chau District',
    type: 'District',
    riskLevel: 'Safe',
    deviceCount: 15,
    population: 200000,
    coordinates: [
      [16.08, 108.21],
      [16.085, 108.225],
      [16.03, 108.22],
      [16.035, 108.2]
    ],
    center: [16.06, 108.215],
    details: 'Administrative center with relatively good drainage.'
  },
  // 4. Son Tra District (Peninsula)
  {
    id: 'z-sontra',
    name: 'Son Tra District',
    type: 'District',
    riskLevel: 'Safe',
    deviceCount: 8,
    population: 150000,
    coordinates: [
      [16.12, 108.23],
      [16.12, 108.3],
      [16.06, 108.26],
      [16.065, 108.23]
    ],
    center: [16.09, 108.25],
    details: 'Higher terrain, low flooding, watch for peninsula landslides.'
  },
  // 5. Ngu Hanh Son District
  {
    id: 'z-nguhanhson',
    name: 'Ngu Hanh Son District',
    type: 'District',
    riskLevel: 'Watch',
    deviceCount: 6,
    population: 90000,
    coordinates: [
      [16.06, 108.23],
      [16.06, 108.26],
      [15.98, 108.28],
      [15.98, 108.24]
    ],
    center: [16.02, 108.25],
    details: 'Co Co river area with tidal flooding risk.'
  },
  // 6. Cam Le District
  {
    id: 'z-camle',
    name: 'Cam Le District',
    type: 'District',
    riskLevel: 'Watch',
    deviceCount: 9,
    population: 140000,
    coordinates: [
      [16.04, 108.17],
      [16.035, 108.22],
      [15.99, 108.21],
      [16.0, 108.16]
    ],
    center: [16.015, 108.19],
    details: 'Low-lying area in the south of the city.'
  },
  // 7. Hoa Vang District (Large outer area)
  {
    id: 'z-hoavang',
    name: 'Hoa Vang District',
    type: 'District',
    riskLevel: 'Flooded',
    deviceCount: 20,
    population: 200000,
    coordinates: [
      [16.15, 108.05],
      [16.15, 108.1],
      [16.0, 108.16],
      [15.95, 108.2],
      [15.95, 108.0]
    ],
    center: [16.05, 108.08],
    details: 'Large rural area, often flooded by upstream flows.'
  },
  // Flood Hotspots (Points)
  {
    id: 'z-hotspot-1',
    name: 'Me Suot Street',
    type: 'Custom',
    riskLevel: 'Flooded',
    deviceCount: 2,
    population: 5000,
    coordinates: [],
    center: [16.0583, 108.1632], // Near Da Nang University of Education
    details: 'Severe localized flooding > 1m during heavy rain.'
  },
  {
    id: 'z-hotspot-2',
    name: 'Khe Can - Thanh Khe',
    type: 'Custom',
    riskLevel: 'Watch',
    deviceCount: 1,
    population: 3000,
    coordinates: [],
    center: [16.062, 108.181],
    details: 'Low-lying area with slow drainage.'
  },
  {
    id: 'z-hotspot-3',
    name: 'Hoa Khanh Nam',
    type: 'Custom',
    riskLevel: 'Flooded',
    deviceCount: 3,
    population: 8000,
    coordinates: [],
    center: [16.075, 108.15],
    details: 'Widespread flooding from mountain runoff.'
  }
];

// --- API Functions ---

// Mock Geocoding for Da Nang to allow map demo without Geocoding API key
export const mockGeocode = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  const normalized = address.toLowerCase();

  // Da Nang Landmarks
  if (normalized.includes('cầu rồng') || normalized.includes('cau rong'))
    return { lat: 16.061, lng: 108.2208 };
  if (normalized.includes('sân bay') || normalized.includes('airport'))
    return { lat: 16.0538, lng: 108.1994 };
  if (normalized.includes('hòa khánh') || normalized.includes('hoa khanh'))
    return { lat: 16.0825, lng: 108.1481 };
  if (normalized.includes('hải châu') || normalized.includes('hai chau'))
    return { lat: 16.0748, lng: 108.223 };
  if (normalized.includes('ngũ hành sơn') || normalized.includes('marble'))
    return { lat: 16.0076, lng: 108.2562 };
  if (normalized.includes('bách khoa') || normalized.includes('polytechnic'))
    return { lat: 16.0736, lng: 108.1498 };
  if (normalized.includes('tòa hành chính') || normalized.includes('city hall'))
    return { lat: 16.0777, lng: 108.2244 };
  if (normalized.includes('linh ứng') || normalized.includes('linh ung'))
    return { lat: 16.1004, lng: 108.2762 };
  if (normalized.includes('chợ cồn') || normalized.includes('con market'))
    return { lat: 16.0697, lng: 108.2148 };
  if (normalized.includes('mẹ suốt') || normalized.includes('me suot'))
    return { lat: 16.0583, lng: 108.1632 };

  // Specific locations for demo
  if (normalized.includes('fpt') || normalized.includes('software'))
    return { lat: 15.9722, lng: 108.2495 }; // FPT Complex
  if (normalized.includes('co.op') || normalized.includes('coop'))
    return { lat: 16.0605, lng: 108.1895 }; // Co.opmart Dien Bien Phu (Thanh Khe)

  return null; // Return null if not found in mock DB
};

// --- Gemini AI Analysis ---

export const analyzeRouteWithGemini = async (
  start: string,
  end: string,
  availableRoutes: { summary: string; distance: string; duration: string }[]
): Promise<RouteAnalysis[]> => {
  const zones = generateZones();
  const floodedZones = zones
    .filter((z) => z.riskLevel === 'Flooded' || z.riskLevel === 'Watch')
    .map((z) => `${z.name} (${z.details})`)
    .join(', ');

  const routesContext = availableRoutes
    .map(
      (r, i) =>
        `Route ${i}: via ${r.summary}, Distance: ${r.distance}, Duration: ${r.duration}`
    )
    .join('\n');

  const prompt = `
    Context: You are a flood safety assistant for Da Nang city, Vietnam.
    Current Flood Status: The following areas are currently flooded or at risk: ${floodedZones}.
    
    Task: The user wants to go from "${start}" to "${end}".
    Google Maps found these potential routes:
    ${routesContext}

    Requirement:
    1. Analyze each route against the flood status.
    2. Assign a "type" to each route: "Safest", "Fastest", or "Alternative". 
    - The "Safest" route must avoid flood zones if possible.
    - The "Fastest" route is usually the one with shortest duration, but flag it if risky.
    3. Return valid JSON.

    Output Schema:
    {
      "routes": [
        {
          "routeIndex": number (The index 0, 1, 2... matching the input),
          "type": "Safest" | "Fastest" | "Alternative",
          "summary": string (Use the summary provided),
          "distance": string,
          "duration": string,
          "riskLevel": "Low" | "Medium" | "High",
          "warnings": ["warning 1", "warning 2"],
          "pathNote": "Reasoning... e.g., 'This route avoids the flooded Hoa Khanh area and is safe.'"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            routes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  routeIndex: { type: Type.INTEGER },
                  type: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  distance: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
                  pathNote: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error('Empty response from AI');

    const parsed = JSON.parse(jsonStr);
    return parsed.routes.map((r: any) => ({
      ...r,
      id: `ai-route-${r.routeIndex}`
    }));
  } catch (error) {
    console.error('Gemini API Error or Fallback triggered:', error);

    // Robust Fallback: Return structured data even if AI fails or routes are empty
    // If we have actual routes passed in (from Maps API):
    if (availableRoutes.length > 0) {
      return availableRoutes.map((r, i) => ({
        id: `mock-${i}`,
        routeIndex: i,
        type: i === 0 ? 'Fastest' : 'Safest',
        summary: r.summary,
        distance: r.distance,
        duration: r.duration,
        riskLevel: i === 0 ? 'High' : 'Low',
        warnings: i === 0 ? ['Potential flooding near endpoint'] : [],
        pathNote:
          i === 0
            ? 'Fastest but passes through areas with mild flooding risk.'
            : 'Safe route that avoids flooded points.'
      }));
    }
    // If no routes passed (Mock mode for demo or API failure)
    else {
      // SPECIAL DEMO CASE: FPT -> Co.opmart
      const isDemo =
        start.toLowerCase().includes('fpt') &&
        end.toLowerCase().includes('co.op');

      if (isDemo) {
        return [
          {
            id: 'mock-safe-demo',
            routeIndex: 0,
            type: 'Safest',
            summary: 'Via Vo Chi Cong & Nguyen Huu Tho',
            distance: '13.5 km',
            duration: '28 min',
            riskLevel: 'Low',
            warnings: [],
            pathNote:
              'This route uses higher, major roads and avoids low-lying Hoa Xuan and Cam Le.'
          },
          {
            id: 'mock-fast-demo',
            routeIndex: 1,
            type: 'Fastest',
            summary: 'Via Le Van Hien & Dragon Bridge',
            distance: '11.8 km',
            duration: '24 min',
            riskLevel: 'Medium',
            warnings: [
              'Traffic congestion at Dragon Bridge',
              'Localized flooding on Nguyen Van Linh Street'
            ],
            pathNote:
              '4 minutes faster but with mild flooding risk around Ham Nghi - Nguyen Van Linh.'
          }
        ];
      }

      return [
        {
          id: 'mock-safe',
          routeIndex: 0,
          type: 'Safest',
          summary: 'Flood-avoidance route (Mock)',
          distance: '5.2 km',
          duration: '18 min',
          riskLevel: 'Low',
          warnings: [],
          pathNote: 'This route is optimized to avoid low-lying areas.'
        },
        {
          id: 'mock-fast',
          routeIndex: 1,
          type: 'Fastest',
          summary: 'Main route (Mock)',
          distance: '4.1 km',
          duration: '12 min',
          riskLevel: 'High',
          warnings: ['Passes through area flooded up to 0.5m'],
          pathNote:
            'Warning: Route passes through Me Suot Street which is heavily flooded.'
        }
      ];
    }
  }
};

// --- React Query Hooks ---

export const useUsers = () =>
  useQuery({ queryKey: ['users'], queryFn: async () => generateUsers() });
export const useDevices = () =>
  useQuery({ queryKey: ['devices'], queryFn: async () => generateDevices() });
export const useAlerts = () =>
  useQuery({ queryKey: ['alerts'], queryFn: async () => generateAlerts() });
export const useSensorReadings = (deviceId?: string) =>
  useQuery({
    queryKey: ['sensorReadings', deviceId],
    queryFn: async () => generateSensorData(deviceId)
  });
export const useRoutes = () =>
  useQuery({ queryKey: ['routes'], queryFn: async () => generateRoutes() });
export const useZones = () =>
  useQuery({ queryKey: ['zones'], queryFn: async () => generateZones() });
export const useSystemLogs = () =>
  useQuery({ queryKey: ['logs'], queryFn: async () => generateLogs() });

export const useDashboardStats = () => {
  const { data: devices } = useDevices();
  const { data: alerts } = useAlerts();
  const { data: zones } = useZones();

  return {
    totalDevices: devices?.length || 0,
    offlineDevices: devices?.filter((d) => d.status === 'Offline').length || 0,
    activeAlerts: alerts?.filter((a) => a.status !== 'Resolved').length || 0,
    monitoredZones: zones?.length || 0
  };
};
