import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { AuthProvider } from './contexts/AuthContext';

const Landing = lazy(() => import('./Landing'));
const Practice = lazy(() => import('../components/Practice'));
const Cases = lazy(() => import('../components/Cases'));
const Playground = lazy(() => import('../components/Playground'));
const Account = lazy(() => import('../components/Account'));
const MyProfile = lazy(() => import('../components/MyProfile'));
const Statistics = lazy(() => import('../components/Statistics'));
const Settings = lazy(() => import('../components/Settings'));
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));

const AppContent = () => {
  const location = useLocation();
  const showNav = location.pathname !== '/';
  return (
    <div className="app">
      {showNav && (
        <Nav/>
      )}
      <Suspense fallback={<main className="account-loading">Loading QueryQuest...</main>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/account" element={<Account />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      
      <Footer />
    </div>
  );
};

// Main App component with Router at the top level
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;