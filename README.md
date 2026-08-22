# GlobeTrotter 🌍

GlobeTrotter is a powerful, modern multi-city travel planning platform designed to make sequencing cities, days, and budgets effortless. 

## Features

- **Trip Builder:** Sequence multiple cities into a unified itinerary with customizable arrival and departure dates.
- **Activity Planning:** Discover and add custom activities to each stop along your route.
- **Budget Tracking:** Track costs across transport, accommodation, and activities, with visual threshold indicators.
- **Calendar View:** Visualize your entire journey day-by-day.
- **Public Sharing:** Share a read-only link to your itineraries with friends and family.
- **Auth & Onboarding:** Secure user authentication with a personalized dashboard.
- **Admin Dashboard:** Real-time analytics, user statistics, and top global destinations.

## Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router v6, React Query, Recharts.
- **Design:** Custom UI library with a bespoke design token system.
- **API:** In-memory Mock API architecture built-in (easily swappable to a live backend).

## Getting Started

### Running Locally

Currently, the frontend application is wired to run via a completely local, in-memory mock API. You do not need any backend services running to test the complete application flow.

1. Navigate to the frontend directory:
   `ash
   cd frontend
   `
2. Install dependencies:
   `ash
   npm install
   `
3. Start the Vite development server:
   `ash
   npm run dev
   `
4. Open http://localhost:5173 in your browser.

**Demo Credentials:**
- Email: demo@globetrotter.io
- Password: Demo1234

### Connecting to a Real Backend
When your real API is ready, you can seamlessly switch over by creating a .env file in the rontend directory:
`env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
`
