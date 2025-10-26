import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/residents', label: 'Residents' },
    { path: '/fall-check', label: 'Fall Check' },
    { path: '/falls', label: 'Fall Checks' },
    { path: '/alerts', label: 'Alerts' },
  ];

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl md:text-2xl font-bold">Care AI</h1>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive(item.path) ? "default" : "ghost"} 
                  size="sm"
                  className={isActive(item.path) ? "bg-primary text-primary-foreground" : "text-[#1E293B]"}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};