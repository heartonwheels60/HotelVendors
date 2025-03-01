import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, parseISO, startOfDay, isWithinInterval } from 'date-fns';

interface PriceCalendarProps {
  roomId: string;
  basePrice: number;
  weekendMultiplier: number;
  seasonalPricing: Array<{
    startDate: string;
    endDate: string;
    multiplier: number;
    description: string;
  }>;
  onPriceUpdate: () => void;
}

interface DailyPrice {
  date: string;
  price: number;
  type: 'custom' | 'weekend' | 'seasonal' | 'base';
  description?: string;
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

  const [propertyId, roomTypeName] = roomId.split('_');

  const getDailyPrices = async () => {
    try {
      const propertyRef = doc(db, 'properties', propertyId);
      const propertyDoc = await getDoc(propertyRef);
      
      if (!propertyDoc.exists()) {
        throw new Error('Property not found');
      }
      
      const property = propertyDoc.data();
      const roomType = property.roomTypes.find((rt: any) => rt.name === roomTypeName);
      
      return roomType?.dailyPrices || {};
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

  const getSeasonalPrice = (date: Date): { price: number; description: string } | null => {
    for (const season of seasonalPricing) {
      const startDate = parseISO(season.startDate);
      const endDate = parseISO(season.endDate);
      
      if (isWithinInterval(date, { start: startDate, end: endDate })) {
        return {
          price: basePrice * season.multiplier,
          description: season.description
        };
      }
    }
    return null;
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
        const currentDate = startOfDay(new Date());
        
        if (dailyPrices[dateStr]) {
          // Custom price takes precedence
          events.push({
            title: `$${dailyPrices[dateStr].price}`,
            date: dateStr,
            backgroundColor: getEventColor('custom'),
            extendedProps: { 
              type: 'custom', 
              price: dailyPrices[dateStr].price,
              description: 'Custom Price'
            }
          });
        } else {
          // Check for seasonal pricing
          const seasonalPrice = getSeasonalPrice(date);
          if (seasonalPrice) {
            events.push({
              title: `$${seasonalPrice.price}`,
              date: dateStr,
              backgroundColor: getEventColor('seasonal'),
              extendedProps: { 
                type: 'seasonal', 
                price: seasonalPrice.price,
                description: seasonalPrice.description
              }
            });
          } else if (isWeekend && date >= currentDate) {
            // Weekend pricing if no seasonal price and date is not in the past
            const weekendPrice = Math.round(basePrice * weekendMultiplier);
            events.push({
              title: `$${weekendPrice}`,
              date: dateStr,
              backgroundColor: getEventColor('weekend'),
              extendedProps: { 
                type: 'weekend', 
                price: weekendPrice,
                description: 'Weekend Price'
              }
            });
          } else {
            // Base price if no other rules apply
            events.push({
              title: `$${basePrice}`,
              date: dateStr,
              backgroundColor: getEventColor('base'),
              extendedProps: { 
                type: 'base', 
                price: basePrice,
                description: 'Base Price'
              }
            });
          }
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
    loadEvents();
  }, [roomId, basePrice, weekendMultiplier, seasonalPricing]);

  const handleDateClick = (arg: any) => {
    setError(null);
    
    try {
      setSelectedDate(arg.dateStr);
      setCustomPrice(arg.event?.extendedProps?.price || basePrice);
      setShowPriceModal(true);
    } catch (error) {
      console.error('Error handling date click:', error);
      setError('Failed to get price information. Please try again.');
    }
  };

  const handlePriceUpdate = async () => {
    if (!selectedDate) return;
    if (customPrice < 0) {
      setError('Price cannot be negative');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const propertyRef = doc(db, 'properties', propertyId);
      const propertyDoc = await getDoc(propertyRef);
      
      if (!propertyDoc.exists()) {
        throw new Error('Property not found');
      }
      
      const property = propertyDoc.data();
      const roomTypeIndex = property.roomTypes.findIndex((rt: any) => rt.name === roomTypeName);
      
      if (roomTypeIndex === -1) {
        throw new Error('Room type not found');
      }
      
      const updatedRoomTypes = [...property.roomTypes];
      
      // Get the current daily prices or initialize an empty object
      const dailyPrices = updatedRoomTypes[roomTypeIndex].dailyPrices || {};
      
      // Check if this date has seasonal pricing
      const date = new Date(selectedDate);
      const seasonalPrice = getSeasonalPrice(date);
      
      // Update the daily prices
      updatedRoomTypes[roomTypeIndex] = {
        ...updatedRoomTypes[roomTypeIndex],
        dailyPrices: {
          ...dailyPrices,
          [selectedDate]: {
            price: customPrice,
            type: seasonalPrice ? 'seasonal' : 'custom'
          }
        }
      };

      await updateDoc(propertyRef, {
        roomTypes: updatedRoomTypes
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
      const propertyRef = doc(db, 'properties', propertyId);
      const propertyDoc = await getDoc(propertyRef);
      
      if (!propertyDoc.exists()) {
        throw new Error('Property not found');
      }
      
      const property = propertyDoc.data();
      const roomTypeIndex = property.roomTypes.findIndex((rt: any) => rt.name === roomTypeName);
      
      if (roomTypeIndex === -1) {
        throw new Error('Room type not found');
      }
      
      const updatedRoomTypes = [...property.roomTypes];
      updatedRoomTypes[roomTypeIndex] = {
        ...updatedRoomTypes[roomTypeIndex],
        dailyPrices: {
          ...(updatedRoomTypes[roomTypeIndex].dailyPrices || {}),
          [selectedDate]: deleteField()
        }
      };

      await updateDoc(propertyRef, {
        roomTypes: updatedRoomTypes
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
        events={calendarEvents}
        eventClick={handleDateClick}
        eventContent={(arg) => {
          return (
            <div className="text-xs p-1">
              <div>{arg.event.title}</div>
              <div className="text-xs opacity-75">{arg.event.extendedProps.description}</div>
            </div>
          );
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
      />

      {/* Price Update Modal */}
      {showPriceModal && selectedDate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Update Price for {new Date(selectedDate).toLocaleDateString()}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">$</span>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPriceModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePriceUpdate}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                {updating ? 'Saving...' : 'Update Price'}
              </button>
              <button
                onClick={handleDeletePrice}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
              >
                {updating ? 'Deleting...' : 'Delete Custom Price'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalendar;
