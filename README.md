# GlobeTrotter 🌍

GlobeTrotter is a multi-city travel planning platform for sequencing cities, days, activities, and budgets in one place.

## Features

- **Trip Builder:** Sequence multiple cities into a unified itinerary with customizable arrival and departure dates.
- **Activity Planning:** Discover and add activities to each stop along your route.
- **Budget Tracking:** Track costs across transport, accommodation, and activities, with visual threshold indicators.
- **Calendar View:** Visualize your entire journey day-by-day.
- **Public Sharing:** Share a read-only link to your itineraries with friends and family.
- **Auth & Onboarding:** Secure user authentication with a personalized dashboard.
- **Admin Dashboard:** Real-time analytics, user statistics, and top global destinations.

## Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router v6, React Query, Recharts.
- **Backend:** FastAPI, PostgreSQL 17, SQLAlchemy 2.0 async, JWT auth, Alembic migrations.
- **Infrastructure:** Docker Compose (API + Postgres).

## Getting Started

The app is intended to run against the real FastAPI backend and Postgres database. Follow these steps for the full end-to-end experience.

### 1. Start the backend

From the project root:

```bash
cd backend
docker compose up -d
docker compose --profile seed run seed
```

This starts Postgres and the API on `http://localhost:8000`, runs migrations, and seeds:

- ~25 cities and their activities
- Demo account: `demo@globetrotter.io` / `Demo1234!`
- Admin account: `admin@globetrotter.io` / `Admin1234!`

Verify the API is up: open [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Configure the frontend

Create `frontend/.env` from the example (do not commit `.env`):

```bash
cd frontend
cp .env.example .env
```

The defaults should be:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=false
```

`VITE_USE_MOCK=false` ensures every API call goes to the real backend, not the in-memory mock layer in `src/api/mock.js`.

### 3. Start the frontend

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically [http://localhost:5173](http://localhost:5173)).

### 4. Manual smoke test (recommended before submission)

1. **Sign up** a brand-new user (not the seeded demo account).
2. **Create a trip** with name and dates.
3. **Add a stop** — search for a city (e.g. Paris) and set start/end dates within the trip range.
4. **Add an activity** to that stop (via the builder or activity search).
5. Open the **Budget** screen and confirm costs appear.
6. **Log out**, then **log back in** with the same new account — your trip should still be there.

To confirm data persisted in Postgres:

```bash
cd backend
docker compose exec db psql -U globetrotter -d globetrotter -c "SELECT name, user_id, start_date, end_date FROM trips ORDER BY created_at DESC LIMIT 5;"
```

Each new signup gets an empty dashboard; only the demo account has pre-seeded trips.

### Seeded accounts

| Email | Password | Role |
|---|---|---|
| `demo@globetrotter.io` | `Demo1234!` | user (2 sample trips) |
| `admin@globetrotter.io` | `Admin1234!` | admin (Analytics dashboard) |

## Mock mode (optional, UI-only)

For quick frontend demos without Docker or Postgres, you can run the UI against the in-memory mock API:

```env
VITE_USE_MOCK=true
```

Mock mode uses fake shared data in `src/api/mock.js` and is **not** suitable for submission or multi-user testing. Use the Docker + seed path above for the real product.

## Project structure

```
Globetrotter/
├── backend/          # FastAPI API, models, migrations, seeds, tests
├── frontend/         # React + Vite SPA
├── SRS.md            # Software requirements
├── PRD.md            # Product requirements
└── BRD.md            # Business requirements
```

## API documentation

With the backend running: [http://localhost:8000/docs](http://localhost:8000/docs)
