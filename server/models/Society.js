const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, default: '' },
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  isRecruiting: { type: Boolean, default: false },
  seniorCouncil: [{ name: String, role: String, contact: String }],
  links: [{ label: String, url: String }],
  timeline: [{ date: String, event: String }],
  contacts: [{ name: String, phone: String, whatsapp: String }],
  whatsappGroup: { type: String, default: '' },
  instagram: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Society', societySchema);
