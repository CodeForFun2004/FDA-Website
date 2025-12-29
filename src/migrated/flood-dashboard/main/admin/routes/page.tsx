"use client";

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, Polyline } from '@react-google-maps/api';
import { Card, Button, Input, LoadingState } from '../../../components/ui/common';
import { MapPin, Navigation, AlertTriangle, ShieldCheck, Clock, X, Locate } from 'lucide-react';
import { analyzeRouteWithGemini, mockGeocode } from '../../../lib/api';
import { RouteAnalysis } from '../../../lib/types';
import { cn } from '../../../lib/utils';

declare const google: any;

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 16.0300, 
  lng: 108.2200, 
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
};

export default function RoutesPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: '', // ENTER YOUR GOOGLE MAPS API KEY HERE
  });

  // State - Defaulting to the requested demo route
  const [origin, setOrigin] = useState('FPT Software Đà Nẵng');
  const [destination, setDestination] = useState('Co.opmart Đà Nẵng');
  const [isSearching, setIsSearching] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  
  // Locations
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [startPoint, setStartPoint] = useState<{lat: number, lng: number} | null>(null);
  const [endPoint, setEndPoint] = useState<{lat: number, lng: number} | null>(null);

  // Directions
  const [directionsResponse, setDirectionsResponse] = useState<any>(null);
  const [aiResults, setAiResults] = useState<RouteAnalysis[] | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  // Function to handle route search
  const handleSearch = async (overrideOrigin?: string, overrideDest?: string) => {
    const searchOrigin = overrideOrigin || origin;
    const searchDest = overrideDest || destination;

    if (!searchDest) return;
    setIsSearching(true);
    setAiResults(null);
    setDirectionsResponse(null);

    try {
      // 1. Resolve Coordinates
      let startCoords = startPoint;
      if (!startCoords || (searchOrigin && searchOrigin !== "Vị trí hiện tại của bạn")) {
         startCoords = await mockGeocode(searchOrigin);
      }
      
      let endCoords = await mockGeocode(searchDest);

      // Update state to reflect resolved coords so markers show up
      if (startCoords) setStartPoint(startCoords);
      if (endCoords) setEndPoint(endCoords);

      if (startCoords && endCoords && typeof google !== 'undefined') {
        const directionsService = new google.maps.DirectionsService();
        
        // 2. Request Directions (With Alternatives)
        directionsService.route(
          {
            origin: startCoords,
            destination: endCoords,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: true, // IMPORTANT: Get multiple routes
          },
          async (result: any, status: any) => {
            if (status === google.maps.DirectionsStatus.OK) {
              setDirectionsResponse(result);
              
              // 3. Prepare data for Gemini
              const availableRoutes = result.routes.map((r: any) => ({
                 summary: r.summary,
                 distance: r.legs[0].distance.text,
                 duration: r.legs[0].duration.text
              }));

              // 4. Call Gemini AI with Real Routes
              const results = await analyzeRouteWithGemini(searchOrigin, searchDest, availableRoutes);
              setAiResults(results);
              
              const safest = results.find(r => r.type === 'Safest');
              setSelectedRouteIndex(safest ? safest.routeIndex : 0);
            } else {
              // API Key missing or other error -> Trigger Mock Mode
              console.warn("Directions request failed (possibly no API key). Using Mock Fallback.");
              setDirectionsResponse(null);
              
              // Generate Mock AI Results
              const mockResults = await analyzeRouteWithGemini(searchOrigin, searchDest, []);
              setAiResults(mockResults);
              setSelectedRouteIndex(0);
            }
            setIsSearching(false);
          }
        );
      } else {
        setIsSearching(false);
      }

    } catch (error) {
      console.error("Search failed", error);
      setIsSearching(false);
    }
  };

  // Auto-trigger search on mount when map loads
  useEffect(() => {
    if (isLoaded && !hasAutoSearched && origin && destination) {
        handleSearch();
        setHasAutoSearched(true);
    }
  }, [isLoaded, hasAutoSearched]);

  // Optional: Get User Location in background
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
        },
        (error) => console.error("Error getting location", error)
      );
    }
  }, []);

  const handleMapClick = (e: any) => {
      // Manual pin drop logic
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      // If we don't have a specific flow, assume setting Destination if Start exists
      if (startPoint && !endPoint) {
          setEndPoint({ lat, lng });
          setDestination(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else if (!startPoint) {
          setStartPoint({ lat, lng });
          setOrigin(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else {
          // Reset if both exist and clicked again? Or maybe just update destination
          setEndPoint({ lat, lng });
          setDestination(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
  };

  const resetSearch = () => {
    setDestination('');
    setEndPoint(null);
    setDirectionsResponse(null);
    setAiResults(null);
    // Keep start point as user location usually
    if (userLocation) {
        setStartPoint(userLocation);
        setOrigin("Vị trí hiện tại của bạn");
    } else {
        setOrigin('');
        setStartPoint(null);
    }
  };

  if (!isLoaded) return <LoadingState />;

  const currentRouteAnalysis = aiResults?.find(r => r.routeIndex === selectedRouteIndex);

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] rounded-2xl overflow-hidden border shadow-sm bg-slate-100 font-sans">
      
      {/* Map Background */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || defaultCenter}
        zoom={13}
        options={mapOptions}
        onClick={handleMapClick}
      >
        {/* Scenario 1: Real API Directions with Highlighting */}
        {directionsResponse && (
          <DirectionsRenderer
            key={selectedRouteIndex} // CRITICAL: Forces re-render when route selection changes to update color
            directions={directionsResponse}
            routeIndex={selectedRouteIndex}
            options={{
                polylineOptions: {
                    strokeColor: currentRouteAnalysis?.riskLevel === 'Low' ? '#10b981' : (currentRouteAnalysis?.riskLevel === 'Medium' ? '#f59e0b' : '#ef4444'),
                    strokeWeight: 7,
                    strokeOpacity: 0.9,
                    zIndex: 50 // Ensure on top
                },
                suppressMarkers: false, // Show standard A/B markers
            }}
          />
        )}

        {/* Scenario 2: Fallback Mock Line (If API fails or no key) */}
        {!directionsResponse && startPoint && endPoint && aiResults && (
             <Polyline 
                path={[startPoint, endPoint]}
                options={{
                    strokeColor: currentRouteAnalysis?.riskLevel === 'Low' ? '#10b981' : '#f97316',
                    strokeWeight: 6,
                    strokeOpacity: 0.8,
                    geodesic: true,
                    icons: [{
                        icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                        offset: '100%',
                        repeat: '20px'
                    }]
                }}
             />
        )}
        
        {/* Custom Start Marker (If not suppressed or fallback) */}
        {(!directionsResponse && startPoint) && (
            <Marker 
                position={startPoint} 
                icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#2563eb', // Blue
                    fillOpacity: 1,
                    strokeColor: 'white',
                    strokeWeight: 3,
                }}
                label={{ text: "A", color: "white", fontWeight: "bold" }}
            />
        )}

        {/* Custom End Marker (If not suppressed or fallback) */}
        {(!directionsResponse && endPoint) && (
             <Marker 
                position={endPoint} 
                icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#ef4444', // Red
                    fillOpacity: 1,
                    strokeColor: 'white',
                    strokeWeight: 3,
                }}
                animation={google.maps.Animation.DROP}
                label={{ text: "B", color: "white", fontWeight: "bold" }}
            />
        )}
      </GoogleMap>

      {/* --- FLOATING INPUT PANEL (Top Left) --- */}
      <div className="absolute top-4 left-4 z-10 w-full max-w-sm animate-in slide-in-from-left-4 duration-500">
        <Card className="bg-white/95 backdrop-blur-md shadow-xl border-none rounded-3xl p-5 space-y-4">
             <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-blue-600 fill-blue-100" />
                    Tìm lộ trình an toàn
                </h2>
                {isSearching && <span className="text-xs animate-pulse text-blue-600 font-medium">Đang AI phân tích...</span>}
             </div>
             
             <div className="space-y-4 relative">
                 {/* Decorative Connector Line */}
                 <div className="absolute left-[15px] top-[38px] bottom-[38px] w-0.5 border-l-2 border-dotted border-slate-300 z-0"></div>

                 <div className="relative z-10">
                     <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block">Điểm xuất phát</label>
                     <div className="flex items-center gap-3">
                         <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-50 shadow-sm flex-shrink-0"></div>
                         <div className="flex-1 relative">
                             <Input 
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 pl-3 pr-8 text-sm font-medium transition-all"
                                placeholder="Nhập địa điểm..." 
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                             />
                             <button 
                                onClick={() => {
                                    if (userLocation) {
                                        setStartPoint(userLocation);
                                        setOrigin("Vị trí hiện tại của bạn");
                                    }
                                }}
                                className="absolute right-2 top-3 text-blue-500 hover:text-blue-700"
                                title="Use my location"
                             >
                                 <Locate className="h-5 w-5" />
                             </button>
                         </div>
                     </div>
                 </div>

                 <div className="relative z-10">
                     <label className="text-xs font-bold text-slate-500 ml-1 mb-1.5 block">Điểm đến</label>
                     <div className="flex items-center gap-3">
                         <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-50 shadow-sm flex-shrink-0"></div>
                         <div className="flex-1 relative">
                             <Input 
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-red-100 pl-3 pr-8 text-sm font-medium transition-all"
                                placeholder="Bạn muốn đến đâu?" 
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                             />
                             {destination && <button onClick={resetSearch} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"><X className="h-4 w-4"/></button>}
                         </div>
                     </div>
                 </div>
             </div>

             <Button 
                onClick={() => handleSearch()} 
                disabled={isSearching || !destination}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 font-bold text-base transition-transform active:scale-95"
            >
                {isSearching ? 'Đang tìm kiếm...' : 'Tìm lộ trình'}
            </Button>
        </Card>
      </div>

      {/* --- RESULT CARDS (Bottom) --- */}
      {aiResults && (
        <div className="absolute bottom-6 left-4 right-4 z-10 flex flex-col md:flex-row gap-4 justify-center items-end pointer-events-none">
            {aiResults.map((route) => {
                const isSafest = route.type === 'Safest';
                const isSelected = selectedRouteIndex === route.routeIndex;
                
                return (
                    <div key={route.id} className="pointer-events-auto w-full md:w-80 animate-in slide-in-from-bottom-10 duration-500">
                        {/* Selected Indicator */}
                        {isSelected && (
                            <div className="mb-2 flex justify-center">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-2",
                                    isSafest ? "bg-emerald-500" : (route.riskLevel === 'Medium' ? "bg-orange-500" : "bg-red-500")
                                )}>
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    Đang hiển thị trên bản đồ
                                </span>
                            </div>
                        )}
                        
                        <Card 
                            onClick={() => setSelectedRouteIndex(route.routeIndex)}
                            className={cn(
                                "cursor-pointer transition-all duration-300 border-2 overflow-hidden backdrop-blur-xl shadow-2xl",
                                isSelected 
                                    ? (isSafest ? "border-emerald-500 ring-4 ring-emerald-500/20 bg-white" : (route.riskLevel === 'Medium' ? "border-orange-500 ring-4 ring-orange-500/20 bg-white" : "border-red-500 ring-4 ring-red-500/20 bg-white")) 
                                    : "border-transparent bg-white/80 hover:bg-white scale-95 opacity-80 hover:opacity-100 hover:scale-100"
                            )}
                        >
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">
                                            {isSafest ? 'Lộ trình An toàn nhất' : (route.type === 'Fastest' ? 'Lộ trình Nhanh nhất' : 'Lộ trình Thay thế')}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500 truncate max-w-[180px]">{route.summary}</p>
                                    </div>
                                    <div className={cn("p-2.5 rounded-xl shadow-sm", isSafest ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600")}>
                                        {isSafest ? <ShieldCheck className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100">
                                    <div className="text-center p-1 rounded-lg bg-slate-50">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thời gian</p>
                                        <p className="text-sm font-black text-slate-800">{route.duration}</p>
                                    </div>
                                    <div className="text-center p-1 rounded-lg bg-slate-50">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cự ly</p>
                                        <p className="text-sm font-black text-slate-800">{route.distance}</p>
                                    </div>
                                    <div className={cn("text-center p-1 rounded-lg", route.riskLevel === 'Low' ? 'bg-emerald-50' : 'bg-red-50')}>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rủi ro</p>
                                        <p className={cn("text-sm font-black", route.riskLevel === 'Low' ? 'text-emerald-600' : 'text-red-600')}>
                                            {route.riskLevel === 'Low' ? 'THẤP' : (route.riskLevel === 'Medium' ? 'VỪA' : 'CAO')}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* AI Path Note (Text Proposal) */}
                                {route.pathNote && (
                                   <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                      <p className="text-xs text-slate-600 italic leading-relaxed">
                                        "<span className="font-medium">{route.pathNote}</span>"
                                      </p>
                                   </div>
                                )}

                                {route.warnings.length > 0 && (
                                    <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2.5 border border-amber-100">
                                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-800 font-medium leading-relaxed">
                                            {route.warnings.map((w, i) => <p key={i}>• {w}</p>)}
                                        </div>
                                    </div>
                                )}

                                <Button className={cn(
                                    "w-full h-11 rounded-xl text-sm font-bold shadow-lg transition-all",
                                    isSafest 
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30" 
                                        : "bg-slate-800 hover:bg-slate-900 text-white shadow-slate-500/30"
                                )}>
                                    <Navigation className="h-4 w-4 mr-2" /> 
                                    {isSelected ? 'Bắt đầu di chuyển' : 'Xem chi tiết'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                );
            })}
        </div>
      )}
      
    </div>
  );
}