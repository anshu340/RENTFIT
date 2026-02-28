import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { FaArrowRight } from "react-icons/fa";

// Component to handle map clicks
const MapEvents = ({ onClick }) => {
    useMapEvents({
        click(e) {
            if (onClick) {
                onClick(e);
            }
        },
    });
    return null;
};

// Component to handle dynamic centering and zooming
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

const MapView = ({ lat, lng, stores = [], height = "400px", zoom = 13, onMapClick, readonly = false }) => {
    // Default position if lat/lng are missing
    const defaultPosition = [27.7172, 85.324];
    const position = lat && lng ? [parseFloat(lat), parseFloat(lng)] : defaultPosition;

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={false}
            style={{ height: height, width: '100%' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ChangeView center={position} zoom={zoom} />

            {!readonly && onMapClick && <MapEvents onClick={onMapClick} />}

            {/* If we have a single lat/lng, show one marker */}
            {lat && lng && !stores.length && (
                <Marker
                    position={position}
                    draggable={!readonly && !!onMapClick}
                    eventHandlers={{
                        dragend: (e) => {
                            if (onMapClick) {
                                const { lat, lng } = e.target.getLatLng();
                                onMapClick({ latlng: { lat, lng } });
                            }
                        },
                    }}
                >
                    <Popup>
                        <div className="text-center p-1">
                            <p className="font-semibold text-gray-800">Selected Location</p>
                            <p className="text-xs text-gray-500">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* If we have an array of stores, show multiple markers */}
            {stores.map((store) => (
                hasValidCoords(store.latitude, store.longitude) && (
                    <Marker
                        key={store.id}
                        position={[parseFloat(store.latitude), parseFloat(store.longitude)]}
                    >
                        <Popup>
                            <div className="p-3 min-w-[180px]">
                                <h4 className="font-bold text-gray-900 text-sm">{store.store_name}</h4>
                                <p className="text-xs text-gray-600 mt-1 mb-2 leading-relaxed">{store.store_address}</p>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                    🧭 Directions <FaArrowRight size={10} className="mt-0.5" />
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
};

const hasValidCoords = (lat, lng) =>
    lat !== null && lat !== undefined && lat !== "" &&
    lng !== null && lng !== undefined && lng !== "";

export default MapView;
