"use client";

import React, { useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, InfoWindow } from '@react-google-maps/api';
import { useZones, useAlerts } from '@/lib/api';
import { Card, Button, Badge, LoadingState } from '@/components/ui/common';
import { MapPin, AlertTriangle, CloudRain, Navigation, ArrowUpRight, ChevronRight, Droplets } from 'lucide-react';
import { Zone } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from 'recharts';

declare const google: any;

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Da Nang Center - Adjusted to see all districts (Zoomed out slightly)
const center = {
  lat: 16.0600,
  lng: 108.1700,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
  ]
};

// Custom Styles for Risk Levels
const getZoneOptions = (riskLevel: string) => {
  let fillColor = "#10b981"; // Safe (Emerald)
  let strokeColor = "#059669";
  
  if (riskLevel === 'Watch') {
    fillColor = "#f97316"; // Orange
    strokeColor = "#c2410c";
  } else if (riskLevel === 'Flooded') {
    fillColor = "#ef4444"; // Red
    strokeColor = "#b91c1c";
  }

  return {
    fillColor,
    fillOpacity: 0.35, // Increased opacity for better district visibility
    strokeColor,
    strokeWeight: 2,
    clickable: true,
  };
};

// Mock data for the "Trend" chart shown in the mobile screenshot
const generateTrendData = () => [
    { time: '-1h', value: 0.3, type: 'past' },
    { time: 'Hiện tại', value: 0.5, type: 'current' },
    { time: '+1h', value: 0.8, type: 'forecast' },
    { time: '+2h', value: 1.1, type: 'forecast' },
];

