# 🎨 Frontend Integration Guide

**For:** React/Vue/Next.js Frontend Teams  
**Last Updated:** 05/02/2026  
**Version:** 2.0 (FE-20 + Groq AI Integration)

---

## 🆕 What's New (February 2026)

✅ **FE-20 Interpretability**: `area_logic` and `interpretability` fields in responses  
✅ **Groq AI Consultant**: `ai_consultant_advice` with Vietnamese Markdown  
✅ **54 Area Configurations**: Urban/Lowland/Mountain/Island risk thresholds  
✅ **21 Historical Events**: Real flood database (2006-2024)  
✅ **Contribution Scores**: Now in percentage (0-100) format  

---

## 🔌 API Base URLs

```
Development:  http://localhost:8000
Staging:      https://staging-api.fda.id.vn
Production:   https://api.fda.id.vn
```

---

## 🔐 Authentication

All requests require Bearer token in header:

```javascript
// JavaScript/TypeScript
const API_KEY = process.env.REACT_APP_API_KEY;
const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};

const response = await fetch(
  `${BASE_URL}/api/v1/area/danang-center/weather/current`,
  { headers }
);
```

```python
# Python
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
response = requests.get("/api/v1/area/danang-center/weather/current", headers=headers)
```

---

## 📡 API Workflow (Recommended)

### **1) Get Current Weather & Sensors**
```javascript
// Fetch weather + FDA sensor data
const response = await fetch(
  `${BASE_URL}/api/v1/area/${area_id}/weather/current`,
  { headers }
);
const weatherData = await response.json();
```

### **2) Predict Flood Probability (Physics)**
```javascript
// Physics-based flood risk
const response = await fetch(
  `${BASE_URL}/api/v1/area/${area_id}/predict/flood-probability`,
  { headers }
);
const floodProb = await response.json();
```

### **3) Flash Flood Risk (LSTM + Expert System)**
```javascript
// Advanced LSTM-based prediction
const response = await fetch(
  `${BASE_URL}/api/v1/area/${area_id}/predict/flash-flood-risk`,
  {
    method: "POST",
    headers,
    body: JSON.stringify({})
  }
);
const flashFlood = await response.json();
```

### **4) Flood Risk Ensemble (Primary)**
```javascript
// Primary prediction: AI + Physics + Satellite verification
const response = await fetch(
  `${BASE_URL}/api/v1/area/${area_id}/predict/flood-risk-ensemble`,
  {
    method: "POST",
    headers
  }
);
const ensemble = await response.json();
```

### **5) Satellite Analysis (Prithvi AI) [Optional]**
```javascript
// Run AI Prithvi on satellite imagery
const response = await fetch(
  `${BASE_URL}/api/v1/area/${area_id}/verify/satellite-analysis?use_bbox=false&use_fusion=false`,
  {
    method: "POST",
    headers
  }
);
const satellite = await response.json();
```

---

## 🎯 Complete React Example

