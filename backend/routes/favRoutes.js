const express = require('express');
const router = express.Router();

const db = require('../database/db');

router.get("/all", (req, res) => {
  const userId = req.headers['x-user-id'];
  if(userId) {
    const favorites = db.prepare("SELECT s.*, f.* FROM favorites f JOIN stations s ON f.switchId = s.stop_id WHERE f.userId = ?");
    const rows = favorites.all(userId);
    console.log(rows);
    res.json({ data: rows });
  } else {
    res.status(404).send("NO");
  }
});

router.post("/update", (req, res) => {
  const userId = req.headers['x-user-id'];
  if(userId) {
    const { fid } = req.query;

    db.prepare(`
      INSERT OR IGNORE INTO favorites (userId, switchId)
      VALUES (?, ?)
    `).run(userId, fid);

    res.json({ success: true });
  } else {
    res.status(404).send("NO");
  }
});


router.delete("/update", (req, res) => {
  const userId = req.headers['x-user-id'];
  if(userId) {
    const { fid } = req.query;

    db.prepare(`
      DELETE FROM favorites
      WHERE userId = ? AND switchId = ?
    `).run(userId, fid);

    res.json({ success: true });
  } else {
    res.status(404).send("NO");
  }
});


router.get("/get", (req, res) => {
  const userId = req.headers['x-user-id'];
  console.log("User id: ", userId);
  if(userId) {
    const { fid } = req.query;
    
    const favorite = db.prepare(`
      SELECT 1 FROM favorites WHERE userId = ? AND switchId = ?
    `).get(userId, fid);

    console.log(favorite);
    
    res.json({ isFavorite: !!favorite });
  } else {
    res.status(404).send("NO");
  }
});

module.exports = router;