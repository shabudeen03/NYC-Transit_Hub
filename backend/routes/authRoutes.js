const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const db = require('../database/db');

router.post("/register", async(req, res) => {
    const { username, password } = req.body;

    if(password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);

        const query = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        const result = query.run(username, hashed);

        req.session.userId = result.lastInsertRowid;
        res.json({
            user: {
                id: result.lastInsertRowid,
                username
            }
        });
    } catch (err) {
        console.log("Unable to register new user");
        res.status(500).json({ error: err.message });
    }
});

router.post("/login", async(req, res) => {
    const { username, password } = req.body;

    try {
        const query = db.prepare('SELECT * FROM users WHERE username = ?');
        const row = query.get(username);

        if(!row) {
            console.log("Invalid username");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, row.password);
        if(!valid) {
            console.log("Invalid password");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        req.session.userId = row.id;
        res.json({
            user: {
                id: row.id,
                username: row.username
            }
        });
    } catch (err) {
        console.log("Unable to authenticate user");
        res.status(500).json({ error: err.message });
    }
});

router.get("/profile", (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({ message: "Not logged in" });
    }

    try {
        const query = db.prepare("SELECT id, username FROM users WHERE id = ?");
        const row = query.get(req.session.userId);

        if(!row) {
            console.log("User session expired");
            return res.status(400).json({ message: "User not found" });
        }

        res.json({
            user: {
                id: row.id,
                username: row.username
            }
        });
    } catch (err) {
        console.log("Unable to find user profile");
        return res.status(400).json({ message: "User not found" });
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

// Export router
module.exports = router;