```javascript
import React, { useState, useEffect } from 'react';
import L from 'leaflet'; // Leaflet for mapping
import 'leaflet/dist/leaflet.css';

export function FloodDashboard() {
  const API_KEY = process.env.REACT_APP_API_KEY;
  const BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };

  const [areaId, setAreaId] = useState('danang-center');
  const [weather, setWeather] = useState(null);
  const [floodProb, setFloodProb] = useState(null);
  const [flashFlood, setFlashFlood] = useState(null);
  const [ensemble, setEnsemble] = useState(null);
  const [satellite, setSatellite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = React.useRef(null);

  // Fetch weather
  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/area/${areaId}/weather/current`,
        { headers }
      );
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Predict flood probability
  const fetchFloodProbability = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/area/${areaId}/predict/flood-probability`,
        { headers }
      );
      const data = await res.json();
      setFloodProb(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Flash flood risk with LSTM
  const fetchFlashFlood = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/area/${areaId}/predict/flash-flood-risk`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({})
        }
      );
      const data = await res.json();
      setFlashFlood(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Primary ensemble prediction (AI + Physics + Satellite verification)
  const fetchEnsemble = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/area/${areaId}/predict/flood-risk-ensemble`,
        {
          method: 'POST',
          headers
        }
      );
      const data = await res.json();
      setEnsemble(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Satellite analysis (optional)
  const fetchSatellite = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/area/${areaId}/verify/satellite-analysis?use_bbox=false&use_fusion=false`,
        {
          method: 'POST',
          headers
        }
      );
      const data = await res.json();
      setSatellite(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Run all predictions
  const runFullAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchWeather();
      await fetchFloodProbability();
      await fetchFlashFlood();
      await fetchEnsemble();
      await fetchSatellite();
    } finally {
      setLoading(false);
    }
  };

  // Display map with GeoJSON
  const displaySatelliteMap = async () => {
    if (!satellite?.flood_detection?.geojson_url || !mapRef.current) return;

    const map = L.map(mapRef.current).setView([16.047, 108.206], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    // Fetch and display GeoJSON
    const geojsonRes = await fetch(satellite.flood_detection.geojson_url);
    const geojsonData = await geojsonRes.json();

    L.geoJSON(geojsonData, {
      style: {
        color: '#ff7300',
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.5
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<b>Flood Area</b><br/>${JSON.stringify(feature.properties)}`);
      }
    }).addTo(map);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🌊 Flood Monitoring - Da Nang</h1>

      {/* Area Selection */}
      <div style={{ marginBottom: '20px' }}>
        <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
          <option value="danang-center">Da Nang Center</option>
          <option value="district-hoa-vang">Hoa Vang District</option>
          <option value="district-son-tra">Son Tra District</option>
        </select>
        <button onClick={runFullAnalysis} disabled={loading}>
          {loading ? 'Analyzing...' : 'Run Full Analysis'}
        </button>
      </div>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {/* Weather Display */}
      {weather && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
          <h3>📊 Weather Data</h3>
          <p>🌧️ Current: {weather.current_precip_mm}mm</p>
          <p>🌡️ Temperature: {weather.temperature_c}°C</p>
          <p>💧 Humidity: {weather.humidity}%</p>
          {weather.fda_sensors && (
            <p>🚨 Sensor Severity: {weather.fda_sensors.severity_level}</p>
          )}
        </div>
      )}

      {/* Flood Probability */}
      {floodProb && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
          <h3>⚠️ Flood Probability</h3>
          <p>Probability: {(floodProb.probability * 100).toFixed(1)}%</p>
          <p style={{ 
            fontSize: '20px',
            color: floodProb.risk_level === 'CRITICAL' ? '#dc3545' : 
                   floodProb.risk_level === 'HIGH' ? '#fd7e14' :
                   floodProb.risk_level === 'MODERATE' ? '#ffc107' : '#28a745'
          }}>
            Risk Level: {floodProb.risk_level}
          </p>
          <p>{floodProb.flood_reason}</p>
        </div>
      )}

      {/* Ensemble Prediction (Primary) */}
      {ensemble && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
          <h3>🌊 Ensemble Prediction (Primary)</h3>
          <p>Probability: {(ensemble.ensemble_prediction.probability * 100).toFixed(1)}%</p>
          <p>Risk Level: {ensemble.ensemble_prediction.risk_level}</p>
          <p>Confidence: {ensemble.ensemble_prediction.confidence} ({ensemble.ensemble_prediction.confidence_score})</p>
          <p>Recommendation: {ensemble.ensemble_prediction.recommendation}</p>
          {ensemble.impact_assessment && (
            <p>Impact: {ensemble.impact_assessment.depth_impact_description}</p>
          )}
        </div>
      )}

      {/* Flash Flood Analysis */}
      {flashFlood && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
          <h3>⚡ Flash Flood Risk (LSTM)</h3>
          <p>Probability: {(flashFlood.probability * 100).toFixed(1)}%</p>
          <p>Risk Level: {flashFlood.risk_level}</p>
          <p>⏱️ Time to Peak: {flashFlood.time_to_peak_minutes} minutes</p>
          <p>💡 Recommendation: {flashFlood.recommendation}</p>
          
          {/* Contribution Scores */}
          <div style={{ marginTop: '10px' }}>
            <h4>Contributing Factors:</h4>
            <ul>
              <li>Intensity: {(flashFlood.contribution_scores.intensity * 100).toFixed(0)}%</li>
              <li>Saturation: {(flashFlood.contribution_scores.saturation * 100).toFixed(0)}%</li>
              <li>Accumulation: {(flashFlood.contribution_scores.accumulation * 100).toFixed(0)}%</li>
              <li>Topography: {(flashFlood.contribution_scores.topography * 100).toFixed(0)}%</li>
              <li>Hydrology: {(flashFlood.contribution_scores.hydrology * 100).toFixed(0)}%</li>
            </ul>
          </div>

          {/* Historical Comparison */}
          {flashFlood.expert_system?.top_3_similar_events && (
            <div style={{ marginTop: '10px' }}>
              <h4>📚 Similar Historical Events:</h4>
              {flashFlood.expert_system.top_3_similar_events.map((event, idx) => (
                <p key={idx}>
                  {idx + 1}. Year {event.year}: {event.peak_rainfall_mm}mm rainfall ({(event.similarity_score * 100).toFixed(0)}% similar)
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Satellite Analysis */}
      {satellite && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
          <h3>🛰️ Satellite Analysis (Prithvi AI)</h3>
          <p>Platform: {satellite.satellite_data.platform}</p>
          <p>Cloud Cover: {satellite.satellite_data.cloud_cover}%</p>
          <p>Detected Flood Area: {satellite.flood_detection.flood_area_km2.toFixed(2)} km²</p>
          
          {/* Display Thumbnail */}
          <img 
            src={satellite.flood_detection.thumbnail_url} 
            alt="Flood Map" 
            style={{ maxWidth: '400px', marginTop: '10px' }}
          />

          {/* Map */}
          <div 
            ref={mapRef} 
            style={{ height: '400px', marginTop: '10px', border: '1px solid #ccc' }}
          />
          <button onClick={displaySatelliteMap} style={{ marginTop: '10px' }}>
            Load Map
          </button>

          {/* Download Links */}
          <div style={{ marginTop: '10px' }}>
            <a href={satellite.flood_detection.geojson_url} target="_blank" rel="noreferrer">
              📥 Download GeoJSON
            </a>
            {' | '}
            <a href={satellite.flood_detection.tif_url} target="_blank" rel="noreferrer">
              📥 Download TIF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ Risk Level Color Coding

```javascript
const riskColors = {
  LOW: '#28a745',      // Green
  MODERATE: '#ffc107', // Yellow
  HIGH: '#fd7e14',     // Orange
  CRITICAL: '#dc3545'  // Red
};

// Usage in CSS/JSX
<div style={{ 
  backgroundColor: riskColors[riskLevel],
  color: 'white',
  padding: '10px',
  borderRadius: '5px'
}}>
  {riskLevel}
</div>
```

---

## 🔄 Error Handling

```javascript
async function handleApiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      ...options
    });

    if (response.status === 401) {
      console.error('Invalid API key');
      return null;
    }

    if (response.status === 404) {
      console.error('Area not found');
      return null;
    }

    if (response.status === 503) {
      console.warn('Satellite data unavailable, falling back to physics model');
      // Still has a result, but satellite-based
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Unknown error');
    }

    return await response.json();

  } catch (error) {
    console.error('Network error:', error.message);
    return null;
  }
}
```

---

## 📊 Radar Chart (Contribution Scores)

Using Chart.js or Recharts to display 5-axis radar:

```javascript
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Intensity', value: flashFlood.contribution_scores.intensity * 100 },
  { name: 'Saturation', value: flashFlood.contribution_scores.saturation * 100 },
  { name: 'Accumulation', value: flashFlood.contribution_scores.accumulation * 100 },
  { name: 'Topography', value: flashFlood.contribution_scores.topography * 100 },
  { name: 'Hydrology', value: flashFlood.contribution_scores.hydrology * 100 }
];

