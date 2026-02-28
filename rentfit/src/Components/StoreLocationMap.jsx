import React, { useState, useEffect, useCallback } from "react";
import MapView from "./MapView";

const hasValidCoords = (lat, lng) =>
    lat !== null && lat !== undefined && lat !== "" &&
    lng !== null && lng !== undefined && lng !== "";

const StoreLocationMap = ({ onLocationSelect, initialLocation, city, readonly = false }) => {
    const [marker, setMarker] = useState(null);

    // Initialize marker from initialLocation
    useEffect(() => {
        if (hasValidCoords(initialLocation?.lat, initialLocation?.lng)) {
            setMarker({
                lat: parseFloat(initialLocation.lat),
                lng: parseFloat(initialLocation.lng),
            });
        }
    }, [initialLocation]);

    const onMapClick = useCallback(
        (e) => {
            if (readonly) return;
            const newPos = {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            };
            setMarker(newPos);
            if (onLocationSelect) {
                onLocationSelect(newPos.lat, newPos.lng);
            }
        },
        [readonly, onLocationSelect]
    );

    const handleManualChange = (e) => {
        const { name, value } = e.target;
        const newMarker = { ...marker, [name]: parseFloat(value) || 0 };
        setMarker(newMarker);
        if (onLocationSelect && hasValidCoords(newMarker.lat, newMarker.lng)) {
            onLocationSelect(newMarker.lat, newMarker.lng);
        }
    };

    return (
        <div className="space-y-4">
            {!readonly && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Latitude</label>
                        <input
                            type="number"
                            name="lat"
                            value={marker?.lat || ""}
                            onChange={handleManualChange}
                            placeholder="e.g. 27.7172"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Longitude</label>
                        <input
                            type="number"
                            name="lng"
                            value={marker?.lng || ""}
                            onChange={handleManualChange}
                            placeholder="e.g. 85.324"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                        />
                    </div>
                </div>
            )}

            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                <MapView
                    lat={marker?.lat}
                    lng={marker?.lng}
                    onMapClick={onMapClick}
                    readonly={readonly}
                    zoom={marker ? 15 : 12}
                />
            </div>

            {!readonly && (
                <p className="text-xs text-gray-500 mt-2 italic px-1">
                    💡 Click on the map or drag the marker to precisely set your shop location.
                </p>
            )}
        </div>
    );
};

export const searchAddressAndCenter = async (address, callback, setAlert) => {
    if (!address || address.trim() === "," || address.trim() === "") {
        if (setAlert) setAlert({ message: "Please enter a city and address first", type: "error" });
        return;
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'RentFit-App'
            }
        });
        const data = await res.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);

            if (callback) {
                callback({ lat, lng });
            }
        } else {
            if (setAlert) setAlert({ message: "Location not found. Please try a more specific address.", type: "error" });
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        if (setAlert) setAlert({ message: "Error fetching location. Please try again later.", type: "error" });
    }
};

export default React.memo(StoreLocationMap);

