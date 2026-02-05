import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";

const containerStyle = {
    width: "100%",
    height: "400px",
};

const defaultCenter = {
    lat: 27.7172, // Kathmandu Default
    lng: 85.324,
};

const libraries = ['places'];

const hasValidCoords = (lat, lng) =>
    lat !== null && lat !== undefined &&
    lng !== null && lng !== undefined;

// Utility to geocode address and return coordinates
export const searchAddressAndCenter = (address, callback) => {
    if (!address) return;

    if (!window.google || !window.google.maps) {
        console.warn("Google Maps API not loaded yet");
        return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
            const loc = results[0].geometry.location;
            const lat = loc.lat();
            const lng = loc.lng();
            callback({ lat, lng });
        } else {
            console.error("Geocoding failed with status:", status);
            let userMessage = "Could not find the location. Try a more specific address.";

            if (status === "REQUEST_DENIED") {
                userMessage = "Google Maps API request denied. Ensure 'Geocoding API' is enabled in your Google Cloud Console and billing is active.";
            } else if (status === "OVER_QUERY_LIMIT") {
                userMessage = "Too many requests. Check your Google Maps billing profile.";
            }

            alert(userMessage);
        }
    });
};

const StoreLocationMap = ({ onLocationSelect, initialLocation, city, readonly = false }) => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);

    // Smart Centering Logic
    useEffect(() => {
        if (mapRef.current) {
            if (hasValidCoords(initialLocation?.lat, initialLocation?.lng)) {
                // Precision centering on saved marker
                const center = {
                    lat: parseFloat(initialLocation.lat),
                    lng: parseFloat(initialLocation.lng),
                };
                setMarker(center);
                mapRef.current.panTo(center);
                mapRef.current.setZoom(15);
            } else if (city) {
                // Smart fallback: center on city hint
                searchAddressAndCenter(city, (coords) => {
                    if (mapRef.current) {
                        mapRef.current.panTo(coords);
                        mapRef.current.setZoom(13);
                    }
                });
            } else {
                // Final fallback: Kathmandu
                mapRef.current.panTo(defaultCenter);
                mapRef.current.setZoom(12);
            }
        }
    }, [initialLocation, city, map]);

    // Ensure map recenters dynamically when marker changes (user clicks)
    useEffect(() => {
        if (mapRef.current && marker) {
            mapRef.current.panTo(marker);
        }
    }, [marker]);

    const onMapClick = useCallback(
        (e) => {
            if (readonly) return;
            const newPos = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            };
            setMarker(newPos);
            if (onLocationSelect) {
                onLocationSelect(newPos.lat, newPos.lng);
            }
        },
        [readonly, onLocationSelect]
    );

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const newPos = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                setMarker(newPos);
                map.panTo(newPos);
                map.setZoom(15);
                if (onLocationSelect && !readonly) {
                    onLocationSelect(newPos.lat, newPos.lng);
                }
            }
        }
    };

    const onLoad = useCallback(function callback(map) {
        mapRef.current = map;
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    if (!isLoaded) return <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Maps...</div>;

    return (
        <div className="space-y-4">
            {!readonly && (
                <div className="relative">
                    <Autocomplete
                        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <input
                            type="text"
                            placeholder="Search for your shop location..."
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none shadow-sm mb-2"
                        />
                    </Autocomplete>
                </div>
            )}

            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={marker || defaultCenter}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                    }}
                >
                    {marker && <Marker position={marker} animation={window.google.maps.Animation.DROP} />}
                </GoogleMap>
            </div>

            {!readonly && (
                <p className="text-xs text-gray-500 mt-2 italic px-1">
                    💡 Click on the map to precisely mark your shop location.
                </p>
            )}
        </div>
    );
};

export default React.memo(StoreLocationMap);
