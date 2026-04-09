const DA_NANG_CITY = { lat: 16.054, lng: 108.202 };
const VU_GIA_RIVER = { lat: 15.88, lng: 108.06 };

// ── Flood API (river discharge) ──────────────────────────────────────

export interface FloodForecastResponse {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    river_discharge: (number | null)[];
  };
  daily_units: { river_discharge: string };
}

export async function getFloodForecast(): Promise<FloodForecastResponse> {
  const url = new URL('https://flood-api.open-meteo.com/v1/flood');
  url.searchParams.set('latitude', String(VU_GIA_RIVER.lat));
  url.searchParams.set('longitude', String(VU_GIA_RIVER.lng));
  url.searchParams.set('daily', 'river_discharge');
  url.searchParams.set('past_days', '7');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo Flood API ${res.status}`);
  return res.json();
}

// ── Weather Forecast API (current conditions) ────────────────────────

export interface CurrentWeatherResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    precipitation: number;
    rain: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    temperature_2m: number;
    relative_humidity_2m: number;
  };
  current_units: Record<string, string>;
}

export async function getCurrentWeather(): Promise<CurrentWeatherResponse> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(DA_NANG_CITY.lat));
  url.searchParams.set('longitude', String(DA_NANG_CITY.lng));
  url.searchParams.set(
    'current',
    'precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m,temperature_2m,relative_humidity_2m'
  );
  url.searchParams.set('timezone', 'Asia/Ho_Chi_Minh');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo Weather API ${res.status}`);
  return res.json();
}
