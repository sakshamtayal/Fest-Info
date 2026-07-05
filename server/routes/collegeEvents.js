const express = require('express');
const router = express.Router();
const CollegeEvent = require('../models/CollegeEvent');
const { getCache, setCache } = require('../cache');

// GET all college events
router.get('/', async (req, res) => {
  const cached = getCache('collegeEvents');
  try {
    const events = await CollegeEvent.find().sort({ createdAt: -1 });
    setCache('collegeEvents', events);
    res.json({ success: true, data: events, source: 'db' });
  } catch (err) {
    if (cached) return res.json({ success: true, data: cached, source: 'cache' });
    res.status(503).json({ success: false, message: 'Database offline', data: [] });
  }
});

// GET single college event
router.get('/:id', async (req, res) => {
  const cacheKey = `collegeEvent_${req.params.id}`;
  const cached = getCache(cacheKey);
  try {
    const event = await CollegeEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    setCache(cacheKey, event);
    res.json({ success: true, data: event, source: 'db' });
  } catch (err) {
    if (cached) return res.json({ success: true, data: cached, source: 'cache' });
    res.status(503).json({ success: false, message: 'Database offline', data: null });
  }
});

module.exports = router;
