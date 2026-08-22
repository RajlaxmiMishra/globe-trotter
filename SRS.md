# Software Requirements Specification (SRS)
# Project: GlobeTrotter — Empowering Personalized Travel Planning
# Version: 1.0
# Date: 2026-08-22

---

## 1. Introduction

### 1.1 Purpose
This document specifies the technical requirements — API, data model, non-functional requirements, and edge cases — needed to implement the 13 GlobeTrotter screens defined in the source problem statement.

### 1.2 Scope
Covers: authentication, trip/stop/activity CRUD, city/activity discovery & search, automatic budget computation, itinerary/calendar visualization, public trip sharing with copy, user profile/settings, and admin analytics. Out of scope: live third-party flight/hotel booking or payment processing.

### 1.3 Tech Stack
| Component | Technology | Version |
|-----------|------------|---------|
| API Framework | FastAPI | 0.115+ |
| Database | PostgreSQL | 17 |
| ORM | SQLAlchemy (async) | 2.0 |
| Language (backend) | Python | 3.11+ |
| Frontend | React + Vite | React 19 |
| Styling | Tailwind CSS | latest |
| Charts | Recharts | latest |
| Auth | JWT (access + refresh) | — |
| Container | Docker Compose | latest |

---

## 2. System Overview

### 2.1 Architecture
```
Client (React) → API (FastAPI, JWT auth) → Business Logic (Services) → Database (PostgreSQL)
                                                    │
                                          Budget/Analytics aggregation queries
```

### 2.2 Screen → API Domain Map
| # | Screen (source doc) | Primary API domain |
|---|---|---|
| 1 | Login / Signup | `/api/v1/auth` |
| 2 | Dashboard / Home | `/api/v1/trips` (summary), `/api/v1/cities` (recommended) |
| 3 | Create Trip | `/api/v1/trips` |
| 4 | My Trips | `/api/v1/trips` |
| 5 | Itinerary Builder | `/api/v1/trips/{id}/stops`, `/api/v1/stops/{id}/activities` |
| 6 | Itinerary View | `/api/v1/trips/{id}/itinerary` |
| 7 | City Search | `/api/v1/cities` |
| 8 | Activity Search | `/api/v1/activities` |
| 9 | Trip Budget & Cost Breakdown | `/api/v1/trips/{id}/budget` |
| 10 | Trip Calendar / Timeline | `/api/v1/trips/{id}/calendar` |
| 11 | Shared / Public Itinerary View | `/api/v1/public/trips/{share_slug}` |
| 12 | User Profile / Settings | `/api/v1/users/me` |
| 13 | Admin / Analytics Dashboard | `/api/v1/admin/analytics` |

---

## 3. Functional Requirements

### 3.1 API Endpoints

#### GET /health
**Purpose**: Health check
**Response**:
```json
{"status": "healthy", "version": "1.0.0"}
```

#### POST /api/v1/auth/signup
**Purpose**: Create a new user account
**Request Body**:
```json
{"email": "user@example.com", "password": "SecurePass1", "name": "Priya"}
```
**Response 201**:
```json
{"id": "uuid", "email": "user@example.com", "name": "Priya", "created_at": "2026-08-22T10:00:00Z"}
```
**Error Responses**: 409 (email already registered), 422 (invalid email/password)

#### POST /api/v1/auth/login
**Purpose**: Authenticate and receive tokens
**Request Body**:
```json
{"email": "user@example.com", "password": "SecurePass1"}
```
**Response 200**:
```json
{"access_token": "jwt", "refresh_token": "jwt", "token_type": "bearer"}
```
**Error Responses**: 401 (invalid credentials)

#### POST /api/v1/auth/forgot-password
**Purpose**: Trigger password reset email
**Request Body**: `{"email": "user@example.com"}`
**Response 200**: `{"message": "If the email exists, a reset link has been sent."}`

#### POST /api/v1/auth/reset-password
**Purpose**: Complete password reset
**Request Body**: `{"token": "reset-token", "new_password": "NewSecurePass1"}`
**Response 200**: `{"message": "Password updated"}`
**Error Responses**: 400 (invalid/expired token), 422 (weak password)

