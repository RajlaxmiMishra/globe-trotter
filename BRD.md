# Business Requirements Document (BRD)
# Project: GlobeTrotter — Empowering Personalized Travel Planning
# Version: 1.0
# Date: 2026-08-22

---

## 1. Executive Summary

### 1.1 Project Overview
GlobeTrotter is a personalized, intelligent, and collaborative travel planning platform. It lets users design multi-city itineraries end-to-end — choosing destinations, scheduling stops, attaching activities, tracking budget, visualizing the plan on a calendar/timeline, and sharing the finished trip publicly or with friends.

### 1.2 Business Problem
Planning a multi-city trip today is fragmented: travelers juggle spreadsheets, notes apps, and multiple booking sites to sequence cities, estimate costs, and keep the plan visible to travel companions. There is no single tool that combines destination discovery, day-wise itinerary construction, automatic budgeting, and shareability in one cohesive, visual experience. This leads to planning fatigue, budget surprises, and difficulty coordinating trips with others.

### 1.3 Business Objectives
- Objective 1: Reduce the time and effort required to plan a multi-city trip by consolidating destination discovery, scheduling, and budgeting into one workflow.
- Objective 2: Give travelers continuous visibility into estimated trip cost so they can make in-plan adjustments before overspending.
- Objective 3: Enable trip plans to be shared and reused within a community, increasing engagement and organic growth.
- Objective 4: Provide the platform operator with visibility into usage patterns (popular cities/activities, engagement) to guide future iteration.

### 1.4 Success Metrics (KPIs)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Trip creation completion rate | ≥ 70% of started trips reach a saved itinerary | trips with ≥1 stop / trips created |
| Time to first itinerary | < 10 minutes from signup to first stop added | timestamp diff, signup → first stop created |
| Budget feature engagement | ≥ 60% of trips view the Budget Breakdown screen | screen-view event / trip |
| Public sharing adoption | ≥ 15% of completed trips are made public | trips.is_public = true / completed trips |
| Trip copy rate (from shared view) | ≥ 5% of public-view sessions result in "Copy Trip" | copy events / public views |
| Platform reliability | ≥ 99.5% uptime during demo/production window | uptime monitoring |

---

## 2. Stakeholder Analysis

| Stakeholder | Role | Interest |
|-------------|------|----------|
| End Users (Travelers) | Primary | Fast, low-friction trip planning; clear cost visibility; ability to share plans |
| Trip Companions / Public Viewers | Secondary | View or copy a shared itinerary without needing full account setup friction |
| Platform Admin/Operator | Secondary | Visibility into adoption, popular destinations, and platform health |
| Development Team | Internal | Clear, unambiguous requirements to build against a hackathon timeline |
| Content/Data Owner (cities & activities catalog) | Internal | Accurate, structured city/activity metadata (cost index, popularity, categories) to power search and budgeting |

---

## 3. Business Requirements

### 3.1 Functional Requirements (Business Level)
- BR-001: System shall allow a user to register and authenticate with email and password before creating or managing trips.
- BR-002: System shall allow a user to create a trip with a name, date range, and optional description/cover photo.
- BR-003: System shall allow a user to add one or more city "stops" to a trip, each with its own date range, and to reorder stops.
- BR-004: System shall allow a user to search and browse cities by name, country/region, cost index, and popularity, and add them to a trip.
- BR-005: System shall allow a user to search and browse activities by type, cost, and duration, and assign them to a specific stop and day.
- BR-006: System shall automatically compute an estimated cost breakdown (transport, stay, activities, meals) for a trip based on its stops and assigned activities.
- BR-007: System shall visually present the itinerary as both a day-wise/grouped-by-city view and a calendar/timeline view.
- BR-008: System shall allow a user to publish a trip as a public, read-only, sharable page, and allow other users to copy that trip into their own account.
- BR-009: System shall allow a user to view, edit, and delete their own trips and account profile.
- BR-010: System shall provide an admin-only dashboard summarizing platform-wide trip, city, and activity usage statistics.

### 3.2 Business Rules
| Rule ID | Rule | Impact |
|---------|------|--------|
| BR-R001 | A trip's stops must fall within the trip's overall start and end dates | Itinerary Builder, Create Trip |
| BR-R002 | A stop's date range cannot be negative (end date ≥ start date) and stops within a trip should not have unresolved date overlaps without user confirmation | Itinerary Builder |
| BR-R003 | Only the trip owner may edit or delete a trip; public viewers get read-only access | Shared/Public Itinerary View, permissions |
| BR-R004 | Budget breakdown must recalculate automatically whenever stops or activities change | Trip Budget & Cost Breakdown |
| BR-R005 | A trip must be explicitly marked public by its owner before it is visible via a public URL | Shared/Public Itinerary View, privacy |
| BR-R006 | Deleting a trip cascades to delete its stops and stop-activity assignments; deleting a city/activity from the catalog does not delete trips that reference it (soft reference or block) | Data integrity |
| BR-R007 | Admin dashboard data is aggregate/anonymized and not tied to individually browsable private trip content | Privacy, Admin Dashboard |

