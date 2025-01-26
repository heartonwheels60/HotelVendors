import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-8">
          <Building2 className="text-blue-600" size={32} />
          <span className="text-xl font-bold">HotelManager</span>
        </div>
        
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="ml-64">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Settings size={20} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center">
                  JD
                </div>
                <span className="font-medium">John Doe</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};