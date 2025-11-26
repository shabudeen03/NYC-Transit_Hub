import { useEffect, useState } from "react";
import axios from "axios";
import MapView from "./MapView";
import "../App.css";

export default function StationsMap() {
  // const [stations, setStations] = useState([]);
  // const [routes, setRoutes] = useState([]);
  // const [shapes, setShapes] = useState([]);
  const [routeData, setRouteData] = useState({ stops: [], routes: [] });
  // const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        // const [stopsRes, routesRes, shapesRes] = await Promise.all([
        const [stopsRes, routesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/train/static/stops"),
          axios.get("http://localhost:5000/api/train/static/routes"),
          // axios.get("http://localhost:5000/api/train/static/shapes")
        ]);

        //This should be done on backend
        // for(let i=0; i<shapesRes.data.data.length; i++) {
        //   let shape = shapesRes.data.data[i];

        //   let routeId = shape.route_id;
        //   for(const route of routesRes.data.data) {
        //     if(route.route_id === routeId) {
        //       shape.routeColor = route.route_color;
        //       break;
        //     }
        //   }
        // }

        // console.log(shapesRes.data.data[0]);
        // console.log(routesRes.data.data[0]);

        for(const route of routesRes.data.data) {
          if(route.coordinates === null) {
            console.log(route.route_id);
            route.coordinates = [];
          }
        }


        // setRouteData({ stops: stopsRes.data.data, shapes: shapesRes.data.data, routes: routesRes.data.data });
        setRouteData({ stops: stopsRes.data.data, routes: routesRes.data.data });
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
  return <MapView stations={routeData.stops} routes={routeData.routes} />;
}
