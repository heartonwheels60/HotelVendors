import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Lazy load components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PropertiesPage = React.lazy(() => import('./pages/PropertiesPage').then(module => ({ default: module.PropertiesPage })));
const PropertyFormPage = React.lazy(() => import('./pages/PropertyFormPage').then(module => ({ default: module.PropertyFormPage })));
const RoomManagement = React.lazy(() => import('./pages/RoomManagement').then(module => ({ default: module.RoomManagement })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

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
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/properties" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PropertiesPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/properties/new" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PropertyFormPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/properties/:id/edit" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PropertyFormPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rooms" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <RoomManagement />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect root to login if not authenticated */}
              <Route path="/" element={<Navigate to="/auth/login" replace />} />
              
              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;