<ResponsiveContainer width={400} height={400}>
  <RadarChart data={data}>
    <PolarGrid />
    <PolarAngleAxis dataKey="name" />
    <PolarRadiusAxis angle={90} domain={[0, 100]} />
    <Radar name="Risk Factors" dataKey="value" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
  </RadarChart>
</ResponsiveContainer>
```

---

## 🗺️ Map with GeoJSON (Leaflet + Mapbox)

```javascript
import L from 'leaflet';

export function FloodMap({ geojsonUrl, thumbnail Url }) {
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([16.047, 108.206], 12);
    
    // Add basemap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    // Add satellite imagery as overlay
    if (thumbnailUrl) {
      const bounds = [[16.0, 108.1], [16.1, 108.3]];
      L.imageOverlay(thumbnailUrl, bounds).addTo(map);
    }

    // Fetch and display GeoJSON
    fetch(geojsonUrl)
      .then(res => res.json())
      .then(geojson => {
        L.geoJSON(geojson, {
          style: {
            color: '#ff7300',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`<b>Flood Zone</b><br/>Probability: ${feature.properties.probability}%`);
          }
        }).addTo(map);
      });

    return () => map.remove();
  }, [geojsonUrl, thumbnailUrl]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
}
```

---

## .env Configuration

```bash
# .env or .env.local
REACT_APP_API_BASE=http://localhost:8000
REACT_APP_API_KEY=your-api-key-here

# Optional: For Mapbox (if using)
REACT_APP_MAPBOX_TOKEN=pk_xxx
```

---

## Available Area IDs

```javascript
const AREA_IDS = {
  // City
  'da-nang-city': 'Thành phố Đà Nẵng',
  
  // Districts
  'danang-center': 'Quận Hải Châu',
  'district-lien-chieu': 'Quận Liên Chiểu',
  'district-thanh-khe': 'Quận Thanh Khê',
  'district-son-tra': 'Quận Sơn Trà',
  'district-ngu-hanh-son': 'Quận Ngũ Hành Sơn',
  '65ca6032-2cde-4f85-af60-f02b84b8e045': 'Quận Cẩm Lệ',
  
  // Rural districts
  'district-hoa-vang': 'Huyện Hòa Vang',
  'district-hoang-sa': 'Huyện Hoàng Sa'
};
```

---

## 🚀 Production Deployment Checklist

- [ ] API_KEY set in .env
- [ ] API_BASE pointing to production URL
- [ ] CORS configured on backend
- [ ] SSL/HTTPS enabled
- [ ] Map library initialized
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] Timeout handling added (10 min for satellite)
- [ ] Historical data caching
- [ ] Mobile responsive design

---

**Ready to build?** Start with Weather, then add prediction logic! 🚀
