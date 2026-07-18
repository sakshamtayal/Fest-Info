const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
  organisers: [{ type: String }],
  description: { type: String, default: '' },
  date: { type: String, default: '' },
  time: { type: String, default: '' },
  venue: { type: String, default: '' },
  video: { type: String, default: '' },
  links: [{ label: String, url: String }],
  timeline: [{ date: String, event: String }],
  contacts: [{ name: String, phone: String, whatsapp: String }],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
