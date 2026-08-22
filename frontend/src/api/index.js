import * as mock from './mock.js';
import { apiClient } from './client.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const signup = (data) => USE_MOCK ? mock.mockSignup(data) : apiClient.post('/api/v1/auth/signup', data).then(r => r.data);
export const login  = (data) => USE_MOCK ? mock.mockLogin(data)  : apiClient.post('/api/v1/auth/login', data).then(r => r.data);
export const forgotPassword = (data) => USE_MOCK ? mock.mockForgotPassword(data) : apiClient.post('/api/v1/auth/forgot-password', data).then(r => r.data);
export const resetPassword  = (data) => USE_MOCK ? mock.mockResetPassword(data)  : apiClient.post('/api/v1/auth/reset-password', data).then(r => r.data);
export const getMe    = ()     => USE_MOCK ? mock.mockGetMe()    : apiClient.get('/api/v1/users/me').then(r => r.data);
export const patchMe  = (data) => USE_MOCK ? mock.mockPatchMe(data) : apiClient.patch('/api/v1/users/me', data).then(r => r.data);
export const deleteMe = ()     => USE_MOCK ? mock.mockDeleteMe() : apiClient.delete('/api/v1/users/me').then(r => r.data);

export const listTrips  = (p)    => USE_MOCK ? mock.mockListTrips(p)     : apiClient.get('/api/v1/trips', { params: p }).then(r => r.data);
export const getTrip    = (id)   => USE_MOCK ? mock.mockGetTrip(id)      : apiClient.get('/api/v1/trips/' + id).then(r => r.data);
export const createTrip = (data) => USE_MOCK ? mock.mockCreateTrip(data) : apiClient.post('/api/v1/trips', data).then(r => r.data);
export const updateTrip = (id, data) => USE_MOCK ? mock.mockUpdateTrip(id, data) : apiClient.patch('/api/v1/trips/' + id, data).then(r => r.data);
export const deleteTrip = (id)   => USE_MOCK ? mock.mockDeleteTrip(id)   : apiClient.delete('/api/v1/trips/' + id).then(r => r.data);
export const setBudgetThreshold = (id, v) => USE_MOCK ? mock.mockSetBudgetThreshold(id, v) : apiClient.patch('/api/v1/trips/' + id + '/budget-threshold', { budget_threshold: v }).then(r => r.data);

export const getStops   = (tripId)       => USE_MOCK ? mock.mockGetStops(tripId)        : apiClient.get('/api/v1/trips/' + tripId + '/stops').then(r => r.data);
export const addStop    = (tripId, data) => USE_MOCK ? mock.mockAddStop(tripId, data)   : apiClient.post('/api/v1/trips/' + tripId + '/stops', data).then(r => r.data);
export const updateStop = (id, data)     => USE_MOCK ? mock.mockUpdateStop(id, data)    : apiClient.patch('/api/v1/stops/' + id, data).then(r => r.data);
export const deleteStop = (id)           => USE_MOCK ? mock.mockDeleteStop(id)          : apiClient.delete('/api/v1/stops/' + id).then(r => r.data);

export const searchCities      = (p)            => USE_MOCK ? mock.mockSearchCities(p)            : apiClient.get('/api/v1/cities', { params: p }).then(r => r.data);
export const searchActivities  = (p)            => USE_MOCK ? mock.mockSearchActivities(p)        : apiClient.get('/api/v1/activities', { params: p }).then(r => r.data);
export const getStopActivities = (stopId)       => USE_MOCK ? mock.mockGetStopActivities(stopId)  : apiClient.get('/api/v1/stops/' + stopId + '/activities').then(r => r.data);
export const addActivity       = (stopId, data) => USE_MOCK ? mock.mockAddActivity(stopId, data)  : apiClient.post('/api/v1/stops/' + stopId + '/activities', data).then(r => r.data);
export const removeActivity    = (id)           => USE_MOCK ? mock.mockRemoveActivity(id)         : apiClient.delete('/api/v1/stop-activities/' + id).then(r => r.data);

export const getItinerary = (tripId) => USE_MOCK ? mock.mockGetItinerary(tripId) : apiClient.get('/api/v1/trips/' + tripId + '/itinerary').then(r => r.data);
export const getCalendar  = (tripId) => USE_MOCK ? mock.mockGetCalendar(tripId)  : apiClient.get('/api/v1/trips/' + tripId + '/calendar').then(r => r.data);
export const getBudget    = (tripId) => USE_MOCK ? mock.mockGetBudget(tripId)    : apiClient.get('/api/v1/trips/' + tripId + '/budget').then(r => r.data);

export const getPublicTrip = (slug) => USE_MOCK ? mock.mockGetPublicTrip(slug) : apiClient.get('/api/v1/public/trips/' + slug).then(r => r.data);
export const copyTrip      = (slug) => USE_MOCK ? mock.mockCopyTrip(slug)      : apiClient.post('/api/v1/public/trips/' + slug + '/copy').then(r => r.data);

export const getAnalytics = () => USE_MOCK ? mock.mockGetAnalytics() : apiClient.get('/api/v1/admin/analytics').then(r => r.data);
