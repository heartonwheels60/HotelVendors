import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface BookingData {
  id: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  totalAmount: number;
  status: string;
  guest: {
    name: string;
    email: string;
  };
}

interface RevenueByDay {
  date: string;
  revenue: number;
  bookings: number;
}

interface RoomTypeStats {
  name: string;
  bookings: number;
  revenue: number;
  occupancyRate: number;
}

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<RevenueByDay[]>([]);
  const [roomTypeStats, setRoomTypeStats] = useState<RoomTypeStats[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [averageOccupancy, setAverageOccupancy] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('ownerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedBookings: BookingData[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            checkIn: data.checkIn.toDate(),
            checkOut: data.checkOut.toDate(),
            roomType: data.roomType,
            totalAmount: data.totalAmount,
            status: data.status,
            guest: data.guest
          };
        });

        setBookings(fetchedBookings);
        processBookingData(fetchedBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const processBookingData = (bookingData: BookingData[]) => {
    // Calculate date range
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    // Initialize daily data
    const dailyData = eachDayOfInterval({ start, end }).map(date => ({
      date: format(date, 'yyyy-MM-dd'),
      revenue: 0,
      bookings: 0
    }));

    // Process bookings
    let totalRev = 0;
    const roomTypes: { [key: string]: RoomTypeStats } = {};

    bookingData.forEach(booking => {
      // Add to total revenue
      totalRev += booking.totalAmount;

      // Add to room type stats
      if (!roomTypes[booking.roomType]) {
        roomTypes[booking.roomType] = {
          name: booking.roomType,
          bookings: 0,
          revenue: 0,
          occupancyRate: 0
        };
      }
      roomTypes[booking.roomType].bookings++;
      roomTypes[booking.roomType].revenue += booking.totalAmount;

      // Add to daily data
      const bookingDate = format(booking.checkIn, 'yyyy-MM-dd');
      const dayData = dailyData.find(day => day.date === bookingDate);
      if (dayData) {
        dayData.revenue += booking.totalAmount;
        dayData.bookings++;
      }
    });

    // Calculate occupancy rates
    Object.values(roomTypes).forEach(stats => {
      stats.occupancyRate = (stats.bookings / dailyData.length) * 100;
    });

    setRevenueData(dailyData);
    setRoomTypeStats(Object.values(roomTypes));
    setTotalRevenue(totalRev);
    setTotalBookings(bookingData.length);
    setAverageOccupancy(
      Object.values(roomTypes).reduce((acc, curr) => acc + curr.occupancyRate, 0) / 
      Object.values(roomTypes).length || 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
          <p className="mt-1 text-sm text-gray-500">This month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{totalBookings}</p>
          <p className="mt-1 text-sm text-gray-500">This month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Average Occupancy</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">{averageOccupancy.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-gray-500">This month</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM d')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                formatter={(value: any) => ['$' + value.toFixed(2), 'Revenue']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                name="Daily Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Type Performance */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Room Type Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roomTypeStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
              <Tooltip />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="revenue" 
                name="Revenue" 
                fill="#3B82F6" 
              />
              <Bar 
                yAxisId="right" 
                dataKey="occupancyRate" 
                name="Occupancy Rate (%)" 
                fill="#10B981" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detailed Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roomTypeStats.map((stats, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stats.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${stats.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.occupancyRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export { ReportsPage };
