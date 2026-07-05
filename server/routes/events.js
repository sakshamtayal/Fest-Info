const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { getCache, setCache } = require('../cache');

// GET all events
router.get('/', async (req, res) => {
  const cached = getCache('events');
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    setCache('events', events);
    res.json({ success: true, data: events, source: 'db' });
  } catch (err) {
    if (cached) {
      return res.json({ success: true, data: cached, source: 'cache' });
    }
    res.status(503).json({ success: false, message: 'Database offline', data: [] });
  }
});

// GET single event
router.get('/:id', async (req, res) => {
  const cacheKey = `event_${req.params.id}`;
  const cached = getCache(cacheKey);
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    setCache(cacheKey, event);
    res.json({ success: true, data: event, source: 'db' });
  } catch (err) {
    if (cached) return res.json({ success: true, data: cached, source: 'cache' });
    res.status(503).json({ success: false, message: 'Database offline', data: null });
  }
});

module.exports = router;
