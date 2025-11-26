const express = require('express');
const router = express.Router();

const staticGTFSLoader = require("../utils/gtfsStaticLoader");
const db = require('../database/db');

router.get("/static/:file", async (req, res) => {
    try {
        const file = req.params.file;

        //to avoid misuse by users
        const allowedFiles = [
            "stops", //station locations from stops.txt
            "routes", //train routes where it contains route + shape_id
            "shapes", //shape list from shapes.txt
        ];

        if(!allowedFiles.includes(file)) {
            return res.status(400).json({ error: "Invalid GTFS File name"});
        }

        if(file === "stops") {
            // const fileName = `${file}.txt`;
            // let data = await staticGTFSLoader.getFile(fileName);

            try {
                const query = db.prepare("SELECT * FROM stations WHERE location_type = ?")
                const data = query.all(1);
                // const rows = query.all();
                // console.log(rows[0]);
                // res.json({ rows });
                res.json({ data });
            } catch (err) {
                console.log("Error retrieving station data, message: ", err.message);
            }

            //filter data to only send list of parent stations
            // data = data.filter(stop => stop.location_type === "1");

            // res.json({ data });
        } else if(file === "shapes") {
            // const query = db.prepare("SELECT * FROM shapes");
            // const rows = query.all();
            // res.json({ rows });

            const fileName = `${file}.txt`;
            let shapeData = await staticGTFSLoader.getFile(fileName);

            //help filter this data to existing routes
            let tripsData = await staticGTFSLoader.getFile("trips.txt");

            //get all shape ids for existing trips
            const ids = new Map();
            for(const trip of tripsData) {
                if(!ids.has(trip.shape_id)) {
                    ids.set(trip.shape_id, trip.route_id);
                }
            }

            // only get shapes for existing trips
            const data = [];
            let idx = 0;
            while(idx < shapeData.length) {
                if(ids.has(shapeData[idx].shape_id)) {
                    let id = ids.get(shapeData[idx].shape_id);
                    const currList = [];
                    while(idx + 1 < shapeData.length && shapeData[idx].shape_id === shapeData[idx + 1].shape_id) {
                        currList.push([Number(shapeData[idx].shape_pt_lat), Number(shapeData[idx].shape_pt_lon)]);
                        idx++;
                    }

                    if(idx < shapeData.length) currList.push([Number(shapeData[idx].shape_pt_lat), Number(shapeData[idx].shape_pt_lon)]);
                    data.push({ route_id: id, shape_id: shapeData[idx].shape_id, coordinates: currList });
                    idx++;
                } else {
                    idx++;
                    while(idx < shapeData.length && shapeData[idx - 1].shape_id === shapeData[idx].shape_id) {
                        idx++;
                    }                    
                }
            }

            res.json({ data });
            // console.log(data[0]);
        } else if(file === "routes") {
            //get all the routes from routes.txt
            //get respective shape_ids

            // const data = await staticGTFSLoader.getFile("routes.txt");
            // const tripsData = await staticGTFSLoader.getFile("trips.txt");

            // //connect routes with their shape IDs
            // for(let i=0; i<data.length; i++) {
            //     for(const trip of tripsData) {
            //         if(trip.route_id === data[i].route_id && trip.shape_id !== '') {
            //             data[i].shape_id = trip.shape_id;
            //             break;
            //         }
            //     }
            // }

            // // console.log(routesData);
            // res.json({ data });

            const query = db.prepare(`
              SELECT 
                  r.route_id,
                  r.agency_id,
                  r.short_name,
                  r.long_name,
                  r.description,
                  r.route_type,
                  r.route_color,
                  r.route_text_color,
                  s.shape_id,
                  s.coordinates
              FROM train_routes r
              LEFT JOIN train_shape_routes trs
                ON r.route_id = trs.route_id
              LEFT JOIN shapes s
                  ON trs.shape_id = s.shape_id
              --GROUP BY r.route_id;
              --WHERE r.route_id = ?;
            `);

            const rows = query.all();
            // console.log(rows[0], rows[1], rows[5]);
            const data = rows.map(row => ({
                ...row,
                coordinates: row.coordinates ? JSON.parse(row.coordinates) : null
            }));

            res.json({ data });

        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to load ${file}` });
    }
});

// Export router
module.exports = router;