---

## 4. Data Flow Diagram

```
[User] → create trip request → [Trip Service] → validate dates → [PostgreSQL: trips]
                                       │
                                       ▼
[User] → add stop (city, dates) → [Itinerary Service] → validate against trip range → [PostgreSQL: stops]
                                       │
                                       ▼
[User] → assign activity → [Itinerary Service] → [PostgreSQL: stop_activities]
                                       │
                                       ▼
[Budget Service] ← aggregate costs ← [PostgreSQL: stops, stop_activities, activities]
        │
        ▼
[Response: cost breakdown, charts] → [User]

[Public Viewer] → GET /trips/{share_slug} → [Sharing Service] → read-only fetch → [PostgreSQL] → [Response: read-only itinerary]

[Admin] → GET /admin/analytics → [Analytics Service] → aggregate queries → [PostgreSQL] → [Response: usage stats]
```

---

## 5. Process Flows

### 5.1 Trip Creation & Itinerary Build
```
START
  │
  ▼
[User fills Create Trip form: name, dates, description]
  │
  ├── [Dates valid? start < end] NO ──► [Show validation error] ──► back to form
  │
  YES
  ▼
[Trip saved] ──► [Itinerary Builder: Add Stop]
  │
  ▼
[Select city + stop dates within trip range]
  │
  ├── [Dates within trip range?] NO ──► [Error: stop dates must be within trip dates]
  │
  YES
  ▼
[Assign activities to stop] ──► [Budget auto-recalculates]
  │
  ▼
[Review in Itinerary View / Calendar] ──► END (Itinerary Built)
```

### 5.2 Sharing a Trip
```
START
  │
  ▼
[Owner toggles "Make Public" on a saved trip]
  │
  ▼
[System generates/reuses a unique share URL/slug]
  │
  ▼
[Public visitor opens share URL]
  │
  ├── [Trip still public?] NO ──► [404 / "This trip is no longer shared"]
  │
  YES
  ▼
[Read-only itinerary rendered] ──► [Visitor clicks "Copy Trip"]
  │
  ├── [Visitor logged in?] NO ──► [Prompt login/signup] ──► on success, continue
  │
  YES
  ▼
[Trip + stops + activities duplicated into visitor's account] ──► END (Success)
```

---

## 6. Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Incomplete/inconsistent city & activity catalog data (cost index, category) | M | Seed a curated dataset at launch; validate required fields on catalog entries; allow admin correction |
| Budget estimates diverge meaningfully from real-world costs | M | Clearly label figures as "estimated"; allow manual cost overrides per activity/stop |
| Overlapping or conflicting stop dates confuse the itinerary/calendar view | M | Enforce BR-R001/BR-R002 validation; visually flag conflicts before save |
| Public sharing exposes unintended personal data (e.g., cover photo, description) | H | Public view only exposes trip/stop/activity/cost fields, never account email or private profile data |
| Hackathon timeline pressure leads to skipped edge-case handling | M | SRS Section 5 enumerates edge cases up front to size effort correctly |
| Admin dashboard misused to browse private user trip details | H | Restrict admin queries to aggregate/anonymized data only (BR-R007) |

---

## 7. Constraints
- Technical: Relational database (PostgreSQL) required per problem statement ("well-designed relational database"); no third-party flight/hotel booking integration is in scope.
- Business: Must support both desktop and mobile-responsive usage per the source problem statement.
- Regulatory: No explicit compliance regime specified; standard password hashing, JWT auth, and basic account-deletion support are assumed sufficient at this stage (see PRD/SRS assumptions).
- Timeline: Hackathon-paced delivery; scope is prioritized via MoSCoW in the PRD to protect a demoable MVP.

---

## 8. Assumptions
- The city and activity catalog (name, country, cost index, popularity, category, cost, duration) is seeded/curated internally rather than pulled live from a third-party travel API.
- "Small production" scale (10s–100s of concurrent users) means no dedicated caching/queue layer is required at MVP; PostgreSQL connection pooling is sufficient.
- Budget figures are estimates for planning purposes, not booking-grade real-time pricing.
- Admin/Analytics Dashboard (Screen 13) is now in scope per stakeholder confirmation, despite being marked "Optional" in the original problem statement.
- "Forgot Password" flow uses a standard email-based reset link; no SMS/2FA is required for MVP.
- Single currency is assumed for budget figures at MVP (multi-currency noted as a future enhancement).
