const express = require("express");
const cors = require("cors");
const session = require('express-session');

//cleanup existing data
const clearDirectory = require('./utils/cleanup');
const { setupDB }= require('./utils/setupTables');

//routes
const authRoutes = require('./routes/authRoutes');
const trainRoutes = require('./routes/trainRoutes');
const favRoutes = require('./routes/favRoutes');

// const { authMiddleware } = require('./middleware/authMiddleware');

const staticGTFSLoader = require('./utils/gtfsStaticLoader');

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(
    session({
        secret: "test_key",
        resave: false,
        saveUninitialized: false,
        cookie: { 
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 //for 1 minute (60 seconds), for 1 hour (*60), for 1 day(*60*24) 
        }
    })
);

//To help log all requested urls
app.use((req, res, next) => {
    console.log(`Incoming request URL: ${req.originalUrl}`);
    next();
})

app.use("/api/auth", authRoutes);
app.use('/api/train', trainRoutes);
app.use('/user/favorites', favRoutes);

// setRealtimeData();
// setInterval(setRealtimeData, 30000);

// app.get('/realtime', async(req, res) => {
//     const data = await gtfsRealtimeLoader.getFeed();
//     if(data) {
//         // console.log(data.keys());
//         res.json(data);
//     }

//     else res.status(500).send("Couldn't");
// });

//Middleware for invalid routes - very important to help minimize directory traversal attacks!
app.use((req, res, next) => {
    res.status(404).send('<h1>404</h1><h2>Page Not Found</h2><h3>The page you are looking for does not exist</h3>');
})

const PORT = 5000;
const dbPath = './database/database.db';
app.listen(PORT, async () => {
    //cleanup existing directory - for testing purposes
    // setupDB(dbPath);
    // await clearDirectory("./data/gtfs_data");
    // await staticGTFSLoader.fetchStaticGTFS();

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