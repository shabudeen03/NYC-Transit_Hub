import { useEffect, useState } from "react";
import axios from "axios";
import MapView from "./MapView";
import "../App.css";

export default function StationsMap({ alerts }) {
  const [routeData, setRouteData] = useState({ stops: [], routes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        //ease the burden on the backend!
        //on average, faster loading times too!
        const cached = localStorage.getItem("routeDataCache");

        if(cached) {
          const parsed = JSON.parse(cached);
          const oneDay = 24 * 60 * 60 * 1000;
          if(Date.now() - parsed.timestamp < oneDay) {
            console.log("Loaded route data from cache");
            setRouteData(parsed.data);
            setLoading(false);
            return;
          }
        }

        console.log("Fetching route data from server");
        const [stopsRes, routesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/train/static/stops"),
          axios.get("http://localhost:5000/api/train/static/routes"),
        ]);

        for(const route of routesRes.data.data) {
          if(route.coordinates === null) {
            console.log(route.route_id);
            route.coordinates = [];
          }
        }

        //now save and set 
        const freshData = {
          stops: stopsRes.data.data,
          routes: routesRes.data.data
        };

        localStorage.setItem(
          "routeDataCache",
          JSON.stringify({
            timestamp: Date.now(),
            data: freshData
          })
        );

        setRouteData(freshData);
      } catch (error) {
        console.error("Error fetching stations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  if (loading) return <p>Loading stations...</p>;

  // return <MapView stations={routeData.stops} lines={routeData.shapes} routes={routeData.routes} />;
  return <MapView stations={routeData.stops} routes={routeData.routes} alerts={alerts} />;
}
