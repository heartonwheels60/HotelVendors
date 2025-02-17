import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { doc, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, parseISO, startOfDay } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';

interface PriceCalendarProps {
  roomId: string;
  basePrice: number;
  weekendMultiplier: number;
  seasonalPricing: any[];
  onPriceUpdate: () => void;
}

interface DailyPrice {
  date: string;
  price: number;
  type: 'custom' | 'weekend' | 'seasonal' | 'base';
}

const PriceCalendar: React.FC<PriceCalendarProps> = ({
  roomId,
  basePrice,
  weekendMultiplier,
  seasonalPricing,
  onPriceUpdate
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(basePrice);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const getDailyPrices = async () => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        throw new Error('Room not found');
      }
      
      return roomDoc.data()?.dailyPrices || {};
    } catch (error) {
      console.error('Error fetching daily prices:', error);
      throw error;
    }
  };

  const getEventColor = (priceType: string) => {
    switch (priceType) {
      case 'custom':
        return '#4F46E5';
      case 'weekend':
        return '#059669';
      case 'seasonal':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dailyPrices = await getDailyPrices();
      const events = [];

      // Get the current date and the end of next month
      const now = startOfDay(new Date());
      const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      // Generate events for each day
      for (let date = new Date(now); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        if (dailyPrices[dateStr]) {
          events.push({
            title: `$${dailyPrices[dateStr].price}`,
            date: dateStr,
            backgroundColor: getEventColor('custom'),
            extendedProps: { type: 'custom', price: dailyPrices[dateStr].price }
          });
        } else if (isWeekend) {
          const weekendPrice = Math.round(basePrice * weekendMultiplier);
          events.push({
            title: `$${weekendPrice}`,
            date: dateStr,
            backgroundColor: getEventColor('weekend'),
            extendedProps: { type: 'weekend', price: weekendPrice }
          });
        } else {
          events.push({
            title: `$${basePrice}`,
            date: dateStr,
            backgroundColor: getEventColor('base'),
            extendedProps: { type: 'base', price: basePrice }
          });
        }
      }

      setCalendarEvents(events);
      setError(null);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load calendar events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      loadEvents();
    }
  }, [roomId, basePrice, weekendMultiplier]);

  const handleDateClick = async (info: { dateStr: string }) => {
    setError(null);
    
    try {
      // Ensure the date is in the correct format
      const clickedDate = format(parseISO(info.dateStr), 'yyyy-MM-dd');
      
      // Don't allow selecting dates in the past
      if (new Date(clickedDate) < startOfDay(new Date())) {
        setError('Cannot modify prices for past dates');
        return;
      }
      
      setSelectedDate(clickedDate);
      const dailyPrices = await getDailyPrices();
      const currentPrice = dailyPrices[clickedDate]?.price || basePrice;
      setCustomPrice(currentPrice);
      setShowPriceModal(true);
    } catch (error) {
      console.error('Error handling date click:', error);
      setError('Failed to get price information. Please try again.');
    }
  };

  const handlePriceSubmit = async () => {
    if (!selectedDate) return;
    if (customPrice < 0) {
      setError('Price cannot be negative');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        [`dailyPrices.${selectedDate}`]: {
          price: customPrice,
          type: 'custom'
        }
      });

      setShowPriceModal(false);
      setSelectedDate(null);
      await loadEvents();
      onPriceUpdate();
    } catch (error) {
      console.error('Error updating price:', error);
      setError('Failed to update price. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePrice = async () => {
    if (!selectedDate) return;

    setUpdating(true);
    setError(null);

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        [`dailyPrices.${selectedDate}`]: deleteField()
      });

      setShowPriceModal(false);
      setSelectedDate(null);
      await loadEvents();
      onPriceUpdate();
    } catch (error) {
      console.error('Error deleting price:', error);
      setError('Failed to delete custom price. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={calendarEvents}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
      />

      {/* Price Modal */}
      {showPriceModal && selectedDate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Set Price for {format(parseISO(selectedDate), 'MMMM d, yyyy')}
              </h3>
              <p className="text-sm text-gray-500">
                Set a custom price for this date. Leave empty to use the default price.
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Price per Night
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">$</span>
                </div>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="block w-full pl-10 pr-4 py-4 text-xl border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter price"
                  min="0"
                />
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-gray-500">Base price: ${basePrice}</span>
                {basePrice !== customPrice && (
                  <span className="text-sm text-indigo-600">
                    {customPrice > basePrice 
                      ? `(+${((customPrice - basePrice) / basePrice * 100).toFixed(0)}%)`
                      : `(-${((basePrice - customPrice) / basePrice * 100).toFixed(0)}%)`
                    }
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handlePriceSubmit}
                disabled={updating}
                className="w-full inline-flex justify-center items-center px-6 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Price'}
              </button>
              <button
                onClick={handleDeletePrice}
                disabled={updating}
                className="w-full inline-flex justify-center items-center px-6 py-4 border border-red-300 text-lg font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                {updating ? 'Deleting...' : 'Delete Custom Price'}
              </button>
              <button
                onClick={() => {
                  setShowPriceModal(false);
                  setSelectedDate(null);
                  setError(null);
                }}
                disabled={updating}
                className="w-full inline-flex justify-center items-center px-6 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalendar;
