import { NavLink } from "react-router-dom";
import { Home, Users, AlertTriangle, Settings, ClipboardList, AlertCircle, FileBarChart, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();

  const navigation = [
    { name: t('navigation.dashboard'), href: "/dashboard", icon: Home },
    { name: t('navigation.residents'), href: "/residents", icon: Users },
    { name: t('navigation.alerts'), href: "/alerts", icon: AlertTriangle },
    { name: t('navigation.tasks'), href: "/tasks", icon: ClipboardList },
    { name: t('navigation.incidents'), href: "/incidents", icon: AlertCircle },
    { name: t('navigation.reports'), href: "/reports", icon: FileBarChart },
    { name: t('navigation.settings'), href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-gradient-to-b from-primary to-primary/90 border-r border-border">
        <div className="flex items-center justify-between h-16 px-6 border-b border-primary-foreground/10">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">CareAI</span>
          <LanguageToggle />
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary-foreground/10 text-primary-foreground shadow-lg"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
