const fs = require('fs');
const db = require('../database/db');

const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      favorite_ids TEXT
    );
`;

const createFavorites = `
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      switchId TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
`;


// Static train-related data
const createStations = `
  CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stop_id TEXT UNIQUE NOT NULL,
      stop_name TEXT,
      stop_lat REAL,
      stop_lon REAL,
      route_ids TEXT,
      location_type INTEGER,
      parent_station INTEGER,
      accessibility INTEGER CHECK(accessibility BETWEEN 0 AND 3)
  );
`;


const createTrainRoutes = `
  CREATE TABLE IF NOT EXISTS train_routes (
      route_id TEXT PRIMARY KEY,      
      agency_id TEXT,                 
      short_name TEXT,                 
      long_name TEXT,                 
      description TEXT,
      route_type INTEGER,
      -- route_url TEXT,
      route_color TEXT,
      route_text_color TEXT
      -- sort_order INTEGER,
      -- shape_ids TEXT                
  );
`;

const createTrips = `
  CREATE TABLE IF NOT EXISTS trips (
    route_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    trip_id TEXT PRIMARY KEY,
    trip_headsign TEXT,
    trip_short_name TEXT,
    direction_id INTEGER,
    block_id TEXT,
    shape_id TEXT,
    wheelchair_accessible INTEGER
  );
`;

const createTrainShapes = `
  CREATE TABLE IF NOT EXISTS shapes (
      shape_id TEXT PRIMARY KEY,   
      coordinates TEXT NOT NULL    
  );
`;

const createRouteShapes = `
  CREATE TABLE IF NOT EXISTS train_shape_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER,
    shape_id TEXT
    -- FOREIGN KEY(route_id) REFERENCES train_routes(route_id),
    -- FOREIGN KEY(shape_id) REFERENCES shapes(shape_id)
  );
`;

const createStopTimes = `
  CREATE TABLE stop_times (
    trip_id TEXT NOT NULL,
    arrival_time TEXT,
    departure_time TEXT,
    stop_id TEXT NOT NULL,
    stop_sequence INTEGER NOT NULL,
    PRIMARY KEY (trip_id, stop_sequence)
  );
`;

function setupDB(dbPath) {
  //static bus-related data (TBD)
  db.exec(
    createUsers +
    createFavorites +
    createStations +
    createTrainRoutes +
    createTrainShapes +
    createStopTimes +
    createTrips +
    createRouteShapes
  );

  console.log("Tables created (if not exist)");

  // db.close();
}

module.exports = {
  setupDB
};