#### GET /api/v1/users/me
**Purpose**: Fetch current user's profile
**Response 200**:
```json
{"id": "uuid", "email": "...", "name": "...", "photo_url": "...", "language_pref": "en"}
```

#### PATCH /api/v1/users/me
**Purpose**: Update profile fields
**Request Body**: `{"name": "...", "photo_url": "...", "language_pref": "en"}`
**Response 200**: updated user object
**Error Responses**: 422 (validation)

#### DELETE /api/v1/users/me
**Purpose**: Delete own account (cascades trips)
**Response 200**: `{"message": "Account deleted"}`

#### GET /api/v1/trips
**Purpose**: List current user's trips (Dashboard, My Trips)
**Query Params**: `?limit=&offset=&upcoming=true`
**Response 200**: `{"items": [{"id": "...", "name": "...", "start_date": "...", "end_date": "...", "stop_count": 3}], "total": 5}`

#### POST /api/v1/trips
**Purpose**: Create a new trip
**Request Body**:
```json
{"name": "Europe Summer", "start_date": "2026-06-01", "end_date": "2026-06-15", "description": "...", "cover_photo_url": "..."}
```
**Response 201**: created trip object
**Error Responses**: 422 (end_date before start_date, missing name)

#### GET /api/v1/trips/{id}
**Purpose**: Get trip detail
**Response 200**: full trip object with stops summary
**Error Responses**: 404, 403 (not owner and not public)

#### PATCH /api/v1/trips/{id}
**Purpose**: Update trip fields (incl. `is_public` toggle for sharing)
**Response 200**: updated trip object
**Error Responses**: 403 (not owner), 404

#### DELETE /api/v1/trips/{id}
**Purpose**: Delete a trip (cascades stops/stop_activities)
**Response 200**: `{"message": "Trip deleted"}`
**Error Responses**: 403, 404

#### POST /api/v1/trips/{id}/stops
**Purpose**: Add a city stop to a trip (Itinerary Builder)
**Request Body**: `{"city_id": "uuid", "start_date": "2026-06-01", "end_date": "2026-06-04", "order_index": 1}`
**Response 201**: created stop object
**Error Responses**: 422 (stop dates outside trip date range; end before start), 404 (city not found)

#### PATCH /api/v1/stops/{id}
**Purpose**: Update stop dates/order (reorder)
**Response 200**: updated stop
**Error Responses**: 422, 403, 404

#### DELETE /api/v1/stops/{id}
**Purpose**: Remove a stop (cascades its activity assignments)
**Response 200**: `{"message": "Stop removed"}`

#### GET /api/v1/cities
**Purpose**: Search/browse cities (City Search)
**Query Params**: `?q=&country=&region=&sort=popularity`
**Response 200**: `{"items": [{"id": "...", "name": "Paris", "country": "France", "cost_index": 78, "popularity_score": 95}], "total": 120}`

#### GET /api/v1/activities
**Purpose**: Search/browse activities for a city (Activity Search)
**Query Params**: `?city_id=&category=&max_cost=&max_duration=`
**Response 200**: `{"items": [{"id": "...", "name": "Louvre Tour", "category": "sightseeing", "cost": 25, "duration_minutes": 180}], "total": 40}`

