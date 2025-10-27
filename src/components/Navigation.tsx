import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export const Navigation = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: t('navigation.dashboard') },
    { path: '/residents', label: t('navigation.residents') },
    { path: '/vitals', label: t('navigation.vitals') },
    { path: '/tasks', label: t('navigation.tasks') },
    { path: '/incidents', label: t('navigation.incidents') },
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
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>{t('notifications.title')}</span>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="h-auto p-1 text-xs"
                    >
                      {t('notifications.markAllRead')}
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-96">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      {t('notifications.noNotifications')}
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`flex flex-col items-start p-3 cursor-pointer ${
                          !notification.is_read ? "bg-muted/50" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className="font-medium text-sm capitalize">
                            {notification.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-normal">
                          {notification.message}
                        </p>
                        {!notification.is_read && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {t('notifications.unread')}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
};