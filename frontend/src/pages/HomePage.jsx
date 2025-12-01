// import "../App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import "../stylesheets/Main.css";

import ServiceDashboard from "../components/ServiceDashboard";
import HomeMap from "../components/StationsMap";

import Header from "../components/Header";

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("Open");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function load() {
        try {
            const res = await axios.get("http://localhost:5000/api/train/alerts");
            const cache = localStorage.getItem("routeDataCache");
            const cachedStations = JSON.parse(cache).data.stops;
            
            // console.log(res.data);
            // console.log(cachedStations);
            for(const alert of res.data) {
              const affectedStations = alert.affectedStations.map(s => {
                for(const stop of cachedStations) {
                  if(s.stopId === stop.stop_id + "N" || s.stopId === stop.stop_id + "S") {
                    // console.log(s, stop);
                    return { ...s, name: stop.stop_name, coordinates: [stop.stop_lat, stop.stop_lon] };
                  }
                }
                return null;
              });
              const filtered = affectedStations.filter(s => s);
              alert.affectedStations = filtered;  
            }

            const alertList = [];
            for(const alert of res.data) {
              for(const affectedStation of alert.affectedStations) {
                alertList.push({ ...affectedStation, desc: alert.desc });
              }
            }

            // initializeAlerts(res.data);
            // console.log(res.data);
            setAlerts({ general: res.data, specific: alertList });
        } finally {
            // setLoading(false);
        }
    }
    load();
  }, []);

  const toggle = () => {
    if(showModal) {
      setModalText("Open");
      setShowModal(false);
    } else {
      setModalText("Close");
      setShowModal(true);
    }
  };  

  return (
    <>
      <Header name="home-header" />
      <div className="home-container full-screen-map">
        <div className="map-background">
          <HomeMap alerts={alerts.specific} />
        </div>

        <button
          className="showDashboardBtn"
          onClick={toggle}
        >
          {modalText} Service Dashboard
        </button>

        {showModal && (
          <div className="dashboard-fixed-modal">
            <div className="dashboard-title">Service Dashboard</div>
            <div className="dashboard-container">
              <ServiceDashboard newAlerts={alerts.general} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
