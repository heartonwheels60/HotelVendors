import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle, Calendar, Clock, User, DollarSign, MessageSquare } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types/booking';
import { format } from 'date-fns';

// Status badge component
const StatusBadge: React.FC<{ status: Booking['status'] }> = ({ status }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Booking card component
const BookingCard: React.FC<{
  booking: Booking;
  onEdit: () => void;
  onDelete: () => void;
}> = React.memo(({ booking, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{booking.propertyName}</h3>
        <p className="text-sm text-gray-600">{booking.roomType}</p>
      </div>
      <StatusBadge status={booking.status} />
    </div>

    <div className="space-y-3">
      {/* Guest Info */}
      <div className="flex items-center text-gray-600">
        <User className="h-4 w-4 mr-2" />
        <div>
          <p className="text-sm font-medium">{booking.guest.name}</p>
          <p className="text-xs">{booking.guest.email}</p>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center text-gray-600">
        <Calendar className="h-4 w-4 mr-2" />
        <div>
          <p className="text-sm">
            {format(booking.checkIn, 'MMM d, yyyy')} - {format(booking.checkOut, 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Duration & Guests */}
      <div className="flex items-center text-gray-600">
        <Clock className="h-4 w-4 mr-2" />
        <p className="text-sm">
          {Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights,{' '}
          {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
        </p>
      </div>

      {/* Total Amount */}
      <div className="flex items-center text-gray-600">
        <DollarSign className="h-4 w-4 mr-2" />
        <p className="text-sm font-medium">${booking.totalAmount.toFixed(2)}</p>
      </div>
    </div>

    {/* Actions */}
    <div className="mt-4 flex justify-end space-x-2">
      {booking.status === 'completed' && (
        <button
          onClick={() => navigate(`/reviews/new/${booking.id}`)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={onEdit}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
));

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await bookingService.deleteBooking(id);
      await loadBookings(); // Reload the list
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking');
    }
  }, [loadBookings]);

  const handleEdit = useCallback((booking: Booking) => {
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    
    navigate(`/bookings/edit/${booking.id}`, {
      state: {
        propertyId: booking.propertyId,
        roomType: booking.roomType,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString()
      }
    });
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
          <button
            onClick={() => navigate('/bookings/calendar')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Calendar View
          </button>
        </div>
        <button
          onClick={() => navigate('/bookings/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Booking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map(booking => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onEdit={() => handleEdit(booking)}
            onDelete={() => handleDelete(booking.id)}
          />
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No bookings found. Create your first booking!</p>
        </div>
      )}
    </div>
  );
};
