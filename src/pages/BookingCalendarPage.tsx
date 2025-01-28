import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types/booking';
import { useNavigate } from 'react-router-dom';

const BookingDetails: React.FC<{ booking: Booking }> = ({ booking }) => (
  <div className="p-3 bg-white rounded-lg shadow-sm mb-2 border-l-4 border-blue-500">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium text-gray-900">{booking.propertyName}</h4>
        <p className="text-sm text-gray-600">{booking.roomType}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {booking.status}
      </span>
    </div>
    <div className="mt-2">
      <p className="text-sm text-gray-600">
        <span className="font-medium">Guest:</span> {booking.guest.name}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-medium">Contact:</span> {booking.guest.email}
        {booking.guest.phone && ` | ${booking.guest.phone}`}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-medium">Duration:</span> {format(booking.checkIn, 'MMM d')} - {format(booking.checkOut, 'MMM d')}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-medium">Guests:</span> {booking.numberOfGuests}
      </p>
      <p className="text-sm font-medium text-gray-900">
        <span className="font-medium">Amount:</span> ${booking.totalAmount.toFixed(2)}
      </p>
    </div>
  </div>
);

export const BookingCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get today's date at the start of the day for comparison
  const today = startOfDay(new Date());

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const data = await bookingService.getBookings();
        
        // Filter bookings for the current month
        const monthBookings = data.filter(booking => 
          isWithinInterval(booking.checkIn, { start: monthStart, end: monthEnd }) ||
          isWithinInterval(booking.checkOut, { start: monthStart, end: monthEnd })
        );
        
        setBookings(monthBookings);
        setError(null);
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [currentDate]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isWithinInterval(date, {
        start: booking.checkIn,
        end: booking.checkOut
      })
    );
  };

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Booking Calendar</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center font-medium text-gray-600 pb-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {daysInMonth.map(date => {
          const dayBookings = getBookingsForDate(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isPastDate = isBefore(date, today);
          
          return (
            <div
              key={date.toISOString()}
              className={`border rounded-lg p-2 min-h-[100px] ${
                isPastDate ? 'bg-gray-50 cursor-not-allowed' :
                isSelected ? 'border-blue-500 ring-2 ring-blue-200 cursor-pointer' : 
                'border-gray-200 cursor-pointer hover:border-blue-200'
              }`}
              onClick={() => !isPastDate && setSelectedDate(date)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`font-medium ${isPastDate ? 'text-gray-400' : 'text-gray-900'}`}>
                  {format(date, 'd')}
                </span>
                {dayBookings.length > 0 && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isPastDate ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {dayBookings.length}
                  </span>
                )}
              </div>
              {!isPastDate && dayBookings.slice(0, 2).map(booking => (
                <div
                  key={booking.id}
                  className="text-xs p-1 mb-1 rounded bg-blue-50 text-blue-700 truncate"
                >
                  {booking.guest.name}
                </div>
              ))}
              {!isPastDate && dayBookings.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{dayBookings.length - 2} more
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Bookings for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <button
              onClick={() => navigate('/bookings/new', { 
                state: { 
                  checkIn: selectedDate,
                  checkOut: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) // next day
                }
              })}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Booking
            </button>
          </div>
          <div className="space-y-4">
            {getBookingsForDate(selectedDate).map(booking => (
              <BookingDetails key={booking.id} booking={booking} />
            ))}
            {getBookingsForDate(selectedDate).length === 0 && (
              <p className="text-gray-500">No bookings for this date.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
