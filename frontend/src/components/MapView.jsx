import { useState, useEffect } from "react";
import { MapContainer, useMap, TileLayer, Marker, Popup, CircleMarker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon bug in Leaflet + React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// import LocationMarker from "./UserLocation";
import PingMarker from "./UserPing";
import StationMarker from "./StationMarker";

function MoveZoomControl() {
  const map = useMap();

  useEffect(() => {
    map.zoomControl.remove();
    const zoom = L.control.zoom({ position: "bottomright" });

    zoom.addTo(map);

    return () => {
      zoom.remove();
    };
  }, []);

  return null;
}

export default function MapView({ stations, routes, alerts }) {
  const [showStations, setShowStations] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [clickedPos, setClickedPos] = useState(null);

  // console.log(routes);

  const toggleStations = () => setShowStations(prev => !prev);
  const toggleRoutes = () => setShowRoutes(prev => !prev);
  const toggleAlerts = () => setShowAlerts(prev => !prev);

  const nycBounds = [
    [40.48, -74.30], // Southwest corner
    [40.95, -73.65]  // Northeast corner
  ];

  const handleLocationPing = (coords) => {
    console.log("User location pinged:", coords);
    // Do something with coords in parent
  };

  // console.log(lines);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[40.7128, -74.006]} // NYC center
        zoom={12}
        minZoom={11}
        maxZoom={18}
        maxBounds={nycBounds}
        maxBoundsViscosity={1.0}
        className="map"
        style={{ height: "100vh", width: "100%" }}
        attributionControl={false}
      >
        {/* <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        /> */}
        <TileLayer
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png"
          attribution='&copy; CartoDB'
        />

        <MoveZoomControl />

        <PingMarker onClickLocation={setClickedPos} />
        {clickedPos && (
          <Marker position={clickedPos}>
            <Popup>Clicked here!</Popup>
          </Marker>
        )}
        {/* <LocationMarker onLocationClick={handleLocationPing} /> */}

        {showRoutes && routes.map(route => (
          <Polyline 
            // key={route.route_id}
            key={crypto.randomUUID()}
            positions={route.coordinates}
            // pathOptions={{ color: "#ff4500", weight: 1 }}
            pathOptions={{ color: `#${route.route_color}`, weight: 2, opacity: 0.9 }}
          />
        ))}

        {showAlerts && alerts && alerts.map(alert => (
          <CircleMarker
            key={crypto.randomUUID()}
            center={alert.coordinates}
            radius={6}
            color="#ff0000"
            fillColor="#ff0000"
            fillOpacity={1}
          >
            <Popup>{alert.desc}</Popup>
          </CircleMarker>
        ))}

        {showStations && stations.map(station => (
          <CircleMarker
            center={[station.stop_lat, station.stop_lon]}
            radius={2}
            color="#555555"
            fillColor="#2563eb"
            fillOpacity={0.1}
            key={crypto.randomUUID()}
          >
            <StationMarker station={station} />
          </CircleMarker>
        ))}


      </MapContainer>


      {/* Toggle Controls */}
      <div className="map-toggle-controls">
        <h3>Map Controls</h3>
        <hr />
        <br />
        <div>
          <input
            type="checkbox"
            checked={showStations}
            onChange={toggleStations}
            id="stationsToggle"
            className="styled-check"
          />
          <label htmlFor="stationsToggle" style={{ marginLeft: "6px" }}>Stations</label>
        </div>

        <div>
          <input
            type="checkbox"
            checked={showRoutes}
            onChange={toggleRoutes}
            id="linesToggle"
            className="styled-check"
          />
          <label htmlFor="linesToggle" style={{ marginLeft: "6px" }}>Subway Lines</label>
        </div>

        <div>
          <input
            type="checkbox"
            checked={showAlerts}
            onChange={toggleAlerts}
            id="alertsToggle"
            className="styled-check"
          />
          <label htmlFor="alertsToggle" style={{ marginLeft: "6px" }}>Alerts</label>
        </div>
      </div>
    </div>
  );
}
