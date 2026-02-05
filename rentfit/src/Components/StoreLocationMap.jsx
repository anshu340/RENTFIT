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

const StoreLocationMap = ({ onLocationSelect, initialLocation, readonly = false }) => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(() => {
        if (initialLocation && initialLocation.lat !== null && initialLocation.lat !== undefined) {
            return {
                lat: parseFloat(initialLocation.lat),
                lng: parseFloat(initialLocation.lng)
            };
        }
        return null;
    });
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (
            initialLocation &&
            initialLocation.lat !== null &&
            initialLocation.lat !== undefined &&
            initialLocation.lng !== null &&
            initialLocation.lng !== undefined
        ) {
            const newPos = {
                lat: parseFloat(initialLocation.lat),
                lng: parseFloat(initialLocation.lng),
            };
            setMarker(newPos);
            // If map is already loaded, pan to it
            if (mapRef.current) {
                mapRef.current.panTo(newPos);
            }
        }
    }, [initialLocation]);

    // Ensure map recenters dynamically when marker changes
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
