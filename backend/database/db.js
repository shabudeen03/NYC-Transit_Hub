const Database = require('better-sqlite3');
const db = new Database('./database/database.db');

db.exec('PRAGMA foreign_keys = ON;');

console.log('Connected to SQLite database');

module.exports = db;
