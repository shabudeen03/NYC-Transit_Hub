import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Popup } from "react-leaflet";
import axios from "axios";

import FavoriteButton from "./FavBtn";

export default function StationMarker({ station }) {
    const { user } = useContext(AuthContext);
    // console.log(station)
    const [data, setData] = useState({ routes: null, isFav: false });
    const [popupOpen, setPopupOpen] = useState(false);

    useEffect(() => {
        if(!popupOpen) return;

        const cleanUpData = async(list) => {
            console.log(list);
            const expNorth = (list.north) ? list.north.filter(item => item.arrival >= Date.now()) : [];
            const expSouth = (list.south) ? list.south.filter(item => item.arrival >= Date.now()) : [];
            const combined = [...expNorth, ...expSouth].sort((a, b) => a.arrival - b.arrival);
            const final = combined.slice(0, 6); //return first 6 trains arriving only
            return final;
        }

        const fetchData = async() => {
            try {
                if(user) {
                    const [favRes, routesRes, expected] = await Promise.all([
                    // const [routesRes] = await Promise.all([
                        axios.get("http://localhost:5000/user/favorites/get", {
                            params: { 
                                fid: station.stop_id 
                            },
                            headers: {
                                "x-user-id": user.id
                            }
                        }),
                        axios.get("http://localhost:5000/api/train/static/routes/" + station.stop_id),
                        axios.get("http://localhost:5000/api/train/real/" + station.stop_id)
                    ]);

                    const cleaned = await cleanUpData(expected.data.data);

                    // console.log("Expected:",expected.data.data);
                    // console.log("HI");

                    // console.log("Fav data: ", favRes.data.isFavorite);
                    // console.log("Routes: ", routesRes.data.data);

                    // if(favRes.data.isFavorite) {
                    //     setIsFav(true);
                    // }

                    // setRoutes(routesRes.data.data);
                    setData({ routes: routesRes.data.data, isFav: !!favRes.data.isFavorite, expected: cleaned });
                } else {
                    const routesRes = await axios.get("http://localhost:5000/api/train/static/routes/" + station.stop_id);
                    const expected = await axios.get("http://localhost:5000/api/train/real/" + station.stop_id);
                    const cleaned = await cleanUpData(expected.data.data);
                    // console.log("Expected:", expected.data.data);
                    // setRoutes(routesRes.data.data);
                    setData({
                        ...data,
                        routes: routesRes.data.data,
                        expected: cleaned
                    });
                }
            } catch(err) {
                console.error(err);
            }
        };

        fetchData();
    }, [popupOpen]);

    const toggleFav = async () => {
        console.log(`Toggle from ${data.isFav} to ${!data.isFav}`);

        if(!data.isFav) {
            await axios.post("http://localhost:5000/user/favorites/update", null, {
                params: { fid: station.stop_id },
                headers: { "x-user-id": user.id }
            });
        } else {
            await axios.delete("http://localhost:5000/user/favorites/update", {
                params: { fid: station.stop_id },
                headers: { "x-user-id": user.id }
            });
        }

        // setIsFav(prev => !prev);
        setData({
            ...data,
            isFav: !data.isFav
        });
    };

    //fav routes
    //initially
        //get request
        //if favorited, set state to true

    //now toggle
    //if was fav but now unfav
        //delete request
    //if wasn't fav but now fav
        //post request

    return (<>
        <Popup
            eventHandlers={{
                add: () => setPopupOpen(true),
                remove: () => setPopupOpen(false)
            }}
        >
            <div
                className="station-popup"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {!data.routes ? (
                    <div>Loading...</div>
                ) : (<>
                    <div className="popup-title">{station.stop_name}</div>
                    
                    <div className="popup-line">ID: {station.stop_id}</div>
                    
                    <div className="popup-section-title">Trains:</div>
                    <ul className="popup-list">
                        {data.routes.map(route => 
                            (<li key={route.route_id}>{route.route_id}</li>)
                        )}
                    </ul>
                    <br />
                    <div className="popup-section-title">Current Train ETA:</div>
                    <ul className="poup-list">
                        {data.expected && data.expected.map(trip => (
                            <li key={crypto.randomUUID()}>{trip.route} train heading {(trip.stopId === station.stop_id + "S") ? "Southbound" : "Northbound"} expected in {Math.round((trip.arrival - Date.now()) / (60 * 1000))} mins</li>
                        ))}
                    </ul>
                    {user && (
                        <div className="popup-fav">
                            <FavoriteButton isFavorite={data.isFav} toggle={toggleFav} />
                        </div>
                    )}
                </>)}
            </div>
        </Popup>
    </>)
}