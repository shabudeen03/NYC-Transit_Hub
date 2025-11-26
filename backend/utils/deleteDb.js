const fs = require('fs');
const db = require('../database/db');

const dbPath = './database/database.db';
if(fs.existsSync(dbPath)) {
    if(db) db.close();
    console.log("Starting deletion");
    fs.unlinkSync(dbPath);
    console.log('database.db deleted successfully');
} else {
    console.log('database.db DNE');
}