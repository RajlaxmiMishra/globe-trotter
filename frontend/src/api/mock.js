// Mock delay helper
const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));

// ─── Auth ────────────────────────────────────────────────────
let mockUsers = [
  { id: 'u-1', email: 'demo@globetrotter.io', name: 'Prathmesh Sharma', photo_url: null, language_pref: 'en', role: 'user' },
  { id: 'u-admin', email: 'admin@globetrotter.io', name: 'Admin User', photo_url: null, language_pref: 'en', role: 'admin' },
];
let mockPasswords = { 'demo@globetrotter.io': 'Demo1234', 'admin@globetrotter.io': 'Admin1234' };
let loggedInUser = null;

export const mockSignup = async ({ email, password, name }) => {
  await delay();
  if (mockUsers.find(u => u.email === email)) {
    const err = new Error('Email already registered'); err.status = 409; throw err;
  }
  const user = { id: 'u-' + Date.now(), email, name, photo_url: null, language_pref: 'en', role: 'user' };
  mockUsers.push(user); mockPasswords[email] = password;
  loggedInUser = user;
  return user;
};

export const mockLogin = async ({ email, password }) => {
  await delay();
  const user = mockUsers.find(u => u.email === email);
  if (!user || mockPasswords[email] !== password) {
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }
  loggedInUser = user;
  return { access_token: 'mock-access-' + user.id, refresh_token: 'mock-refresh-' + user.id, token_type: 'bearer', user };
};

export const mockGetMe = async () => { await delay(100); return loggedInUser; };
export const mockPatchMe = async (data) => { await delay(); Object.assign(loggedInUser, data); return loggedInUser; };
export const mockDeleteMe = async () => { await delay(); loggedInUser = null; return { message: 'Account deleted' }; };
export const mockForgotPassword = async () => { await delay(600); return { message: 'If the email exists, a reset link has been sent.' }; };
export const mockResetPassword = async () => { await delay(); return { message: 'Password updated' }; };

// ─── Trips ───────────────────────────────────────────────────
let mockTrips = [
  {
    id: 't-1', user_id: 'u-1', name: 'Europe Summer 2026', description: 'A dream trip through France, Italy and Spain.',
    cover_photo_url: null, start_date: '2026-06-01', end_date: '2026-06-15',
    is_public: true, share_slug: 'europe-summer-2026', budget_threshold: 3000, stop_count: 3,
    created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-10T12:00:00Z',
  },
  {
    id: 't-2', user_id: 'u-1', name: 'Japan Cherry Blossoms', description: 'Tokyo, Kyoto and Osaka in spring.',
    cover_photo_url: null, start_date: '2027-03-25', end_date: '2027-04-05',
    is_public: false, share_slug: null, budget_threshold: null, stop_count: 3,
    created_at: '2026-08-01T08:00:00Z', updated_at: '2026-08-10T09:00:00Z',
  },
  {
    id: 't-3', user_id: 'u-1', name: 'Southeast Asia Adventure', description: '',
    cover_photo_url: null, start_date: '2026-11-01', end_date: '2026-11-20',
    is_public: false, share_slug: null, budget_threshold: 2000, stop_count: 0,
    created_at: '2026-08-20T07:00:00Z', updated_at: '2026-08-20T07:00:00Z',
  },
];

