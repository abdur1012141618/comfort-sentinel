import { NavLink } from "react-router-dom";
import { Home, Users, AlertTriangle, FileText, Settings, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// --- START: Temporary Login Bypass for Testing ---
// NOTE: This is a temporary measure. Remove this useEffect block
// and implement proper Supabase Auth when moving to production.
const useLoginBypass = () => {
  useEffect(() => {
    // Simulate a successful login for testing purposes
    // This is often done by setting a mock session or user state in a real app
    console.log("Login bypass active: Simulating authenticated user for testing.");
    // In a real application, you would set a global state or context here.
    // Since we are just testing the UI and data fetching, a console log is sufficient
    // to acknowledge the bypass is active.
  }, []);
};
// --- END: Temporary Login Bypass for Testing ---

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Residents", href: "/residents", icon: Users },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Logs", href: "/logs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  useLoginBypass(); // Activate the login bypass

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-xl font-semibold text-[#1E293B]">CareAI</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-gray-100 text-[#1E293B]" // Active link: light gray background, dark text
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#1E293B]", // Inactive link: medium gray text, hover to light background and dark text
                )
              }
            >
              <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        {/* Footer Link for Login/Logout */}
        <div className="p-4 border-t border-gray-200">
          <NavLink
            to="/login"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-[#1E293B] transition-colors"
          >
            <LogIn className="w-5 h-5 mr-3" aria-hidden="true" />
            Logout (Bypass)
          </NavLink>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
