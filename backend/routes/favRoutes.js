const express = require('express');
const router = express.Router();

const db = require('../database/db');

router.post("/:routeId", (req, res) => {
  const userId = req.user.id; // however you track users
  const { switchId } = req.params;

  db.prepare(`
    INSERT INTO favorites (userId, switchId)
    VALUES (?, ?)
  `).run(userId, switchId);

  res.json({ success: true });
});


router.delete("/:routeId", (req, res) => {
  const userId = req.user.id;
  const { switchId } = req.params;

  db.prepare(`
    DELETE FROM favorites
    WHERE userId = ? AND switchId = ?
  `).run(userId, switchId);

  res.json({ success: true });
});


router.get("/:routeId", (req, res) => {
  const userId = req.user.id;
  const { switchId } = req.params;

  const favorite = db.prepare(`
    SELECT 1 FROM favorites WHERE userId = ? AND switchId = ?
  `).get(userId, switchId);

  res.json({ isFavorite: !!favorite });
});

module.exports = router;