export const mockListTrips = async ({ limit = 10, offset = 0 } = {}) => {
  await delay();
  return { items: mockTrips.slice(offset, offset + limit), total: mockTrips.length };
};
export const mockGetTrip = async (id) => { await delay(150); const t = mockTrips.find(t => t.id === id); if (!t) { const e = new Error('Not found'); e.status = 404; throw e; } return t; };
export const mockCreateTrip = async (data) => {
  await delay();
  const trip = { id: 't-' + Date.now(), user_id: 'u-1', ...data, is_public: false, share_slug: null, budget_threshold: null, stop_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  mockTrips.unshift(trip); return trip;
};
export const mockUpdateTrip = async (id, data) => {
  await delay();
  const i = mockTrips.findIndex(t => t.id === id); if (i === -1) { const e = new Error('Not found'); e.status = 404; throw e; }
  const updated = { ...mockTrips[i], ...data, updated_at: new Date().toISOString() };
  if (data.is_public && !mockTrips[i].share_slug) updated.share_slug = 'trip-' + id.slice(-4) + '-' + Date.now().toString(36);
  if (data.is_public === false) updated.share_slug = null;
  mockTrips[i] = updated; return updated;
};
export const mockDeleteTrip = async (id) => { await delay(); mockTrips = mockTrips.filter(t => t.id !== id); return { message: 'Trip deleted' }; };
export const mockSetBudgetThreshold = async (id, budget_threshold) => { return mockUpdateTrip(id, { budget_threshold }); };

// ─── Stops ───────────────────────────────────────────────────
let mockStops = [
  { id: 's-1', trip_id: 't-1', city_id: 'c-1', city: { id: 'c-1', name: 'Paris', country: 'France', image_url: null }, start_date: '2026-06-01', end_date: '2026-06-05', order_index: 0 },
  { id: 's-2', trip_id: 't-1', city_id: 'c-2', city: { id: 'c-2', name: 'Rome', country: 'Italy', image_url: null }, start_date: '2026-06-06', end_date: '2026-06-10', order_index: 1 },
  { id: 's-3', trip_id: 't-1', city_id: 'c-3', city: { id: 'c-3', name: 'Barcelona', country: 'Spain', image_url: null }, start_date: '2026-06-11', end_date: '2026-06-15', order_index: 2 },
  { id: 's-4', trip_id: 't-2', city_id: 'c-4', city: { id: 'c-4', name: 'Tokyo', country: 'Japan', image_url: null }, start_date: '2027-03-25', end_date: '2027-03-30', order_index: 0 },
  { id: 's-5', trip_id: 't-2', city_id: 'c-5', city: { id: 'c-5', name: 'Kyoto', country: 'Japan', image_url: null }, start_date: '2027-03-31', end_date: '2027-04-02', order_index: 1 },
  { id: 's-6', trip_id: 't-2', city_id: 'c-6', city: { id: 'c-6', name: 'Osaka', country: 'Japan', image_url: null }, start_date: '2027-04-03', end_date: '2027-04-05', order_index: 2 },
];

export const mockGetStops = async (tripId) => { await delay(); return mockStops.filter(s => s.trip_id === tripId); };
export const mockAddStop = async (tripId, data) => {
  await delay();
  const city = mockCities.find(c => c.id === data.city_id) || { id: data.city_id, name: 'Unknown', country: '', image_url: null };
  const stop = { id: 's-' + Date.now(), trip_id: tripId, city_id: data.city_id, city, ...data };
  mockStops.push(stop);
  const trip = mockTrips.find(t => t.id === tripId);
  if (trip) trip.stop_count = (trip.stop_count || 0) + 1;
  return stop;
};
export const mockUpdateStop = async (id, data) => {
  await delay();
  const i = mockStops.findIndex(s => s.id === id); if (i === -1) throw new Error('Not found');
  mockStops[i] = { ...mockStops[i], ...data }; return mockStops[i];
};
export const mockDeleteStop = async (id) => {
  await delay();
  const stop = mockStops.find(s => s.id === id);
  if (stop) { const trip = mockTrips.find(t => t.id === stop.trip_id); if (trip) trip.stop_count = Math.max(0, (trip.stop_count||0)-1); }
  mockStops = mockStops.filter(s => s.id !== id);
  return { message: 'Stop removed' };
};

// ─── Cities ──────────────────────────────────────────────────
export const mockCities = [
  { id: 'c-1',  name: 'Paris',     country: 'France',       region: 'Europe',      cost_index: 78, popularity_score: 95, image_url: null },
  { id: 'c-2',  name: 'Rome',      country: 'Italy',        region: 'Europe',      cost_index: 65, popularity_score: 90, image_url: null },
  { id: 'c-3',  name: 'Barcelona', country: 'Spain',        region: 'Europe',      cost_index: 60, popularity_score: 88, image_url: null },
  { id: 'c-4',  name: 'Tokyo',     country: 'Japan',        region: 'Asia',        cost_index: 72, popularity_score: 96, image_url: null },
  { id: 'c-5',  name: 'Kyoto',     country: 'Japan',        region: 'Asia',        cost_index: 55, popularity_score: 85, image_url: null },
  { id: 'c-6',  name: 'Osaka',     country: 'Japan',        region: 'Asia',        cost_index: 50, popularity_score: 82, image_url: null },
  { id: 'c-7',  name: 'Bangkok',   country: 'Thailand',     region: 'Asia',        cost_index: 30, popularity_score: 87, image_url: null },
  { id: 'c-8',  name: 'Bali',      country: 'Indonesia',    region: 'Asia',        cost_index: 25, popularity_score: 91, image_url: null },
  { id: 'c-9',  name: 'New York',  country: 'USA',          region: 'North America',cost_index: 92, popularity_score: 94, image_url: null },
  { id: 'c-10', name: 'London',    country: 'UK',           region: 'Europe',      cost_index: 88, popularity_score: 93, image_url: null },
  { id: 'c-11', name: 'Amsterdam', country: 'Netherlands',  region: 'Europe',      cost_index: 70, popularity_score: 84, image_url: null },
  { id: 'c-12', name: 'Prague',    country: 'Czech Republic',region: 'Europe',     cost_index: 40, popularity_score: 80, image_url: null },
  { id: 'c-13', name: 'Lisbon',    country: 'Portugal',     region: 'Europe',      cost_index: 45, popularity_score: 83, image_url: null },
  { id: 'c-14', name: 'Dubai',     country: 'UAE',          region: 'Middle East', cost_index: 75, popularity_score: 89, image_url: null },
  { id: 'c-15', name: 'Singapore', country: 'Singapore',    region: 'Asia',        cost_index: 80, popularity_score: 90, image_url: null },
];

export const mockSearchCities = async ({ q = '', country = '', region = '' } = {}) => {
  await delay();
  let items = mockCities;
  if (q) items = items.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase()));
  if (country) items = items.filter(c => c.country === country);
  if (region) items = items.filter(c => c.region === region);
  return { items, total: items.length };
};

