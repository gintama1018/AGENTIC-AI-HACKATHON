import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Dashboard Pages
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { ReturnsPage } from './pages/dashboard/ReturnsPage';
import { ReturnDetailPage } from './pages/dashboard/ReturnDetailPage';
import { PatternsPage } from './pages/dashboard/PatternsPage';
import { ProductsPage } from './pages/dashboard/ProductsPage';
import { RecommendationsPage } from './pages/dashboard/RecommendationsPage';
import { ImportPage } from './pages/dashboard/ImportPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  // If not logged in, we still allow seamless entry for hackathon demo or redirect to login
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Authenticated Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="returns/:id" element={<ReturnDetailPage />} />
            <Route path="patterns" element={<PatternsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="import" element={<ImportPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
