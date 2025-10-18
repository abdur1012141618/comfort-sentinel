import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, AlertCircle, FileText, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Removed the useAuth hook and related imports for login bypass

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/residents", label: "Residents", icon: Users },
  { path: "/alerts", label: "Alerts", icon: AlertCircle },
  { path: "/logs", label: "Logs", icon: FileText },
  { path: "/settings", label: "Settings", icon: Settings },
];

// Replaced AppSidebar with a simpler function that does not rely on authentication
function AppSidebar() {
  return (
    <Sidebar className="w-64">
      <SidebarGroup>
        <SidebarGroupLabel className="text-lg font-bold text-[#1E293B] px-4 py-2">Care AI</SidebarGroupLabel>
      </SidebarGroup>
      <SidebarGroupContent>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-2 rounded-lg transition-colors duration-150 text-[#1E293B] hover:bg-accent hover:text-accent-foreground ${
                  isActive ? "bg-accent font-medium" : ""
                }`
              }
            >
              <item.icon className="icon-class h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          </SidebarMenuItem>
        ))}
      </SidebarGroupContent>
      {/* Removed Sign Out button */}
    </Sidebar>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Removed the check for isAuthenticated and redirect logic

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="flex items-center justify-between border-b bg-card p-4">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
