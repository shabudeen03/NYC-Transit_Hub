const express = require('express');
const router = express.Router();

const staticGTFSLoader = require("../utils/gtfsStaticLoader");
const realtimeGTFSLoader = require('../utils/gtfsRealtimeLoader');
const alertService = require('../utils/serviceAlerts')
const db = require('../database/db');

router.get("/static/:file", async (req, res) => {
    try {
        const file = req.params.file;

        //to avoid misuse by users
        const allowedFiles = [
            "stops", //station locations from stops.txt
            "routes", //train routes where it contains route + shape_id
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
                res.json({ data });
            } catch (err) {
                console.log("Error retrieving station data, message: ", err.message);
            }

            //filter data to only send list of parent stations
            // data = data.filter(stop => stop.location_type === "1");

            // res.json({ data });
        } else if(file === "routes") {
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

router.get("/static/routes/:stopId", async(req, res) => {
    try {
        const stopId = req.params.stopId;
        // console.log(typeof stopId);
        const data = await staticGTFSLoader.getRoutesForStopId(stopId);
        res.json({ data });
        // console.log(data);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: `Failed to load ${file}` });        
    }
});

router.get("/alerts", async(req, res) => {
    try {
        const alerts = await alertService.getSubwayAlerts();
        res.json(alerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load alerts" });
    }
});

router.get("/real/:stopId", async(req, res) => {
    try {
        const stopId = req.params.stopId;
        const data = await realtimeGTFSLoader.getFeed();
        const southBound = data[stopId + "S"];
        const northBound = data[stopId + "N"];
        res.json({ data: { south: southBound, north: northBound } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Export router
module.exports = router;