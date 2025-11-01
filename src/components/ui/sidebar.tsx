// src/components/ui/sidebar.tsx
import { Link, NavLink, useLocation } from 'react-router-dom'; // NavLink এবং useLocation যোগ করা হয়েছে
import { Home, Users, Clock, AlertTriangle, FileText, Settings, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ... (বাকি কোড অপরিবর্তিত থাকবে)

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Residents', href: '/residents', icon: Users },
  { name: 'Staffing Prediction', href: '/staffing', icon: Clock },
  { name: 'Tasks', href: '/tasks', icon: Clock }, // আইকনটি পরিবর্তন করা যেতে পারে
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const Sidebar = () => {
  const { t } = useTranslation();
  // const location = useLocation(); // NavLink ব্যবহার করায় useLocation আর প্রয়োজন নেই

  const getLinkClasses = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = 'flex items-center p-3 rounded-lg transition-colors duration-200';
    const activeClasses = 'bg-primary/10 text-primary font-semibold';
    const inactiveClasses = 'text-gray-600 hover:bg-gray-100';

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="flex flex-col h-full bg-white border-r shadow-lg">
      {/* Logo/Header Section */}
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">CareAI</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={getLinkClasses} // ফাংশন ব্যবহার করা হয়েছে
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm">{t(item.name)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer/Settings/Logout */}
      <div className="p-4 border-t space-y-2">
        <NavLink
          to="/settings"
          className={getLinkClasses}
        >
          <Settings className="w-5 h-5 mr-3" />
          <span className="text-sm">{t('Settings')}</span>
        </NavLink>
        <button
          onClick={() => console.log('Logout clicked')} // এখানে আপনার আসল লগআউট লজিক থাকবে
          className="flex items-center p-3 w-full rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>{t('Logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
