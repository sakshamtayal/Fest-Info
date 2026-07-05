const mongoose = require('mongoose');

const collegeEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  college: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  date: { type: String, default: '' },
  venue: { type: String, default: '' },
  passPrice: { type: String, default: 'Free' },
  passLink: { type: String, default: '' },
  registrationProcess: { type: String, default: '' },
  registrationDeadline: { type: String, default: '' },
  itinerary: [{ time: String, activity: String }],
  performers: [{ name: String, type: String }],
  contacts: [{ name: String, phone: String, whatsapp: String }],
  links: [{ label: String, url: String }],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CollegeEvent', collegeEventSchema);
