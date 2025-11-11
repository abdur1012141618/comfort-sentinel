
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './components/AuthGate.tsx'; // <-- Named Export `{}` মুছে দেওয়া হয়েছে
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Staffing } from './pages/Staffing';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigation } from './components/Navigation';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/staffing" element={<ProtectedRoute element={<Staffing />} />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
