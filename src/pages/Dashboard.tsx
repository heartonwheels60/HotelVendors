import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hotel,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Star,
  Clock,
  ChevronRight
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { propertyService } from '../services/propertyService';
import { staffService } from '../services/staffService';
import { reviewService } from '../services/reviewService';
import type { Booking } from '../types/booking';
import type { Property } from '../types/property';
import type { Staff } from '../types/staff';
import type { Review } from '../types/review';
import { format, isToday, isTomorrow, addDays, isBefore, isAfter } from 'date-fns';

// Stat card component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
}> = ({ title, value, icon, trend }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className={`h-4 w-4 mr-1 ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={trend.value >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

// Upcoming booking card
const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <Calendar className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{booking.propertyName}</p>
          <p className="text-sm text-gray-600">
            {booking.guest.name} · {booking.numberOfGuests} guests
          </p>
          <p className="text-sm text-gray-500">
            {getDateLabel(booking.checkIn)} - {getDateLabel(booking.checkOut)}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>
    </div>
  );
};

// Recent review card
const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="bg-white rounded-lg shadow-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
        <span className="font-medium text-gray-900">{review.rating.toFixed(1)}</span>
      </div>
      <span className="text-sm text-gray-500">{format(review.createdAt, 'MMM d')}</span>
    </div>
    <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
    <p className="mt-2 text-sm font-medium text-gray-900">{review.propertyName}</p>
    <p className="text-sm text-gray-500">by {review.guestName}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeProperties: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    activeStaff: 0
  });
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [staffOnDuty, setStaffOnDuty] = useState<Staff[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Load all necessary data
        const [bookings, properties, staff, reviews] = await Promise.all([
          bookingService.getBookings(),
          propertyService.getProperties(),
          staffService.getStaffMembers(),
          reviewService.getReviews()
        ]);

        // Calculate stats
        const now = new Date();
        const thirtyDaysAgo = addDays(now, -30);
        const activeBookings = bookings.filter(b => 
          isAfter(b.checkOut, now) && b.status !== 'cancelled'
        );
        const lastMonthBookings = bookings.filter(b => 
          isAfter(b.createdAt, thirtyDaysAgo)
        );
        const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const activeStaffCount = staff.filter(s => s.status === 'active').length;

        // Calculate occupancy rate
        const totalRoomDays = properties.reduce((sum, p) => sum + 30, 0); // 30 days for each property
        const bookedDays = bookings.reduce((sum, b) => {
          const days = Math.ceil((b.checkOut.getTime() - b.checkIn.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        const occupancyRate = (bookedDays / totalRoomDays) * 100;

        setStats({
          totalBookings: lastMonthBookings.length,
          activeProperties: properties.length,
          totalRevenue,
          occupancyRate,
          activeStaff: activeStaffCount
        });

        // Get upcoming bookings
        const upcoming = activeBookings
          .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())
          .slice(0, 5);
        setUpcomingBookings(upcoming);

        // Get recent reviews
        const recent = reviews
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 3);
        setRecentReviews(recent);

        // Get staff on duty today
        const today = format(now, 'EEEE').toLowerCase();
        const onDuty = staff.filter(s => {
          const schedule = s.schedule?.[today];
          return schedule?.start && schedule?.end && s.status === 'active';
        });
        setStaffOnDuty(onDuty);

        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your properties, bookings, and staff
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Monthly Bookings"
          value={stats.totalBookings}
          icon={<Calendar className="h-6 w-6 text-blue-600" />}
          trend={{ value: 12, label: 'vs last month' }}
        />
        <StatCard
          title="Active Properties"
          value={stats.activeProperties}
          icon={<Hotel className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          trend={{ value: 8, label: 'vs last month' }}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${Math.round(stats.occupancyRate)}%`}
          icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Bookings</h2>
              <button
                onClick={() => navigate('/bookings')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {upcomingBookings.length === 0 && (
                <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
              )}
            </div>
          </div>
        </div>

        {/* Side Content */}
        <div className="space-y-6">
          {/* Staff on Duty */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Staff on Duty</h2>
            <div className="space-y-4">
              {staffOnDuty.map(staff => (
                <div key={staff.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {staff.firstName} {staff.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {staff.schedule?.[format(new Date(), 'EEEE').toLowerCase()]?.start} - 
                      {staff.schedule?.[format(new Date(), 'EEEE').toLowerCase()]?.end}
                    </p>
                  </div>
                </div>
              ))}
              {staffOnDuty.length === 0 && (
                <p className="text-gray-500 text-center">No staff scheduled for today</p>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Reviews</h2>
              <button
                onClick={() => navigate('/reviews')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {recentReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {recentReviews.length === 0 && (
                <p className="text-gray-500 text-center">No recent reviews</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
