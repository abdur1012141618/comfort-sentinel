import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext.tsx'; // <--- এই লাইনটি পরিবর্তন করা হয়েছে
import { Dashboard } from './pages/Dashboard';
import { Staffing } from './pages/Staffing';
import { Residents } from './pages/Residents';
import { Settings } from './pages/Settings';
// Login কম্পোনেন্টটি ইম্পোর্ট করুন
import { Login } from './pages/Login'; // <--- এই লাইনটি যোগ করুন (আপনার ফাইল পাথ অনুযায়ী)

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <div className="flex flex-col flex-1 overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
              <div className="container mx-auto px-6 py-8">
                <Routes>
                  {/* নতুন যোগ করা লাইন: লগইন রুট */}
                  <Route path="/login" element={<Login />} /> 

                  {/* সুরক্ষিত রুটগুলি */}
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
