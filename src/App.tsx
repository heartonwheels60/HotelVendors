import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { DynamicPricingProvider } from './contexts/DynamicPricingContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { HotelsPage } from './pages/PropertiesPage';
import { HotelFormPage } from './pages/PropertyFormPage';
import { BookingsPage } from './pages/BookingsPage';
import { BookingFormPage } from './pages/BookingFormPage';
import { BookingCalendarPage } from './pages/BookingCalendarPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ReviewFormPage } from './pages/ReviewFormPage';
import { StaffPage } from './pages/StaffPage';
import { StaffFormPage } from './pages/StaffFormPage';
import { StaffSchedulePage } from './pages/StaffSchedulePage';
import { PricingPage } from './pages/PricingPage';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import NotFound from './pages/NotFound';

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DynamicPricingProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Routes with Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="/hotels" element={<HotelsPage />} />
                  <Route path="/hotels/new" element={<HotelFormPage />} />
                  <Route path="/hotels/edit/:id" element={<HotelFormPage />} />
                  <Route path="/pricing" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PricingPage />
                    </Suspense>
                  } />
                  <Route path="/rooms" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <RoomManagement />
                    </Suspense>
                  } />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/bookings/new" element={<BookingFormPage />} />
                  <Route path="/bookings/edit/:id" element={<BookingFormPage />} />
                  <Route path="/bookings/calendar" element={<BookingCalendarPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/reviews/new/:bookingId" element={<ReviewFormPage />} />
                  <Route path="/staff" element={<StaffPage />} />
                  <Route path="/staff/new" element={<StaffFormPage />} />
                  <Route path="/staff/edit/:id" element={<StaffFormPage />} />
                  <Route path="/staff/schedule" element={<StaffSchedulePage />} />
                  {/* Catch-all route for 404 */}
                  <Route path="*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <NotFound />
                    </Suspense>
                  } />
                </Route>
              </Route>
            </Routes>
          </Router>
        </DynamicPricingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;