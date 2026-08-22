import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppShell from './components/layout/AppShell.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MyTripsPage from './pages/MyTripsPage.jsx';
import CreateTripPage from './pages/CreateTripPage.jsx';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage.jsx';
import ItineraryViewPage from './pages/ItineraryViewPage.jsx';
import CitySearchPage from './pages/CitySearchPage.jsx';
import ActivitySearchPage from './pages/ActivitySearchPage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import PublicSharePage from './pages/PublicSharePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import Spinner from './components/ui/Spinner.jsx';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fog">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fog">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/login"           element={<LoginPage />} />
      <Route path="/auth/signup"          element={<SignupPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/share/:slug"          element={<PublicSharePage />} />

      {/* Protected routes wrapped in AppShell */}
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index                       element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"            element={<DashboardPage />} />
        <Route path="trips"                element={<MyTripsPage />} />
        <Route path="trips/new"            element={<CreateTripPage />} />
        <Route path="trips/:id/builder"    element={<ItineraryBuilderPage />} />
        <Route path="trips/:id/view"       element={<ItineraryViewPage />} />
        <Route path="trips/:id/budget"     element={<BudgetPage />} />
        <Route path="trips/:id/calendar"   element={<CalendarPage />} />
        <Route path="cities"               element={<CitySearchPage />} />
        <Route path="activities"           element={<ActivitySearchPage />} />
        <Route path="profile"              element={<ProfilePage />} />
        <Route path="admin"                element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