// ─── Activities ──────────────────────────────────────────────
const mockActivitiesData = [
  { id: 'a-1',  city_id: 'c-1', name: 'Eiffel Tower Visit',   category: 'sightseeing', cost: 30,  duration_minutes: 120, description: 'Visit the iconic iron tower.', image_url: null },
  { id: 'a-2',  city_id: 'c-1', name: 'Louvre Museum Tour',    category: 'sightseeing', cost: 22,  duration_minutes: 180, description: 'Explore 35,000 artworks.', image_url: null },
  { id: 'a-3',  city_id: 'c-1', name: 'Seine River Cruise',    category: 'sightseeing', cost: 18,  duration_minutes: 60,  description: 'Scenic boat ride.', image_url: null },
  { id: 'a-4',  city_id: 'c-1', name: 'French Cooking Class',  category: 'food',        cost: 95,  duration_minutes: 180, description: 'Learn to cook classic dishes.', image_url: null },
  { id: 'a-5',  city_id: 'c-2', name: 'Colosseum Tour',        category: 'sightseeing', cost: 20,  duration_minutes: 150, description: 'Explore ancient Rome.', image_url: null },
  { id: 'a-6',  city_id: 'c-2', name: 'Vatican Museums',       category: 'sightseeing', cost: 27,  duration_minutes: 240, description: 'World-class art and history.', image_url: null },
  { id: 'a-7',  city_id: 'c-2', name: 'Pasta Making Class',    category: 'food',        cost: 75,  duration_minutes: 180, description: 'Hands-on pasta workshop.', image_url: null },
  { id: 'a-8',  city_id: 'c-3', name: 'Sagrada Familia',       category: 'sightseeing', cost: 26,  duration_minutes: 120, description: "Gaudí's masterpiece.", image_url: null },
  { id: 'a-9',  city_id: 'c-3', name: 'Park Güell',            category: 'sightseeing', cost: 10,  duration_minutes: 90,  description: 'Colourful Gaudí park.', image_url: null },
  { id: 'a-10', city_id: 'c-4', name: 'Senso-ji Temple',       category: 'sightseeing', cost: 0,   duration_minutes: 90,  description: "Tokyo's oldest temple.", image_url: null },
  { id: 'a-11', city_id: 'c-4', name: 'Tsukiji Fish Market',   category: 'food',        cost: 0,   duration_minutes: 120, description: 'Famous seafood market.', image_url: null },
  { id: 'a-12', city_id: 'c-4', name: 'Tokyo DisneySea',       category: 'adventure',   cost: 100, duration_minutes: 480, description: 'Unique theme park.', image_url: null },
];
let mockStopActivities = [
  { id: 'sa-1', stop_id: 's-1', activity_id: 'a-1', scheduled_date: '2026-06-01', scheduled_time: '10:00', cost_override: null, activity: mockActivitiesData[0] },
  { id: 'sa-2', stop_id: 's-1', activity_id: 'a-2', scheduled_date: '2026-06-02', scheduled_time: '09:00', cost_override: null, activity: mockActivitiesData[1] },
  { id: 'sa-3', stop_id: 's-2', activity_id: 'a-5', scheduled_date: '2026-06-06', scheduled_time: '10:00', cost_override: null, activity: mockActivitiesData[4] },
  { id: 'sa-4', stop_id: 's-3', activity_id: 'a-8', scheduled_date: '2026-06-11', scheduled_time: '11:00', cost_override: null, activity: mockActivitiesData[7] },
];

