const axios = require('axios'); 
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

const cache = require('./cache');
const CACHE_KEY = "alerts";
const CACHE_TTL = 45;

const staticGTFSLoader = require("./gtfsStaticLoader");
const { format } = require('path');

const url = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts";
//for some reason this doesn't require auth token

async function getSubwayAlertsRaw() {
  try {
    const res = await axios.get(url, {
        responseType: "arraybuffer"
    });

    const buffer = new Uint8Array(res.data);
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);    
    return feed;
  } catch (err) {
    console.error("Error fetching subway service alerts:", err);
  }
}

function convertStopsToLookup(stopsArray) {
  const lookup = {};
  for(const stop of stopsArray) {
    lookup[stop.stop_id] = stop.stop_name;
  }

  return lookup;
}

function formateDateReadable(date) {
  if (!date) return null;
  return new Date(date).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York"
  });  
}

async function formatAlert(entity, stations) {
  const alert = entity.alert;
  const header = alert.headerText?.translation?.find(t => t.translation === "en")?.text || "";
  const desc = alert.descriptionText?.translation?.find(t => t.language === "en")?.text || "";

  const now = Date.now();
  const periods = alert.activePeriod.filter(p => p.start * 1000 <= now && p.end * 1000 > now);
  // const activePeriods = alert.activePeriod.map(p => ({
  //   start: p.start ? new Date(p.start * 1000).toISOString() : null,
  //   end: p.end ? new Date(p.end * 1000).toISOString() : null
  // }));
  
  const activePeriods = periods.map(p => ({
    rawStart: p.start ? new Date(p.start * 1000).toISOString() : null,
    rawEnd: p.end ? new Date(p.end * 1000).toISOString() : null,
    start: p.start ? formateDateReadable(p.start * 1000) : null,
    end: p.end ? formateDateReadable(p.end * 1000) : null
  }));

  const affectedRoutes = alert.informedEntity
    .filter(i => i.routeId)
    .map(i => i.routeId);

  const affectedStations = alert.informedEntity
    .filter(i => i.stopId)
    .map(i => ({
      stopId: i.stopId,
      name: stations[i.stopId] || "N/A"
    }));

  return {
    id: entity.id,
    header,
    desc,
    activePeriods,
    affectedRoutes,
    affectedStations
  };
}

async function getFormattedSubwayAlerts() {
  const list = await staticGTFSLoader.getFile("stops.txt");
  const stationsList = list.filter(stop => stop.location_type === "1");
  const stations = convertStopsToLookup(stationsList);

  const feed = await getSubwayAlertsRaw();

  const formatted = await Promise.all(
    feed.entity
      .filter(e => e.alert)
      .map(e => formatAlert(e, stations))
  );

  const filtered = formatted.filter(a => a.activePeriods.length > 0);
  filtered.sort((a, b) => {
    const aStart = a.activePeriods[0]?.rawStart ? new Date(a.activePeriods[0].rawStart).getTime() : Infinity;
    const bStart = b.activePeriods[0]?.rawStart ? new Date(b.activePeriods[0].rawStart).getTime() : Infinity;
    return aStart - bStart;
  })

  return filtered;
}

async function getSubwayAlerts() {
  //check Redis first
  console.log("Checking Cache first");
  const cachedFeed = cache.getCache(CACHE_KEY);
  if(cachedFeed) {
    console.log("Retrieving from Cache");
    return cachedFeed;
  }

  //otherwise fetch and cache w/ redis
  console.log("Fetching service alert feeds");
  const feed = await getFormattedSubwayAlerts();
  
  //save in cache
  console.log("Caching service alerts");
  cache.setCache(CACHE_KEY, feed, CACHE_TTL);
  return feed;
}

module.exports = {
    getSubwayAlerts
};