import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from "react-leaflet";
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

// Dummy data examples
const sampleStations = [
  { stop_id: "101", stop_name: "Van Cortlandt Park", stop_lat: 40.889248, stop_lon: -73.898583 },
  { stop_id: "102", stop_name: "238 St", stop_lat: 40.881, stop_lon: -73.900 }
];

const sampleLines = [
  { shape_id: "A", list: [[40.889, -73.898], [40.881, -73.900], [40.873, -73.906]] }
];

const sampleAlerts = [
  { id: "alert1", coordinates: [40.885, -73.902], message: "Service delay" }
];

export default function MapView({ stations = sampleStations, routes = sampleLines, alerts = sampleAlerts }) {
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
        zoom={11}
        minZoom={11}
        maxZoom={18}
        maxBounds={nycBounds}
        maxBoundsViscosity={1.0}
        className="map"
        style={{ height: "80vh", width: "100%" }}
      >
        {/* <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        /> */}
        <TileLayer
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png"
          attribution='&copy; CartoDB'
        />

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

        {showStations && stations.map(station => (
          <CircleMarker
            center={[station.stop_lat, station.stop_lon]}
            radius={2}
            color="#000000"
            fillColor="#000000"
            fillOpacity={1}
            key={crypto.randomUUID()}
          >
            <StationMarker station={station} />
          </CircleMarker>
        ))}

        {showAlerts && sampleAlerts.map(alert => (
          <CircleMarker
            key={alert.id}
            center={alert.coordinates}
            radius={6}
            color="#ff0000"
            fillColor="#ff0000"
            fillOpacity={1}
          >
            <Popup>{alert.message}</Popup>
          </CircleMarker>
        ))}


      </MapContainer>


      {/* Toggle Controls */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
        }}
      >
        <div>
          <input
            type="checkbox"
            checked={showStations}
            onChange={toggleStations}
            id="stationsToggle"
          />
          <label htmlFor="stationsToggle" style={{ marginLeft: "6px" }}>Stations</label>
        </div>

        <div>
          <input
            type="checkbox"
            checked={showRoutes}
            onChange={toggleRoutes}
            id="linesToggle"
          />
          <label htmlFor="linesToggle" style={{ marginLeft: "6px" }}>Subway Lines</label>
        </div>

        <div>
          <input
            type="checkbox"
            checked={showAlerts}
            onChange={toggleAlerts}
            id="alertsToggle"
          />
          <label htmlFor="alertsToggle" style={{ marginLeft: "6px" }}>Alerts</label>
        </div>
      </div>
    </div>
  );
}