export const mockSearchActivities = async ({ city_id, category, max_cost, max_duration } = {}) => {
  await delay();
  let items = mockActivitiesData;
  if (city_id) items = items.filter(a => a.city_id === city_id);
  if (category) items = items.filter(a => a.category === category);
  if (max_cost != null) items = items.filter(a => a.cost <= max_cost);
  if (max_duration != null) items = items.filter(a => a.duration_minutes <= max_duration);
  return { items, total: items.length };
};
export const mockGetStopActivities = async (stopId) => { await delay(100); return mockStopActivities.filter(sa => sa.stop_id === stopId); };
export const mockAddActivity = async (stopId, data) => {
  await delay();
  const activity = mockActivitiesData.find(a => a.id === data.activity_id);
  const sa = { id: 'sa-' + Date.now(), stop_id: stopId, ...data, activity };
  mockStopActivities.push(sa); return sa;
};
export const mockRemoveActivity = async (id) => { await delay(); mockStopActivities = mockStopActivities.filter(sa => sa.id !== id); return { message: 'Activity removed' }; };

// ─── Itinerary ───────────────────────────────────────────────
export const mockGetItinerary = async (tripId) => {
  await delay();
  const trip = mockTrips.find(t => t.id === tripId);
  const stops = mockStops.filter(s => s.trip_id === tripId);
  const stopsWithDays = stops.map(stop => {
    const stopActs = mockStopActivities.filter(sa => sa.stop_id === stop.id);
    const dayMap = {};
    const start = new Date(stop.start_date), end = new Date(stop.end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      dayMap[dateStr] = { date: dateStr, activities: [] };
    }
    stopActs.forEach(sa => { if (dayMap[sa.scheduled_date]) dayMap[sa.scheduled_date].activities.push(sa); });
    return { ...stop, days: Object.values(dayMap) };
  });
  return { trip, stops: stopsWithDays };
};

// ─── Calendar ────────────────────────────────────────────────
export const mockGetCalendar = async (tripId) => {
  await delay();
  const trip = mockTrips.find(t => t.id === tripId);
  if (!trip) return { days: [] };
  const days = [];
  const start = new Date(trip.start_date), end = new Date(trip.end_date);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const acts = mockStopActivities.filter(sa => sa.scheduled_date === dateStr);
    days.push({ date: dateStr, activities: acts.map(sa => ({ time: sa.scheduled_time, name: sa.activity?.name, cost: sa.cost_override ?? sa.activity?.cost ?? 0 })) });
  }
  return { days };
};

