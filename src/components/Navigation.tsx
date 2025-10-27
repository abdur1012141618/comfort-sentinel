import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";

export const Navigation = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: t('navigation.dashboard') },
    { path: '/residents', label: t('navigation.residents') },
    { path: '/vitals', label: t('navigation.vitals') },
    { path: '/tasks', label: t('navigation.tasks') },
    { path: '/fall-check', label: t('navigation.fallCheck') },
    { path: '/falls', label: t('navigation.fallChecks') },
    { path: '/alerts', label: t('navigation.alerts') },
  ];

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold">Care AI</h1>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive(item.path) ? "default" : "ghost"} 
                    size="sm"
                    className={isActive(item.path) ? "bg-primary text-primary-foreground" : ""}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
};