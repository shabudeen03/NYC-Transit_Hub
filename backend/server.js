const express = require("express");
const cors = require("cors");
const session = require('express-session');

const staticGTFSLoader = require("./utils/gtfsStaticLoader");
const alertService = require('./utils/serviceAlerts');

//cleanup existing data
const clearDirectory = require('./utils/cleanup');
const { setupDB }= require('./utils/setupTables');

//routes
const authRoutes = require('./routes/authRoutes');
const trainRoutes = require('./routes/trainRoutes');
const favRoutes = require('./routes/favRoutes');

const app = express();
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(
    session({
        secret: "test_key",
        resave: false,
        saveUninitialized: false,
        cookie: { 
            httpOnly: true,
            secure: false,
            sameSite: "lax" 
        }
    })
);

app.use("/api/auth", authRoutes);
app.use('/api/train', trainRoutes);
app.use('/user/favorites', favRoutes);


app.get("/api/alerts", async(req, res) => {
    try {
        const alerts = await alertService.getSubwayAlerts();
        res.json(alerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load alerts" });
    }
});

//Middleware for invalid routes
app.use((req, res, next) => {
    res.status(404).send('<h1>404</h1><h2>Page Not Found</h2><h3>The page you are looking for does not exist</h3>');
})

const PORT = 5000;
const dbPath = './database/database.db';
app.listen(PORT, async () => {
    //cleanup existing directory - for testing purposes
    setupDB(dbPath);
    await clearDirectory("./data/gtfs_data");
    await staticGTFSLoader.fetchStaticGTFS();

    //this below doesn't work, check later
    // if(process.env.NODE_ENV === "production") {
    //     console.log("production")
    //     await staticGTFSLoader.fetchStaticGTFS();
    // } else if(process.env.NODE_ENV === "development") {
    //     console.log("development")
    // } else {
    //     console.log("Other")
    // }
    
    console.log(`Server running on port ${PORT}`);
});