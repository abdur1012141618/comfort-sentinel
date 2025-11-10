// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// import { AuthProvider } from './contexts/AuthContext.tsx'; 

// import { AuthProvider } from './components/AuthGate.tsx'; 
import { AuthProvider } from './components/AuthGate.tsx'; 

import { Dashboard } from './pages/Dashboard';
import { Staffing } from './pages/Staffing';
import { Residents } from './pages/Residents';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login'; 

function App() {
  return (
    <AuthProvider> {/* AuthProvider from AuthGate.tsx */}
      <Router>
        <div className="flex h-screen bg-gray-100">
          <div className="flex flex-col flex-1 overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
              <div className="container mx-auto px-6 py-8">
                <Routes>
                  <Route path="/login" element={<Login />} /> 

                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/staffing" element={<Staffing />} />
                    <Route path="/residents" element={<Residents />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
