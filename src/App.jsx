import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Practice from '../components/Practice';
import Cases from '../components/Cases';
import Playground from '../components/Playground';
import Landing from './Landing';

const AppContent = () => {
  const location = useLocation();
  const showNav = location.pathname !== '/';
  return (
    <div className="app">
      {showNav && (
        <Nav/>
      )}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      <Footer />
    </div>
  );
};

// Main App component with Router at the top level
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;