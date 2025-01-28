import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { propertyService } from '../services/propertyService';
import type { BookingFormData } from '../types/booking';
import type { Property } from '../types/property';
import { format, isBefore, startOfDay } from 'date-fns';

export const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { checkIn, checkOut } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Get today's date for validation
  const today = startOfDay(new Date());
  const todayStr = format(today, 'yyyy-MM-dd');

  const [formData, setFormData] = useState<BookingFormData>({
    propertyId: '',
    propertyName: '',
    roomType: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: isBefore(checkIn || today, today) ? today : (checkIn || today),
    checkOut: isBefore(checkOut || today, today) ? today : (checkOut || today),
    numberOfGuests: 1,
    totalAmount: 0,
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await propertyService.getProperties();
        setProperties(data);
      } catch (err) {
        console.error('Error loading properties:', err);
        setError('Failed to load properties');
      }
    };

    const loadBooking = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const booking = await bookingService.getBookingById(id);
        if (booking) {
          // Don't allow editing past bookings
          if (isBefore(booking.checkIn, today)) {
            setError('Cannot edit past bookings');
            return;
          }
          
          setFormData({
            propertyId: booking.propertyId,
            propertyName: booking.propertyName,
            roomType: booking.roomType,
            guestName: booking.guest.name,
            guestEmail: booking.guest.email,
            guestPhone: booking.guest.phone || '',
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            numberOfGuests: booking.numberOfGuests,
            totalAmount: booking.totalAmount,
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

    loadProperties();
    loadBooking();
  }, [id, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    if (isBefore(formData.checkIn, today)) {
      setError('Check-in date cannot be in the past');
      return;
    }
    
    if (isBefore(formData.checkOut, formData.checkIn)) {
      setError('Check-out date must be after check-in date');
      return;
    }
    
    try {
      setIsLoading(true);
      if (id) {
        await bookingService.updateBooking(id, formData);
      } else {
        await bookingService.createBooking(formData);
      }
      navigate('/bookings');
    } catch (err) {
      console.error('Error saving booking:', err);
      setError('Failed to save booking');
      setIsLoading(false);
    }
  };

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setFormData(prev => ({
        ...prev,
        propertyId: property.id,
        propertyName: property.name,
        roomType: property.roomTypes[0]?.name || '',
        totalAmount: property.roomTypes[0]?.price || 0
      }));
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
            onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
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
                min={todayStr}
                value={format(formData.checkIn, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newCheckIn = new Date(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    checkIn: newCheckIn,
                    // If check-out is before new check-in, update it
                    checkOut: isBefore(prev.checkOut, newCheckIn) ? newCheckIn : prev.checkOut
                  }));
                }}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
              <input
                type="date"
                min={format(formData.checkIn, 'yyyy-MM-dd')}
                value={format(formData.checkOut, 'yyyy-MM-dd')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  checkOut: new Date(e.target.value)
                }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) }))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) }))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BookingFormData['status'] }))}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
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

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : id ? 'Update Booking' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};
