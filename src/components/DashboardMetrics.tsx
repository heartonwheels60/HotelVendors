import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="flex items-baseline mt-4">
        <h2 className="text-2xl font-semibold">{value}</h2>
        <span className={`ml-2 flex items-center text-sm ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(change)}%
        </span>
      </div>
    </div>
  );
};

export const DashboardMetrics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Bookings"
        value="156"
        change={12.5}
        icon={<Calendar className="text-blue-600" size={24} />}
      />
      <MetricCard
        title="Revenue"
        value="$24,500"
        change={8.2}
        icon={<TrendingUp className="text-blue-600" size={24} />}
      />
      <MetricCard
        title="Total Guests"
        value="284"
        change={-3.1}
        icon={<Users className="text-blue-600" size={24} />}
      />
      <MetricCard
        title="Average Rating"
        value="4.8"
        change={2.4}
        icon={<Star className="text-blue-600" size={24} />}
      />
    </div>
  );
};