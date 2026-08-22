# Documentation Context: GlobeTrotter

## Project Overview
- **Name**: GlobeTrotter — Empowering Personalized Travel Planning
- **Description**: A personalized, intelligent, collaborative multi-city travel planning platform. Users build day-wise itineraries across cities, attach activities, get automatic budget breakdowns, visualize timelines/calendars, and share trips publicly.
- **Started**: 2026-08-22
- **Status**: In Progress (Documentation Phase)

## Source Material
- Original problem statement: `GlobeTrotter.pdf` (uploaded), 13 screens/features defined (13th, Admin/Analytics, marked Optional in source — now confirmed in scope).
- Mockup reference (from source doc, not fetched): https://link.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1

## Research Notes
- Confirmed FastAPI + React + PostgreSQL is a common, well-supported stack for hackathon-speed full-stack travel/trip-planner apps, with mature open-source boilerplates (auth, Docker, CI/CD) available to accelerate build.
- Travel-app specific research confirms relational DB (PostgreSQL) is the standard choice for structured trip/stop/activity/cost data over NoSQL, given the highly relational nature of itineraries.
- No third-party booking/payment APIs are in scope per the source problem statement (no flight/hotel booking mentioned) — city and activity data is treated as an internal, curated dataset for this build.

## Clarification Questions Asked
- **Q1**: Tech stack preference? → **A**: FastAPI + React + PostgreSQL (default)
- **Q2**: Expected scale? → **A**: Small production (10s–100s of concurrent users)
- **Q3**: Include Admin/Analytics Dashboard (marked Optional in source)? → **A**: Yes, include it in scope

## Tech Stack Decisions
- **Backend**: FastAPI (Python 3.11+), async, Pydantic v2 validation
- **ORM**: SQLAlchemy 2.0 (async) or SQLModel
- **Database**: PostgreSQL 17
- **Frontend**: React 19 + Vite, Tailwind CSS
- **Auth**: JWT (access + refresh tokens)
- **Charts**: Recharts (for budget pie/bar charts, admin analytics)
- **Calendar/Timeline UI**: custom React component or a library (e.g., FullCalendar-style day-grid)
- **Deployment**: Docker Compose (single-node, matches "small production" scale)
- **Rationale**: Relational data (users → trips → stops → activities → costs) maps cleanly to PostgreSQL; FastAPI+React is fast to scaffold for a hackathon timeline while remaining production-viable at 10s–100s of users without needing a queue/cache layer on day one.

## Document Status
- [x] BRD — Complete
- [x] PRD — Complete
- [x] SRS — Complete

## Next Steps
- Hand off to orchestrator-master / development team to begin backend scaffolding (DB schema + auth) followed by frontend screen build-out, per SRS Section 6 schema and Section 3 API spec.

## Changelog
| Date | Change |
|------|--------|
| 2026-08-22 | Initial research complete; clarification questions answered; BRD, PRD, SRS generated from source problem statement (GlobeTrotter.pdf) |
