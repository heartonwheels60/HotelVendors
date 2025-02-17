import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { bookingService } from '../services/bookingService';
import { propertyService } from '../services/propertyService';
import { DynamicPriceCalculator } from '../components/bookings/DynamicPriceCalculator';
import type { BookingFormData, BookingStatus } from '../types/booking';
import type { Property } from '../types/property';
import type { DynamicPricing } from '../types/pricing';
import { format, isBefore, startOfDay, addDays } from 'date-fns';
import { useDynamicPricing } from '../contexts/DynamicPricingContext';

export const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { propertyId: initialPropertyId, roomType: initialRoomType, checkIn: initialCheckIn, checkOut: initialCheckOut } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedBoardType, setSelectedBoardType] = useState<'room-only' | 'breakfast-included' | 'half-board' | 'full-board'>('room-only');
  const { dynamicPricing, loadDynamicPricing, updateBasePrice } = useDynamicPricing();
  
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
    checkIn: initialCheckIn ? startOfDay(new Date(initialCheckIn)) : startOfDay(new Date()),
    checkOut: initialCheckOut ? startOfDay(new Date(initialCheckOut)) : startOfDay(addDays(new Date(), 1)),
    numberOfGuests: 1,
    totalAmount: 0,
    status: 'pending',
    notes: ''
  });

  // Handle base price change
  const handleBasePriceChange = useCallback(async (price: number) => {
    if (!selectedProperty || !formData.roomType) return;
    
    try {
      await updateBasePrice(selectedProperty.id, formData.roomType, price);
    } catch (err) {
      console.error('Error updating base price:', err);
      setError('Failed to update pricing');
    }
  }, [selectedProperty, formData.roomType, updateBasePrice]);

  // Handle room type selection
  const handleRoomTypeChange = useCallback(async (roomTypeName: string) => {
    if (!selectedProperty) return;

    const roomType = selectedProperty.roomTypes.find(rt => rt.name === roomTypeName);
    if (roomType) {
      setFormData(prev => ({
        ...prev,
        roomType: roomType.name
      }));

      try {
        await handleBasePriceChange(roomType.price);
      } catch (err) {
        console.error('Error updating base price:', err);
        setError('Failed to update pricing');
      }
    }
  }, [selectedProperty, handleBasePriceChange]);

  // Handle property selection
  const handlePropertyChange = useCallback(async (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setFormData(prev => ({
        ...prev,
        propertyId,
        propertyName: property.name,
        roomType: '',
        totalAmount: 0
      }));
      
      try {
        await loadDynamicPricing(propertyId);
      } catch (err) {
        console.error('Error loading dynamic pricing:', err);
        setError('Failed to load pricing information');
      }
    }
  }, [properties, loadDynamicPricing]);

  // Handle board type selection
  const handleBoardTypeChange = useCallback((boardType: 'room-only' | 'breakfast-included' | 'half-board' | 'full-board') => {
    setSelectedBoardType(boardType);
  }, []);

  // Load properties once
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await propertyService.getProperties();
        setProperties(data);
        
        // If we have initialPropertyId, set initial property and its dynamic pricing
        if (initialPropertyId) {
          const property = data.find(p => p.id === initialPropertyId);
          if (property) {
            setSelectedProperty(property);
            setFormData(prev => ({
              ...prev,
              propertyName: property.name
            }));
            // Load dynamic pricing for the property
            await loadDynamicPricing(initialPropertyId);
          }
        }
      } catch (err) {
        console.error('Error loading properties:', err);
        setError('Failed to load properties');
      }
    };

    loadProperties();
  }, []);

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
  }, [id, properties]);

  // Handle date changes
  const handleCheckInChange = (date: Date | null) => {
    if (!date) return;
    
    const checkInDate = startOfDay(date);
    let checkOutDate = formData.checkOut;
    
    // If check-out is before new check-in, set it to the next day
    if (isBefore(checkOutDate, checkInDate)) {
      checkOutDate = startOfDay(addDays(checkInDate, 1));
    }
    
    setFormData(prev => ({
      ...prev,
      checkIn: checkInDate,
      checkOut: checkOutDate
    }));
  };

  const handleCheckOutChange = (date: Date | null) => {
    if (!date) return;
    
    const checkOutDate = startOfDay(date);
    if (isBefore(checkOutDate, formData.checkIn)) {
      return; // Don't allow check-out before check-in
    }
    
    setFormData(prev => ({
      ...prev,
      checkOut: checkOutDate
    }));
  };

  // Memoize handlers to prevent unnecessary re-renders
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Booking' : 'New Booking'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Property</label>
          <select
            value={formData.propertyId}
            onChange={(e) => handlePropertyChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        {/* Room Type Selection */}
        {selectedProperty && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Type</label>
            <select
              value={formData.roomType}
              onChange={(e) => handleRoomTypeChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a room type</option>
              {selectedProperty.roomTypes.map((roomType) => (
                <option key={roomType.name} value={roomType.name}>
                  {roomType.name} - Base price: ${roomType.price}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Board Type Selection */}
        {selectedProperty && formData.roomType && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Board Type</label>
            <select
              value={selectedBoardType}
              onChange={(e) => handleBoardTypeChange(e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="room-only">Room Only</option>
              <option value="breakfast-included">Breakfast Included (+20%)</option>
              <option value="half-board">Half Board (+40%)</option>
              <option value="full-board">Full Board (+60%)</option>
            </select>
          </div>
        )}

        {/* Base Price Input */}
        {selectedProperty && formData.roomType && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Base Price (per night)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={dynamicPricing?.roomOnly.basePrice || 0}
                onChange={(e) => handleBasePriceChange(parseFloat(e.target.value))}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Dates Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
            <DatePicker
              selected={formData.checkIn}
              onChange={handleCheckInChange}
              selectsStart
              startDate={formData.checkIn}
              endDate={formData.checkOut}
              minDate={today}
              dateFormat="MM/dd/yyyy"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
            <DatePicker
              selected={formData.checkOut}
              onChange={handleCheckOutChange}
              selectsEnd
              startDate={formData.checkIn}
              endDate={formData.checkOut}
              minDate={addDays(formData.checkIn, 1)}
              dateFormat="MM/dd/yyyy"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Dynamic Price Calculator */}
        {dynamicPricing && formData.propertyId && formData.roomType && (
          <DynamicPriceCalculator
            checkIn={formData.checkIn}
            checkOut={formData.checkOut}
            dynamicPricing={dynamicPricing}
            selectedBoardType={selectedBoardType}
            onPriceCalculated={(totalPrice: number) => setFormData(prev => ({ ...prev, totalAmount: totalPrice }))}
            propertyId={formData.propertyId}
          />
        )}

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
