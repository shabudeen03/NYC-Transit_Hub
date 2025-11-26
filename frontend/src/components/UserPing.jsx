import { useEffect } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const clickIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export default function PingMarker({ onClickLocation }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      console.log("Map clicked at:", e.latlng);
      if (onClickLocation) {
        onClickLocation(e.latlng); // pass coordinates to parent
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onClickLocation]);

  return null; // no marker by default, parent can render one if desired
}
