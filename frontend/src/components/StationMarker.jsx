import { useState } from "react";
import { Popup } from "react-leaflet";

import FavoriteButton from "./FavBtn";

export default function StationMarker({ station }) {
    // console.log(station)
    return (<>
        <Popup>
            <strong>{station.stop_name}</strong>
            <br />
            ID: {station.stop_id}
            <br />
            <FavoriteButton />
        </Popup>
    </>)
}