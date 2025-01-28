import React, { useMemo } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  DollarSign,
  MessageSquare,
  Users,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Properties', path: '/properties' },
  { icon: Calendar, label: 'Bookings', path: '/bookings' },
  { icon: DollarSign, label: 'Pricing', path: '/pricing' },
  { icon: MessageSquare, label: 'Reviews', path: '/reviews' },
  { icon: Users, label: 'Staff', path: '/staff' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
] as const;

// Memoized nav item component
const NavItem = React.memo(({ 
  icon: Icon, 
  label, 
  path, 
  isActive 
}: { 
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
}) => (
  <Link
    to={path}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </Link>
));

NavItem.displayName = 'NavItem';

export const Layout = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize the sidebar visibility check
  const isFormPage = useMemo(() => {
    return location.pathname.includes('/new') || location.pathname.includes('/edit');
  }, [location.pathname]);

  const currentPath = useMemo(() => {
    return location.pathname;
  }, [location]);

  const currentNavItem = useMemo(() => {
    return navItems.find(item => item.path === currentPath) || navItems[0];
  }, [currentPath]);

  // Memoize the sidebar content
  const sidebarContent = useMemo(() => (
    <nav className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 p-4 transition-transform duration-200 ease-in-out ${
      isFormPage ? '-translate-x-full lg:translate-x-0' : ''
    }`}>
      <div className="flex items-center space-x-2 mb-8">
        <Building2 className="text-blue-600" size={32} />
        <span className="text-xl font-bold">HotelManager</span>
      </div>
      
      <div className="space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={location.pathname === item.path}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-50">
            <Bell size={20} />
          </button>
        </div>
      </div>
    </nav>
  ), [isFormPage, location.pathname]);

  // Memoize the header content
  const headerContent = useMemo(() => (
    <header className="bg-white border-b border-gray-200 fixed top-0 right-0 left-64 h-16 flex items-center justify-between px-4 transition-all duration-200 ease-in-out">
      <div className="flex items-center">
        <h1 
          className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate(currentNavItem.path)}
        >
          {currentNavItem.label}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-500">
          <Bell className="h-6 w-6" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-500">
          <Settings className="h-6 w-6" />
        </button>
      </div>
    </header>
  ), [location.pathname, navigate, currentNavItem]);

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarContent}
      <div className={`transition-all duration-200 ease-in-out ${
        isFormPage ? 'ml-0 lg:ml-64' : 'ml-64'
      }`}>
        {headerContent}
        <main className="pt-24 pb-8 px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
});