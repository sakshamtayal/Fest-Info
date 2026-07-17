require('dotenv').config();
const mongoose = require('mongoose');
const CollegeEvent = require('./server/models/CollegeEvent');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/festinfo';

const buildWithGemmaEvent = {
  name: 'Build with Gemma — AIMS DTU Hackathon',
  college: 'Delhi Technological University (DTU)',
  image: 'https://buildwithgemma.aimsdtu.in/build-with-gemma-lockup.png',
  description:
    'The next generation of open models is here! Welcome to Build with Gemma — AIMS DTU, a fast-paced, 1-day in-person hackathon where you\'ll get hands-on with the most capable open models from Google DeepMind. Organised by AIMS DTU in collaboration with Google, this event challenges participants to build innovative AI-powered projects using the Gemma model family.',
  date: 'July 2026',
  venue: 'Delhi Technological University, Rohini, New Delhi',
  passPrice: 'Free',
  passLink: 'https://buildwithgemma.aimsdtu.in/',
  registrationProcess:
    'Visit the official website at buildwithgemma.aimsdtu.in and fill out the registration form before the deadline. Registration is free and open to all DTU students.',
  registrationDeadline: '12 July 2026',
  itinerary: [],
  performers: [],
  contacts: [],
  links: [
    { label: 'Official Website', url: 'https://buildwithgemma.aimsdtu.in/' },
    { label: 'Register Now', url: 'https://buildwithgemma.aimsdtu.in/' },
    { label: 'AIMS DTU Instagram', url: 'https://www.instagram.com/aimsdtu/' },
  ],
  tags: ['Hackathon', 'AI', 'Machine Learning', 'Google Gemma', 'AIMS-DTU', 'Tech', 'DTU', 'Free'],
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    // Check if event already exists
    const existing = await CollegeEvent.findOne({ name: buildWithGemmaEvent.name });
    if (existing) {
      console.log('⚠️  Event already exists:', existing._id);
      console.log('Updating existing entry...');
      await CollegeEvent.updateOne({ _id: existing._id }, { $set: buildWithGemmaEvent });
      console.log('✅ Event updated successfully!');
    } else {
      const doc = await CollegeEvent.create(buildWithGemmaEvent);
      console.log('✅ Event inserted successfully! ID:', doc._id);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