export default function ZonesPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: '', // ENTER YOUR API KEY HERE
  });

  const { data: zones } = useZones();
  const { data: alerts } = useAlerts();

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [forecastHour, setForecastHour] = useState(1); // 0 = now, 1 = +1h, etc.

  // Separate zones into Polygons (Districts) and Hotspots (Points)
  const districts = useMemo(() => zones?.filter(z => z.type === 'District') || [], [zones]);
  const hotspots = useMemo(() => zones?.filter(z => z.type === 'Custom') || [], [zones]);

  const trendData = useMemo(() => generateTrendData(), []);

  if (!isLoaded) return <LoadingState />;

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] rounded-2xl overflow-hidden border shadow-sm bg-slate-100">
      
      {/* Google Map Background */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11} // Zoomed out to 11 to see all of Da Nang (Hoa Vang to Son Tra)
        options={mapOptions}
        onClick={() => setSelectedZone(null)}
      >
        {/* Render District Polygons */}
        {districts.map((zone) => (
          <Polygon
            key={zone.id}
            paths={zone.coordinates?.map(c => ({ lat: c[0], lng: c[1] }))}
            options={getZoneOptions(zone.riskLevel)}
            onClick={() => setSelectedZone(zone)}
          />
        ))}

        {/* Render Hotspot Markers (Pulsing Circles for specific streets) */}
        {hotspots.map((zone) => zone.center && (
            <Marker
                key={zone.id}
                position={{ lat: zone.center[0], lng: zone.center[1] }}
                onClick={() => setSelectedZone(zone)}
                icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: zone.riskLevel === 'Flooded' ? '#ef4444' : '#f97316',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                }}
                animation={zone.riskLevel === 'Flooded' ? google.maps.Animation.BOUNCE : undefined}
            />
        ))}

        {/* Selected Zone/Point Highlight Marker if strictly a point */}
        {selectedZone && selectedZone.center && selectedZone.type === 'Custom' && (
             <Marker 
                position={{ lat: selectedZone.center[0], lng: selectedZone.center[1] }}
                icon={{
                     path: google.maps.SymbolPath.CIRCLE,
                     scale: 12,
                     fillColor: '#2563eb', // Active Blue
                     fillOpacity: 1,
                     strokeColor: '#ffffff',
                     strokeWeight: 3,
                }}
             />
        )}
      </GoogleMap>

      {/* --- TOP FLOATING CARD (Mobile Style) --- */}
      {selectedZone ? (
        <div className="absolute top-4 left-4 right-4 z-10 animate-in slide-in-from-top-2 duration-300 pointer-events-none">
          <Card className="pointer-events-auto bg-white/95 backdrop-blur-md shadow-xl border-none rounded-3xl overflow-hidden max-w-md mx-auto">
            {/* Header: Street Name & Status */}
            <div className="p-4 pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{selectedZone.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {selectedZone.riskLevel === 'Flooded' ? (
                                <span className="flex items-center text-xs font-bold text-red-600">
                                    <span className="relative flex h-2 w-2 mr-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    Nguy cơ ngập sâu (Lũ khẩn cấp)
                                </span>
                            ) : selectedZone.riskLevel === 'Watch' ? (
                                <span className="flex items-center text-xs font-bold text-orange-600">
                                    <AlertTriangle className="h-3 w-3 mr-1" /> Cảnh báo mức nước tăng
                                </span>
                            ) : (
                                <span className="flex items-center text-xs font-bold text-emerald-600">
                                    <Droplets className="h-3 w-3 mr-1" /> Mức nước an toàn
                                </span>
                            )}
                        </div>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 bg-slate-100" onClick={() => setSelectedZone(null)}>×</Button>
                </div>
            </div>

            {/* Content: Chart */}
            <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                     <div>
                        <p className="text-sm font-medium text-slate-600">Xu hướng mực nước</p>
                        <p className="text-xs text-slate-400">Dự kiến: <span className="font-bold text-slate-800">0.5m</span></p>
                     </div>
                     <span className="text-xs font-bold text-red-500 flex items-center bg-red-50 px-2 py-1 rounded-full">
                         <ArrowUpRight className="h-3 w-3 mr-1" /> Tăng nhanh
                     </span>
                </div>

                {/* Mobile-style Bar Chart */}
                <div className="h-28 w-full flex items-end justify-between gap-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                            <XAxis 
                                dataKey="time" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            />
                            <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={8}>
                                {trendData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.type === 'current' ? '#3b82f6' : entry.type === 'forecast' ? '#ef4444' : '#e2e8f0'} 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                     <Button className="w-full rounded-xl text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                         <Navigation className="h-3 w-3 mr-2" /> Chỉ đường tránh
                     </Button>
                     <Button variant="outline" className="w-full rounded-xl text-xs h-9 border-slate-200 text-slate-600">
                         Chi tiết
                     </Button>
                </div>
            </div>
          </Card>
        </div>
      ) : (
         /* Search Bar Placeholder when no zone selected */
         <div className="absolute top-4 left-4 right-4 z-10 flex justify-center pointer-events-none">
             <div className="pointer-events-auto bg-white/95 backdrop-blur shadow-lg rounded-2xl flex items-center p-3 w-full max-w-sm border border-slate-100">
                 <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                 <input className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full" placeholder="Tìm kiếm quận, huyện..." />
             </div>
         </div>
      )}

      {/* --- BOTTOM SLIDER (Mobile Style) --- */}
      <div className="absolute bottom-6 left-4 right-4 z-10 flex justify-center pointer-events-none">
          <Card className="pointer-events-auto bg-white/95 backdrop-blur-md shadow-2xl border-none rounded-3xl w-full max-w-md p-5 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-slate-800 text-sm">Thời gian dự báo</h3>
                   <span className="text-xs font-bold text-blue-600">+{forecastHour} giờ</span>
               </div>
               
               {/* Custom Range Slider UI */}
               <div className="relative h-6 flex items-center select-none">
                   {/* Track */}
                   <div className="absolute w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(forecastHour / 3) * 100}%` }}></div>
                   </div>
                   
                   {/* Steps */}
                   {[0, 1, 2, 3].map((step) => (
                       <div 
                         key={step} 
                         onClick={() => setForecastHour(step)}
                         className="absolute w-full flex justify-between px-0 cursor-pointer z-10"
                         style={{ left: 0 }} // Simplified for grid layout feel
                       >
                           {/* Invisible click targets, handled by flex container below actually */}
                       </div>
                   ))}

                   {/* Thumb (Visual Only for this mock) */}
                   <div 
                      className="absolute h-5 w-5 bg-white border-2 border-blue-500 rounded-full shadow-md z-20 cursor-grab transition-all duration-300"
                      style={{ left: `calc(${(forecastHour / 3) * 100}% - 10px)` }}
                   ></div>
               </div>

               {/* Labels */}
               <div className="flex justify-between mt-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                   <span onClick={() => setForecastHour(0)} className={`cursor-pointer ${forecastHour===0 ? 'text-blue-600' : ''}`}>Hiện tại</span>
                   <span onClick={() => setForecastHour(1)} className={`cursor-pointer ${forecastHour===1 ? 'text-blue-600' : ''}`}>+1 giờ</span>
                   <span onClick={() => setForecastHour(2)} className={`cursor-pointer ${forecastHour===2 ? 'text-blue-600' : ''}`}>+2 giờ</span>
                   <span onClick={() => setForecastHour(3)} className={`cursor-pointer ${forecastHour===3 ? 'text-blue-600' : ''}`}>+3 giờ</span>
               </div>
          </Card>
      </div>

    </div>
  );
}