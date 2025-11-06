import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Component Imports
import Dashboard from './pages/Dashboard';
import Staffing from './pages/Staffing';
import Residents from './pages/Residents';
// import Alerts from './pages/Alerts'; // <--- এই লাইনটি মুছে ফেলা হয়েছে
import Settings from './pages/Settings';
import Sidebar from './components/ui/sidebar.tsx';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { i18n } = useTranslation();

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/staffing" element={<Staffing />} />
                  <Route path="/residents" element={<Residents />} />
                  {/* <Route path="/alerts" element={<Alerts />} />  <--- এই লাইনটি মুছে ফেলা হয়েছে */}
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