#### POST /api/v1/stops/{id}/activities
**Purpose**: Assign an activity to a stop/day
**Request Body**: `{"activity_id": "uuid", "scheduled_date": "2026-06-02", "scheduled_time": "09:00", "cost_override": null}`
**Response 201**: created stop_activity object
**Error Responses**: 422 (scheduled_date outside stop's date range), 404

#### DELETE /api/v1/stop-activities/{id}
**Purpose**: Remove an activity from a stop
**Response 200**: `{"message": "Activity removed"}`

#### GET /api/v1/trips/{id}/itinerary
**Purpose**: Full structured itinerary for Itinerary View (day-wise, grouped by city)
**Response 200**: `{"trip": {...}, "stops": [{"city": "...", "days": [{"date": "...", "activities": [...]}]}]}`

#### GET /api/v1/trips/{id}/calendar
**Purpose**: Calendar/timeline-formatted itinerary data
**Response 200**: `{"days": [{"date": "2026-06-02", "activities": [{"time": "09:00", "name": "...", "cost": 25}]}]}`

#### GET /api/v1/trips/{id}/budget
**Purpose**: Cost breakdown and charts data (Trip Budget screen)
**Response 200**:
```json
{
  "total_estimated_cost": 2400,
  "average_cost_per_day": 171,
  "breakdown": {"transport": 600, "stay": 1000, "activities": 500, "meals": 300},
  "per_day": [{"date": "2026-06-01", "cost": 180, "over_budget": false}],
  "budget_threshold": 2000,
  "is_over_budget": true
}
```

#### PATCH /api/v1/trips/{id}/budget-threshold
**Purpose**: Set/update user's budget alert threshold for the trip
**Request Body**: `{"budget_threshold": 2000}`
**Response 200**: updated trip budget settings

#### GET /api/v1/public/trips/{share_slug}
**Purpose**: Public, read-only itinerary view (no auth required)
**Response 200**: read-only trip/stops/activities payload (excludes owner email/private fields)
**Error Responses**: 404 (not found or no longer public)

#### POST /api/v1/public/trips/{share_slug}/copy
**Purpose**: Copy a public trip into the authenticated caller's account
**Auth**: required (401 if not logged in → client should redirect to login/signup)
**Response 201**: newly created trip (owned by caller) with duplicated stops/activities

#### GET /api/v1/admin/analytics
**Purpose**: Aggregate platform stats (admin-only)
**Auth**: admin role required
**Response 200**:
```json
{
  "trips_created_over_time": [{"date": "2026-08-01", "count": 12}],
  "top_cities": [{"name": "Paris", "trip_count": 40}],
  "top_activities": [{"name": "Louvre Tour", "usage_count": 25}],
  "active_users": 340,
  "avg_trips_per_user": 1.6
}
```
**Error Responses**: 403 (non-admin caller)

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-001**: API response time < 300ms for non-aggregation endpoints (p95), < 800ms for budget/analytics aggregation endpoints, at the target scale of 10s–100s of concurrent users.
- **NFR-002**: Support at least 100 concurrent requests without degradation.

### 4.2 Security
- **NFR-003**: All endpoints except `/health`, `/api/v1/auth/*`, and `/api/v1/public/*` require a valid JWT access token.
- **NFR-004**: Passwords hashed with a strong algorithm (e.g., bcrypt/argon2); never stored or logged in plaintext.
- **NFR-005**: Input validation on all endpoints via Pydantic v2 models.
- **NFR-006**: Rate limiting: 100 req/min per IP; stricter limit (e.g., 10/min) on `/auth/login` and `/auth/forgot-password` to deter brute force.
- **NFR-007**: Public trip endpoints never expose owner email, password hash, or other private profile fields.
- **NFR-008**: Admin endpoints enforce role-based access control (RBAC); admin role is not self-assignable via the public signup flow.

### 4.3 Reliability
- **NFR-009**: System uptime ≥ 99.5% during active use windows.
- **NFR-010**: Graceful error handling; no raw stack traces or unhandled 500s returned to clients.

### 4.4 Scalability
- **NFR-011**: Stateless API layer (JWT, no server-side session) to allow horizontal scaling via additional containers if needed.
- **NFR-012**: Database connection pooling configured; indexes on frequently filtered columns (see Section 6).

### 4.5 Usability
- **NFR-013**: All screens are responsive and usable on both desktop and mobile viewports, per the source problem statement.
- **NFR-014**: Budget-over-threshold and validation errors are surfaced inline, near the relevant field/day, not only as generic toast messages.

---

## 5. Edge Cases

### Input Validation
- Empty required fields (trip name, city, dates) → 422 with field-level error messages
- Trip/stop end date before start date → 422
- Invalid email format on signup/profile update → 422
- SQL injection attempts → handled by SQLAlchemy parameterized queries
- XSS in free-text fields (trip description, activity notes) → sanitized before storage and on render

### Authentication
- Expired access token → 401, client refreshes via refresh token
- Expired/invalid refresh token → 401, redirect to login
- Token used after logout/account deletion → 401 (revoked)
- Password reset token reused or expired → 400

### Trip / Itinerary Data
- Stop dates fall outside the parent trip's date range → 422, reject with explanation
- Two stops in the same trip have overlapping dates → warn/confirm in UI; not hard-blocked (multi-city same-day layovers are valid), but flagged
- Activity scheduled outside its stop's date range → 422
- Reordering stops with a duplicate/missing `order_index` → server re-normalizes order on save
- Deleting a city or activity from the catalog while it's referenced by existing trips → block deletion (409) or soft-delete/deprecate, never cascade-delete user trip data
- Deleting a trip with existing stops/activities → cascade delete (BR-R006), confirmed via UI dialog
- Concurrent edits to the same trip (e.g., two collaborators) → last-write-wins at MVP; documented as a known limitation (see PRD "Real-time collaborative editing" — Phase 2)

### Budget Calculation
- Activity has no explicit cost → defaults to 0 and is flagged as "cost unknown" in the breakdown rather than silently omitted
- Trip has zero stops/activities → budget screen shows $0 total with an empty-state prompt, not an error
- `cost_override` present on a stop_activity → override value used in place of the catalog activity cost for that trip only

### Sharing
- Public share URL requested after owner has un-published the trip → 404 with a user-facing "no longer shared" message, not a generic 404 page
- "Copy Trip" attempted by an unauthenticated visitor → prompt login/signup, then resume the copy action post-auth
- Share slug collision on generation → server retries with a new random slug; slugs are unique-constrained in the DB

### Database
- DB connection failure → 503 Service Unavailable
- Query timeout (e.g., slow admin aggregation) → 504 Gateway Timeout, with aggregation queries paginated/date-bounded to avoid full-table scans

---

## 6. Database Schema

### 6.1 Core Tables

```sql
-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    name            VARCHAR(255),
    photo_url       VARCHAR(512),
    language_pref   VARCHAR(10) DEFAULT 'en',
    role            VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user' | 'admin'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- Trips
CREATE TABLE trips (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    cover_photo_url  VARCHAR(512),
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL,
    is_public        BOOLEAN NOT NULL DEFAULT FALSE,
    share_slug       VARCHAR(32) UNIQUE,
    budget_threshold NUMERIC(10,2),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_trip_dates CHECK (end_date >= start_date)
);
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_share_slug ON trips(share_slug);

-- Cities (curated catalog)
CREATE TABLE cities (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(255) NOT NULL,
    country          VARCHAR(255) NOT NULL,
    region           VARCHAR(255),
    cost_index       NUMERIC(5,2),
    popularity_score NUMERIC(5,2),
    image_url        VARCHAR(512),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_country ON cities(country);

-- Stops (a city leg within a trip)
CREATE TABLE stops (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id     UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_stop_dates CHECK (end_date >= start_date)
);
CREATE INDEX idx_stops_trip_id ON stops(trip_id);

-- Activities (curated catalog, scoped to a city)
CREATE TABLE activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id         UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(50) NOT NULL, -- 'sightseeing' | 'food' | 'adventure' | 'transport' | 'stay' | 'other'
    cost            NUMERIC(10,2) DEFAULT 0,
    duration_minutes INTEGER,
    description     TEXT,
    image_url       VARCHAR(512),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activities_city_id ON activities(city_id);
CREATE INDEX idx_activities_category ON activities(category);

-- Stop-Activity assignments (activity scheduled within a stop)
CREATE TABLE stop_activities (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stop_id        UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    activity_id    UUID NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    cost_override  NUMERIC(10,2),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_stop_activities_stop_id ON stop_activities(stop_id);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 6.2 Entity Relationships
```
users (1) ──< (N) trips
trips (1) ──< (N) stops
cities (1) ──< (N) stops
cities (1) ──< (N) activities
stops (1) ──< (N) stop_activities
activities (1) ──< (N) stop_activities
users (1) ──< (N) password_reset_tokens
```

---

## 7. Error Handling Standard

| HTTP Code | When to Use |
|-----------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (invalid input format not caught by Pydantic; expired/invalid token) |
| 401 | Unauthenticated |
| 403 | Authenticated but not authorized (e.g., non-owner edit, non-admin analytics access) |
| 404 | Resource not found (trip, stop, activity, share_slug) |
| 409 | Conflict (duplicate email, blocked catalog deletion due to references) |
| 422 | Validation error (Pydantic; date-range violations) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |
| 503 | Service unavailable (DB down) |
| 504 | Gateway timeout (slow aggregation query) |
