import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  CalendarDays,
  DollarSign,
  MessageSquare,
  Users,
  BarChart3,
  Menu as MenuIcon,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { path: '/', icon: <LayoutGrid className="w-6 h-6" />, label: 'Dashboard' },
  { path: '/properties', icon: <Building2 className="w-6 h-6" />, label: 'Properties' },
  { path: '/bookings', icon: <CalendarDays className="w-6 h-6" />, label: 'Bookings' },
  { path: '/pricing', icon: <DollarSign className="w-6 h-6" />, label: 'Pricing' },
  { path: '/reviews', icon: <MessageSquare className="w-6 h-6" />, label: 'Reviews' },
  { path: '/staff', icon: <Users className="w-6 h-6" />, label: 'Staff' },
  { path: '/reports', icon: <BarChart3 className="w-6 h-6" />, label: 'Reports' },
];

export const Layout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md hover:bg-gray-50"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <MenuIcon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop and Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto shadow-lg ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold">HotelManager</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive(item.path) ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 w-full px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Padding for Mobile Menu Button */}
        <div className="h-16 lg:h-0" />
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};