// ─── Budget ──────────────────────────────────────────────────
export const mockGetBudget = async (tripId) => {
  await delay();
  const trip = mockTrips.find(t => t.id === tripId);
  const stops = mockStops.filter(s => s.trip_id === tripId);
  if (!stops.length) return { total_estimated_cost: 0, average_cost_per_day: 0, breakdown: { transport: 0, stay: 0, activities: 0, meals: 0 }, per_day: [], budget_threshold: trip?.budget_threshold ?? null, is_over_budget: false };
  const stopActs = mockStopActivities.filter(sa => stops.some(s => s.id === sa.stop_id));
  const actCost = stopActs.reduce((sum, sa) => sum + (sa.cost_override ?? sa.activity?.cost ?? 0), 0);
  const totalDays = stops.reduce((sum, s) => { const d = (new Date(s.end_date) - new Date(s.start_date)) / 86400000 + 1; return sum + d; }, 0);
  const stay = totalDays * 80, transport = stops.length * 120, meals = totalDays * 30, activities = actCost;
  const total = stay + transport + meals + activities;
  const perDay = [];
  const tripStart = new Date(trip.start_date), tripEnd = new Date(trip.end_date);
  for (let d = new Date(tripStart); d <= tripEnd; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const dayCost = stopActs.filter(sa => sa.scheduled_date === dateStr).reduce((s, sa) => s + (sa.cost_override ?? sa.activity?.cost ?? 0), 0) + 30 + 80;
    const threshold = trip?.budget_threshold;
    perDay.push({ date: dateStr, cost: Math.round(dayCost), over_budget: threshold ? dayCost > threshold / totalDays : false });
  }
  return { total_estimated_cost: Math.round(total), average_cost_per_day: Math.round(total / (totalDays || 1)), breakdown: { transport: Math.round(transport), stay: Math.round(stay), activities: Math.round(activities), meals: Math.round(meals) }, per_day: perDay, budget_threshold: trip?.budget_threshold ?? null, is_over_budget: trip?.budget_threshold ? total > trip.budget_threshold : false };
};

// ─── Public ──────────────────────────────────────────────────
export const mockGetPublicTrip = async (slug) => {
  await delay();
  const trip = mockTrips.find(t => t.share_slug === slug && t.is_public);
  if (!trip) { const e = new Error('Trip not found or no longer public'); e.status = 404; throw e; }
  const stops = mockStops.filter(s => s.trip_id === trip.id);
  const stopsWithActs = stops.map(stop => ({ ...stop, activities: mockStopActivities.filter(sa => sa.stop_id === stop.id) }));
  return { ...trip, owner_name: 'Prathmesh S.', stops: stopsWithActs };
};
export const mockCopyTrip = async (slug) => {
  await delay(800);
  const src = mockTrips.find(t => t.share_slug === slug);
  if (!src) { const e = new Error('Not found'); e.status = 404; throw e; }
  const copy = { ...src, id: 't-copy-' + Date.now(), name: src.name + ' (Copy)', is_public: false, share_slug: null, user_id: 'u-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  mockTrips.push(copy);
  return copy;
};

// ─── Admin ───────────────────────────────────────────────────
export const mockGetAnalytics = async () => {
  await delay(600);
  return {
    trips_created_over_time: [
      { date: '2026-06-01', count: 8 }, { date: '2026-07-01', count: 15 }, { date: '2026-08-01', count: 22 },
    ],
    top_cities: [
      { name: 'Paris', trip_count: 40 }, { name: 'Tokyo', trip_count: 35 }, { name: 'Barcelona', trip_count: 28 },
      { name: 'Rome', trip_count: 24 }, { name: 'Bali', trip_count: 20 },
    ],
    top_activities: [
      { name: 'Eiffel Tower Visit', usage_count: 35 }, { name: 'Colosseum Tour', usage_count: 28 },
      { name: 'Senso-ji Temple', usage_count: 26 }, { name: 'Sagrada Familia', usage_count: 22 },
    ],
    active_users: 340,
    avg_trips_per_user: 1.6,
  };
};
