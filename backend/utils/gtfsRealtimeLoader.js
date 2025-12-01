const axios = require("axios");
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const path = require("path");

const db = require('../database/db');
const cache = require('./cache');

const CACHE_KEY = "trips";
const CACHE_TTL = 30; //30 seconds cache

const DIVISIONS = ['ACEH', "BDFMFS", "G", "JZ", "NQRW", 'L', "1234567GS", "SIR"];

const URL_BINDINGS = {
  "ACEH": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
  "BDFMFS": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
  "G": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g",
  "JZ": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz",
  "NQRW": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
  "L": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l",
  "1234567GS":  "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",
  "SIR": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si"
};

async function fetchDivision(url) {
    const response = await axios({
        method: 'get',
        url: url,
        headers: { 'Accept': 'application/x-protobuf' },
        responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);
    const tripUpdates = feed.entity.map(entity => entity.tripUpdate);
    return tripUpdates;
}

/* Fetching realtime data */
async function fetchFeed(div) {
    try {
        const url = URL_BINDINGS[div];
        const tripUpdates = await fetchDivision(url);       
        // console.log(tripUpdates[0].stopTimeUpdate[0]);
        const data = [];
        for (const el of tripUpdates) {
            if(el) {
                el.stopTimeUpdate.forEach(stu => {
                    //MTA DOES NOT USE delay, stop_squence --. https://www.mta.info/document/134521
                    data.push({
                        route: el.trip.routeId, 
                        arrival: stu.arrival ? stu.arrival.time.toNumber() * 1000 : null, 
                        departure: stu.departure ? stu.departure.time.toNumber() * 1000 : null, 
                        stopId: stu.stopId ? stu.stopId.toString() : ""
                    });
                });
            }
        }

        return data;
    } catch (err) {
        console.error("Error fetching realtime data, ", err.message);
        return null;
    }
}

async function setFeeds(trips) {
    console.log("# Trips to process: ", trips.length);
    const stationMap = {}; //Map of arrivals at a station, use object as maps can't be serialized
    for(const trip of trips) {
        const arrivals = stationMap[trip.stopId] || [];
        arrivals.push(trip);
        stationMap[trip.stopId] = arrivals;
    }

    return stationMap;
}

async function getFormattedTrips() {
    const data = [];
    for (const div of DIVISIONS) {
        // console.log(div);
        const feed = await fetchFeed(div);

        if(div === "NQRW") {
            console.log("Feed:", feed);
        }
        data.push(...feed);
    }

    const results = await setFeeds(data);
    return results;
}

async function getFeed() {
    try {
        // console.log("Checking Trips Cache first");
        const cachedFeed = cache.getCache(CACHE_KEY);
        if(cachedFeed) {
            console.log("Retrieving cached trips");
            return cachedFeed;
        }

        console.log("Fetching new trip data");
        const trips = await getFormattedTrips();

        // console.log("Caching new trip data");
        cache.setCache(CACHE_KEY, trips, CACHE_TTL);
        return trips;
    } catch (err) {
        console.error("Error u error");
        return null;
    }
}

module.exports = {
    getFeed
};

/*
    Lacks - frequently updating data, requires server restart
*/