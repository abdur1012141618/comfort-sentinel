import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Staffing } from './pages/Staffing';
import { Residents } from './pages/Residents';
import { Settings } from './pages/Settings';
import { Sidebar } from './components/ui/sidebar';
import { Header } from './components/ui/header.tsx'; // <--- এই লাইনটি ঠিক করা হয়েছে
import { UserManagement } from './pages/UserManagement';
import { Alerts } from './pages/api/Alerts.tsx'; 

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <Header toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/staffing" element={<Staffing />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/users" element={<UserManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
