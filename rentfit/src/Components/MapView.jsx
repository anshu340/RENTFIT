import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { FaArrowRight, FaClock } from "react-icons/fa";

// Define custom icons for Open and Closed status
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Helper to determine if store is open (Moved here or passed as prop)
const checkStoreOpen = (opening, closing, now = new Date()) => {
    if (!opening || !closing) return true;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = opening.split(':').map(Number);
    const [closeH, closeM] = closing.split(':').map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
    if (closeTime > openTime) return currentTime >= openTime && currentTime <= closeTime;
    return currentTime >= openTime || currentTime <= closeTime;
};

const formatTime12h = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

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

const MapView = ({ lat, lng, stores = [], height = "400px", zoom = 13, onMapClick, readonly = false, now = new Date() }) => {
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
                    icon={blueIcon}
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
            {stores.map((store) => {
                const isOpen = checkStoreOpen(store.open_time, store.close_time, now);
                return hasValidCoords(store.latitude, store.longitude) && (
                    <Marker
                        key={store.id}
                        position={[parseFloat(store.latitude), parseFloat(store.longitude)]}
                        icon={isOpen ? greenIcon : redIcon}
                    >
                        <Popup>
                            <div className="p-3 min-w-[200px]">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 text-sm">{store.store_name}</h4>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isOpen ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {isOpen ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2 leading-relaxed">{store.store_address}</p>

                                {store.open_time && store.close_time ? (
                                    <p className="text-[11px] text-gray-600 flex items-center gap-1 mb-3">
                                        <FaClock className="text-purple-400" />
                                        <span className="font-bold">Hours:</span> {formatTime12h(store.open_time)} - {formatTime12h(store.close_time)}
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-gray-600 flex items-center gap-1 mb-3">
                                        <FaClock className="text-purple-400" />
                                        <span className="font-bold">Hours:</span> Open 24/7
                                    </p>
                                )}

                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-full gap-1 text-xs font-bold bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                                >
                                    🧭 Directions <FaArrowRight size={10} />
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

const hasValidCoords = (lat, lng) =>
    lat !== null && lat !== undefined && lat !== "" &&
    lng !== null && lng !== undefined && lng !== "";

export default MapView;
