import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { propertyService } from '../services/propertyService';
import type { BookingFormData, BookingStatus } from '../types/booking';
import type { Property } from '../types/property';
import { format, isBefore, startOfDay } from 'date-fns';

export const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { propertyId: initialPropertyId, roomType: initialRoomType, checkIn: initialCheckIn, checkOut: initialCheckOut } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Get today's date for validation
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);

  const [formData, setFormData] = useState<BookingFormData>({
    propertyId: initialPropertyId || '',
    propertyName: '',
    roomType: initialRoomType || '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: initialCheckIn ? new Date(initialCheckIn) : today,
    checkOut: initialCheckOut ? new Date(initialCheckOut) : today,
    numberOfGuests: 1,
    totalAmount: 0,
    status: 'pending',
    notes: ''
  });

  // Load properties once
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await propertyService.getProperties();
        setProperties(data);
        
        // If we have initialPropertyId, set initial property name and room type
        if (initialPropertyId) {
          const property = data.find(p => p.id === initialPropertyId);
          if (property) {
            setFormData(prev => ({
              ...prev,
              propertyName: property.name,
              totalAmount: property.roomTypes.find(rt => rt.name === initialRoomType)?.price || 0
            }));
          }
        }
      } catch (err) {
        console.error('Error loading properties:', err);
        setError('Failed to load properties');
      }
    };

    loadProperties();
  }, []); // Empty dependency array as this should only run once

  // Load booking data when id changes
  useEffect(() => {
    const loadBooking = async () => {
      if (!id || !properties.length) return;
      
      try {
        setIsLoading(true);
        const booking = await bookingService.getBookingById(id);
        if (booking) {
          // Don't allow editing past bookings
          if (isBefore(booking.checkIn, today)) {
            setError('Cannot edit past bookings');
            setIsLoading(false);
            return;
          }
          
          // Find the property to get the current price
          const property = properties.find(p => p.id === booking.propertyId);
          const currentPrice = property?.roomTypes.find(rt => rt.name === booking.roomType)?.price || booking.totalAmount;

          setFormData({
            propertyId: booking.propertyId,
            propertyName: booking.propertyName,
            roomType: booking.roomType,
            guestName: booking.guest.name,
            guestEmail: booking.guest.email,
            guestPhone: booking.guest.phone || '',
            checkIn: new Date(booking.checkIn),
            checkOut: new Date(booking.checkOut),
            numberOfGuests: booking.numberOfGuests,
            totalAmount: currentPrice,
            status: booking.status,
            notes: booking.notes || ''
          });
        }
      } catch (err) {
        console.error('Error loading booking:', err);
        setError('Failed to load booking');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [id, properties]); // Only depend on id and properties

  // Memoize handlers to prevent unnecessary re-renders
  const handlePropertyChange = useCallback((propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      const firstRoomType = property.roomTypes[0];
      setFormData(prev => ({
        ...prev,
        propertyId: property.id,
        propertyName: property.name,
        roomType: firstRoomType?.name || '',
        totalAmount: firstRoomType?.price || 0
      }));
    }
  }, [properties]);

  const handleRoomTypeChange = useCallback((roomTypeName: string) => {
    const property = properties.find(p => p.id === formData.propertyId);
    const roomType = property?.roomTypes.find(rt => rt.name === roomTypeName);
    if (roomType) {
      setFormData(prev => ({
        ...prev,
        roomType: roomType.name,
        totalAmount: roomType.price
      }));
    }
  }, [properties, formData.propertyId]);

  const handleDateChange = useCallback((field: 'checkIn' | 'checkOut', value: string) => {
    const date = new Date(value);
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      // Validate dates
      const checkInDate = startOfDay(new Date(formData.checkIn));
      const checkOutDate = startOfDay(new Date(formData.checkOut));
      const todayDate = startOfDay(new Date());

      if (isBefore(checkInDate, todayDate)) {
        setError('Check-in date cannot be in the past');
        return;
      }
      
      if (isBefore(checkOutDate, checkInDate)) {
        setError('Check-out date must be after check-in date');
        return;
      }

      const submissionData = {
        ...formData,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guest: {
          name: formData.guestName,
          email: formData.guestEmail,
          phone: formData.guestPhone
        }
      };

      if (id) {
        await bookingService.updateBooking(id, submissionData);
      } else {
        await bookingService.createBooking(submissionData);
      }
      navigate('/bookings');
    } catch (err: any) {
      console.error('Error saving booking:', err);
      if (err.message === 'Rooms Filled') {
        setError('Selected room type is not available for these dates');
      } else {
        setError('Failed to save booking');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (newStatus: BookingStatus) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      await bookingService.updateBooking(id, { status: newStatus });
      navigate('/bookings');
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {id ? 'Edit Booking' : 'New Booking'}
      </h1>

      {error && (
        <div className="mb-4 bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Property</label>
          <select
            value={formData.propertyId}
            onChange={(e) => handlePropertyChange(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a property</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        {/* Room Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Room Type</label>
          <select
            value={formData.roomType}
            onChange={(e) => handleRoomTypeChange(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a room type</option>
            {properties
              .find(p => p.id === formData.propertyId)
              ?.roomTypes.map(roomType => (
                <option key={roomType.name} value={roomType.name}>
                  {roomType.name} - ${roomType.price}
                </option>
              ))}
          </select>
        </div>

        {/* Guest Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Guest Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.guestEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Booking Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
              <input
                type="date"
                value={format(formData.checkIn, 'yyyy-MM-dd')}
                min={todayStr}
                onChange={(e) => handleDateChange('checkIn', e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
              <input
                type="date"
                value={format(formData.checkOut, 'yyyy-MM-dd')}
                min={format(formData.checkIn, 'yyyy-MM-dd')}
                onChange={(e) => handleDateChange('checkOut', e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
            <input
              type="number"
              min="1"
              value={formData.numberOfGuests}
              onChange={(e) => setFormData(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) || 1 }))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status Buttons for Confirmed Bookings */}
        {id && formData.status === 'confirmed' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Booking Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => updateBookingStatus('checkedIn')}
                className="px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
              >
                Check In
              </button>
              <button
                type="button"
                onClick={() => updateBookingStatus('noShow')}
                className="px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-white hover:bg-yellow-50"
              >
                Mark as No-Show
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this booking?')) {
                    updateBookingStatus('cancelled');
                  }
                }}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Saving...' : id ? 'Update Booking' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};
