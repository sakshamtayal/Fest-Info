# Fest Info 🎉
> Your one-stop hub for college events, societies & Delhi NCR fest passes.
> **Made by Saksham Tayal**

## Features
- 🎭 DTU Events — browse events with details, timelines & contacts
- 🏛️ Societies — recruiting status, council, join links & WhatsApp
- 🎪 Delhi NCR Fests — passes, performers, itinerary & registration
- ⚡ MongoDB offline resilience — serves cached data if DB is down

## Tech Stack
- **Backend** — Node.js + Express
- **Database** — MongoDB (Mongoose)
- **Frontend** — Vanilla HTML / CSS / JS

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/fest-info.git
cd fest-info

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Then open .env and fill in your MongoDB URI

# 4. Start MongoDB (if running locally)
mongod

# 5. Start the server
npm start
```

Open → http://localhost:6774

## Environment Variables
| Variable | Description |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `PORT` | Port to run on (default 6774) |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

## Adding Data
All data is added directly via MongoDB — no admin panel.
See the schema guide in the project for `events`, `societies`, and `collegeevents` collections.

## Contact
To list your event or society → **saksham16711@gmail.com**
