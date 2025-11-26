//Geolocation needed as permission
//Instead use a ping


import { useState, useEffect } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom icon to distinguish the user's location
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export default function LocationMarker({ onLocationClick }) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  // Track user's actual location
  useEffect(() => {
    function onLocationFound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    }

    function onLocationError(e) {
      console.warn("Geolocation failed:", e.message);
    }

    map.on("locationfound", onLocationFound);
    map.on("locationerror", onLocationError);

    map.locate({ setView: false, watch: true });

    return () => {
      map.off("locationfound", onLocationFound);
      map.off("locationerror", onLocationError);
    };
  }, [map]);

  // Handle click on map to "ping" user's location
  useEffect(() => {
    const handleClick = () => {
      if (position && onLocationClick) {
        onLocationClick(position); // send coordinates to parent
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, position, onLocationClick]);

  return position ? (
    <Marker position={position} icon={customIcon}>
      <Popup>You are here!</Popup>
    </Marker>
  ) : null;
}