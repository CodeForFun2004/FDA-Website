'use client';

import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Marker,
  Polyline
} from '@react-google-maps/api';
import { LoadingState } from '@/components/ui/common';
import { analyzeRouteWithGemini, mockGeocode } from '@/lib/api';
import { RouteAnalysis } from '@/lib/types';
import { FloatingInputPanel } from '../components/FloatingInputPanel';
import { RouteResultCards } from '../components/RouteResultCards';

declare const google: any;

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 16.03,
  lng: 108.22
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false
};

export default function RoutesPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: '' // ENTER YOUR GOOGLE MAPS API KEY HERE
  });

  // State - Defaulting to the requested demo route
  const [origin, setOrigin] = useState('FPT Software Đà Nẵng');
  const [destination, setDestination] = useState('Co.opmart Đà Nẵng');
  const [isSearching, setIsSearching] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  // Locations
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [startPoint, setStartPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [endPoint, setEndPoint] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // Directions
  const [directionsResponse, setDirectionsResponse] = useState<any>(null);
  const [aiResults, setAiResults] = useState<RouteAnalysis[] | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  // Function to handle route search
  const handleSearch = async (
    overrideOrigin?: string,
    overrideDest?: string
  ) => {
    const searchOrigin = overrideOrigin || origin;
    const searchDest = overrideDest || destination;

    if (!searchDest) return;
    setIsSearching(true);
    setAiResults(null);
    setDirectionsResponse(null);

    try {
      // 1. Resolve Coordinates
      let startCoords = startPoint;
      if (
        !startCoords ||
        (searchOrigin && searchOrigin !== 'Vị trí hiện tại của bạn')
      ) {
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
            provideRouteAlternatives: true // IMPORTANT: Get multiple routes
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
              const results = await analyzeRouteWithGemini(
                searchOrigin,
                searchDest,
                availableRoutes
              );
              setAiResults(results);

              const safest = results.find((r) => r.type === 'Safest');
              setSelectedRouteIndex(safest ? safest.routeIndex : 0);
            } else {
              // API Key missing or other error -> Trigger Mock Mode
              console.warn(
                'Directions request failed (possibly no API key). Using Mock Fallback.'
              );
              setDirectionsResponse(null);

              // Generate Mock AI Results
              const mockResults = await analyzeRouteWithGemini(
                searchOrigin,
                searchDest,
                []
              );
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
      console.error('Search failed', error);
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
            lng: position.coords.longitude
          };
          setUserLocation(loc);
        },
        (error) => console.error('Error getting location', error)
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
      setOrigin('Vị trí hiện tại của bạn');
    } else {
      setOrigin('');
      setStartPoint(null);
    }
  };

  const handleUseMyLocation = () => {
    if (userLocation) {
      setStartPoint(userLocation);
      setOrigin('Vị trí hiện tại của bạn');
    }
  };

  if (!isLoaded) return <LoadingState />;

  const currentRouteAnalysis = aiResults?.find(
    (r) => r.routeIndex === selectedRouteIndex
  );

  return (
    <div className='relative h-[calc(100vh-5rem)] w-full overflow-hidden rounded-2xl border bg-slate-100 font-sans shadow-sm'>
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
                strokeColor:
                  currentRouteAnalysis?.riskLevel === 'Low'
                    ? '#10b981'
                    : currentRouteAnalysis?.riskLevel === 'Medium'
                      ? '#f59e0b'
                      : '#ef4444',
                strokeWeight: 7,
                strokeOpacity: 0.9,
                zIndex: 50 // Ensure on top
              },
              suppressMarkers: false // Show standard A/B markers
            }}
          />
        )}

        {/* Scenario 2: Fallback Mock Line (If API fails or no key) */}
        {!directionsResponse && startPoint && endPoint && aiResults && (
          <Polyline
            path={[startPoint, endPoint]}
            options={{
              strokeColor:
                currentRouteAnalysis?.riskLevel === 'Low'
                  ? '#10b981'
                  : '#f97316',
              strokeWeight: 6,
              strokeOpacity: 0.8,
              geodesic: true,
              icons: [
                {
                  icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                  offset: '100%',
                  repeat: '20px'
                }
              ]
            }}
          />
        )}

        {/* Custom Start Marker (If not suppressed or fallback) */}
        {!directionsResponse && startPoint && (
          <Marker
            position={startPoint}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#2563eb', // Blue
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 3
            }}
            label={{ text: 'A', color: 'white', fontWeight: 'bold' }}
          />
        )}

        {/* Custom End Marker (If not suppressed or fallback) */}
        {!directionsResponse && endPoint && (
          <Marker
            position={endPoint}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#ef4444', // Red
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 3
            }}
            animation={google.maps.Animation.DROP}
            label={{ text: 'B', color: 'white', fontWeight: 'bold' }}
          />
        )}
      </GoogleMap>

      {/* --- FLOATING INPUT PANEL (Top Left) --- */}
      <FloatingInputPanel
        origin={origin}
        destination={destination}
        isSearching={isSearching}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onSearch={() => handleSearch()}
        onReset={resetSearch}
        onUseMyLocation={handleUseMyLocation}
      />

      {/* --- RESULT CARDS (Bottom) --- */}
      {aiResults && (
        <RouteResultCards
          routes={aiResults}
          selectedRouteIndex={selectedRouteIndex}
          onSelectRoute={setSelectedRouteIndex}
        />
      )}
    </div>
  );
}

// Named export for compatibility
export { RoutesPage as RoutesView };
