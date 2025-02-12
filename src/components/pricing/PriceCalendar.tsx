import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

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

export const PriceCalendar: React.FC<PriceCalendarProps> = ({
  roomId,
  basePrice,
  weekendMultiplier,
  seasonalPricing,
  onPriceUpdate
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(basePrice);
  const [showPriceModal, setShowPriceModal] = useState(false);

  const getDailyPrices = async () => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);
      const dailyPrices = roomDoc.data()?.dailyPrices || {};
      return dailyPrices;
    } catch (error) {
      console.error('Error fetching daily prices:', error);
      return {};
    }
  };

  const getEventColor = (priceType: string) => {
    switch (priceType) {
      case 'custom':
        return '#4F46E5'; // indigo
      case 'weekend':
        return '#059669'; // emerald
      case 'seasonal':
        return '#DC2626'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const handleDateClick = async (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr);
    const dailyPrices = await getDailyPrices();
    const currentPrice = dailyPrices[info.dateStr]?.price || basePrice;
    setCustomPrice(currentPrice);
    setShowPriceModal(true);
  };

  const handlePriceSubmit = async () => {
    if (!selectedDate) return;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      const dailyPrices = await getDailyPrices();

      await updateDoc(roomRef, {
        [`dailyPrices.${selectedDate}`]: {
          price: customPrice,
          type: 'custom'
        }
      });

      setShowPriceModal(false);
      setSelectedDate(null);
      onPriceUpdate();
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const getEvents = async () => {
    const dailyPrices = await getDailyPrices();
    const events = [];

    // Add all daily prices
    for (const [date, data] of Object.entries(dailyPrices)) {
      events.push({
        title: `$${data.price}`,
        date,
        backgroundColor: getEventColor(data.type),
        extendedProps: { type: data.type }
      });
    }

    return events;
  };

  return (
    <div className="relative">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={getEvents}
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
                Set Price for {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
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
                className="w-full inline-flex justify-center items-center px-6 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Save Price
              </button>
              <button
                onClick={() => {
                  setCustomPrice(basePrice);
                  setShowPriceModal(false);
                }}
                className="w-full inline-flex justify-center items-center px-6 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Quick Price Options */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Price Options</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCustomPrice(basePrice * 1.1)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  +10%
                </button>
                <button
                  onClick={() => setCustomPrice(basePrice * 1.2)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  +20%
                </button>
                <button
                  onClick={() => setCustomPrice(basePrice * 1.5)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  +50%
                </button>
                <button
                  onClick={() => setCustomPrice(basePrice * 0.9)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  -10%
                </button>
                <button
                  onClick={() => setCustomPrice(basePrice * 0.8)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  -20%
                </button>
                <button
                  onClick={() => setCustomPrice(basePrice)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-500 mr-1"></div>
            <span className="text-sm text-gray-600">Base Price</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-600 mr-1"></div>
            <span className="text-sm text-gray-600">Weekend Price</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-600 mr-1"></div>
            <span className="text-sm text-gray-600">Seasonal Price</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-600 mr-1"></div>
            <span className="text-sm text-gray-600">Custom Price</span>
          </div>
        </div>
      </div>
    </div>
  );
};
