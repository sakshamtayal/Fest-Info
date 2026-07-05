const express = require('express');
const router = express.Router();
const Society = require('../models/Society');
const { getCache, setCache } = require('../cache');

// GET all societies
router.get('/', async (req, res) => {
  const cached = getCache('societies');
  try {
    const societies = await Society.find().sort({ createdAt: -1 });
    setCache('societies', societies);
    res.json({ success: true, data: societies, source: 'db' });
  } catch (err) {
    if (cached) return res.json({ success: true, data: cached, source: 'cache' });
    res.status(503).json({ success: false, message: 'Database offline', data: [] });
  }
});

// GET single society
router.get('/:id', async (req, res) => {
  const cacheKey = `society_${req.params.id}`;
  const cached = getCache(cacheKey);
  try {
    const society = await Society.findById(req.params.id);
    if (!society) return res.status(404).json({ success: false, message: 'Society not found' });
    setCache(cacheKey, society);
    res.json({ success: true, data: society, source: 'db' });
  } catch (err) {
    if (cached) return res.json({ success: true, data: cached, source: 'cache' });
    res.status(503).json({ success: false, message: 'Database offline', data: null });
  }
});

module.exports = router;
