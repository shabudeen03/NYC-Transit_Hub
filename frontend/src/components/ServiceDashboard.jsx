import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

export default function ServiceDashboard({ newAlerts }) {
    const [alerts, setAlerts] = useState(newAlerts);

    useEffect(() => {
      setAlerts(newAlerts);
    }, [newAlerts]);
    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     async function load() {
    //         try {
    //             const res = await axios.get("http://localhost:5000/api/train/alerts");
    //             const cache = localStorage.getItem("routeDataCache");
    //             const cachedStations = JSON.parse(cache).data.stops;
                
    //             // console.log(res.data);
    //             // console.log(cachedStations);

    //             for(const alert of res.data) {
    //               const affectedStations = alert.affectedStations.map(s => {
    //                 for(const stop of cachedStations) {
    //                   if(s.stopId === stop.stop_id + "N" || s.stopId === stop.stop_id + "S") {
    //                     // console.log(s, stop);
    //                     return { ...s, name: stop.stop_name, coordinates: [stop.stop_lat, stop.stop_lon] };
    //                   }
    //                 }

    //                 return null;
    //               });

    //               const filtered = affectedStations.filter(s => s);

    //               alert.affectedStations = filtered;  
    //             }

    //             initializeAlerts(res.data);
    //             setAlerts(res.data);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     load();
    // }, []);

    // if(loading) {
    //     return <p>Loading service alerts...</p>;
    // }

    return (
    <div style={{ padding: "20px" }}>
      <h1>MTA Subway Service Alerts</h1>

      {alerts.map(alert => (
        <div
          key={crypto.randomUUID()}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            background: "#fff"
          }}
        >
          <h2>{alert.header}</h2>

          {alert.desc && <h4>{alert.desc}</h4>}

          <br />

          {alert.affectedRoutes.length > 0 && (
            <>
                <h3>Affected Routes:</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  {alert.affectedRoutes.map(r => (
                    <span
                      key={r}
                      style={{
                        padding: "6px 10px",
                        background: "#222",
                        color: "#fff",
                        borderRadius: "4px"
                      }}
                    >
                      {r}
                    </span>
                    ))}
                </div>
            </>
            )}

          <br />

          {alert.affectedStations.length > 0 && (
            <>
              <h3>Affected Stations:</h3>
              <ul>
                {alert.affectedStations.map(s => (
                  <li key={crypto.randomUUID()}>
                    {s.name} ({(s.stopId[s.stopId.length - 1] === 'S') ? 'Southbound platform' : 'Northbound platform'})
                  </li>
                ))}
              </ul>
            </>
          )}

          <h3>Active Period:</h3>
          <ul>
            {alert.activePeriods.map((p, idx) => (
              <li key={idx}>
                Start: {p.start || "Unknown"}  
                {p.end ? ` → End: ${p.end}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    )
}