import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Property, RoomType } from '../types/property';
import PriceCalendar from '../components/pricing/PriceCalendar';

interface SeasonalPricing {
  startDate: string;
  endDate: string;
  multiplier: number;
  description: string;
}

interface RoomTypeWithPricing extends RoomType {
  seasonalPricing?: SeasonalPricing[];
  weekendMultiplier?: number;
  priceHistory?: PriceHistory[];
}

interface PriceHistory {
  startDate: string;
  endDate: string;
  price: number;
  type: 'weekend' | 'seasonal';
  description: string;
}

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedRoomTypeIndex, setSelectedRoomTypeIndex] = useState<number>(0);
  const [calendarKey, setCalendarKey] = useState(0);
  const [tempWeekendMultiplier, setTempWeekendMultiplier] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [newSeasonalPricing, setNewSeasonalPricing] = useState<SeasonalPricing>({
    startDate: '',
    endDate: '',
    multiplier: 1,
    description: ''
  });
  const [activeTab, setActiveTab] = useState<'calendar' | 'rules'>('calendar');
  const [showAllHistory, setShowAllHistory] = useState(false);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const selectedRoomType = selectedProperty?.roomTypes[selectedRoomTypeIndex];

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;
      
      try {
        const propertiesRef = collection(db, 'properties');
        const q = query(propertiesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const propertiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[];
        setProperties(propertiesData);
        
        // Set initial selection if available
        if (propertiesData.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(propertiesData[0].id);
          setSelectedRoomTypeIndex(0);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again.');
      }
    };

    fetchProperties();
  }, [user]);

  useEffect(() => {
    if (selectedRoomType) {
      setTempWeekendMultiplier(selectedRoomType.weekendMultiplier || 1);
    }
  }, [selectedRoomType]);

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    setSelectedPropertyId(propertyId);
    if (property && property.roomTypes.length > 0) {
      setSelectedRoomTypeIndex(0);
    }
  };

  const handleRoomTypeChange = (index: number) => {
    if (selectedProperty && index >= 0 && index < selectedProperty.roomTypes.length) {
      setSelectedRoomTypeIndex(index);
      // Reset the temp multiplier to the selected room type's value
      const roomType = selectedProperty.roomTypes[index];
      setTempWeekendMultiplier(roomType.weekendMultiplier || 1);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handlePriceChange = async (propertyId: string, roomTypeIndex: number, newPrice: number) => {
    try {
      const propertyRef = doc(db, 'properties', propertyId);
      const property = properties.find(p => p.id === propertyId);
      
      if (!property) return;
      
      const updatedRoomTypes = [...property.roomTypes];
      updatedRoomTypes[roomTypeIndex] = {
        ...updatedRoomTypes[roomTypeIndex],
        price: newPrice
      };

      await updateDoc(propertyRef, {
        roomTypes: updatedRoomTypes
      });

      setProperties(prevProperties =>
        prevProperties.map(prop =>
          prop.id === propertyId
            ? { ...prop, roomTypes: updatedRoomTypes }
            : prop
        )
      );
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const handleWeekendMultiplierChange = async (propertyId: string, roomTypeIndex: number, multiplier: number) => {
    try {
      const propertyRef = doc(db, 'properties', propertyId);
      const property = properties.find(p => p.id === propertyId);
      
      if (!property) return;
      
      const updatedRoomTypes = [...property.roomTypes];
      updatedRoomTypes[roomTypeIndex] = {
        ...updatedRoomTypes[roomTypeIndex],
        weekendMultiplier: multiplier
      };

      await updateDoc(propertyRef, {
        roomTypes: updatedRoomTypes
      });

      setProperties(prevProperties =>
        prevProperties.map(prop =>
          prop.id === propertyId
            ? { ...prop, roomTypes: updatedRoomTypes }
            : prop
        )
      );
    } catch (error) {
      console.error('Error updating weekend multiplier:', error);
    }
  };

  const handleSeasonalPricing = async (propertyId: string, roomTypeIndex: number) => {
    if (!newSeasonalPricing.startDate || !newSeasonalPricing.endDate) return;

    const today = new Date();
    const startDate = new Date(newSeasonalPricing.startDate);
    const endDate = new Date(newSeasonalPricing.endDate);

    if (startDate < today) {
      setError("Start date cannot be in the past");
      return;
    }

    if (endDate < startDate) {
      setError("End date must be after start date");
      return;
    }

    try {
      const propertyRef = doc(db, 'properties', propertyId);
      const property = properties.find(p => p.id === propertyId);
      
      if (!property) return;
      
      const updatedRoomTypes = [...property.roomTypes];
      const updatedSeasonalPricing = [
        ...(updatedRoomTypes[roomTypeIndex].seasonalPricing || []),
        newSeasonalPricing
      ];
      
      updatedRoomTypes[roomTypeIndex] = {
        ...updatedRoomTypes[roomTypeIndex],
        seasonalPricing: updatedSeasonalPricing
      };

      await updateDoc(propertyRef, {
        roomTypes: updatedRoomTypes
      });

      setProperties(prevProperties =>
        prevProperties.map(prop =>
          prop.id === propertyId
            ? { ...prop, roomTypes: updatedRoomTypes }
            : prop
        )
      );
      
      setNewSeasonalPricing({
        startDate: '',
        endDate: '',
        multiplier: 1,
        description: ''
      });
      setError(null);
    } catch (error) {
      console.error('Error adding seasonal pricing:', error);
      setError('Failed to add seasonal pricing. Please try again.');
    }
  };

  const addSeasonalPricing = async (propertyId: string, roomTypeIndex: number) => {
    await handleSeasonalPricing(propertyId, roomTypeIndex);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value;
    if (endDate < newSeasonalPricing.startDate) {
      setError("End date must be after start date");
    } else {
      setError(null);
    }
    setNewSeasonalPricing(prev => ({
      ...prev,
      endDate
    }));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    if (startDate < getTodayString()) {
      setError("Start date cannot be in the past");
    } else if (newSeasonalPricing.endDate && startDate > newSeasonalPricing.endDate) {
      setError("Start date must be before end date");
    } else {
      setError(null);
    }
    setNewSeasonalPricing(prev => ({
      ...prev,
      startDate
    }));
  };

  const handleUpdateWeekendMultiplier = async (propertyId: string, roomTypeIndex: number) => {
    if (tempWeekendMultiplier < 1) {
      setError("Weekend multiplier cannot be less than 1");
      return;
    }

    try {
      const propertyRef = doc(db, 'properties', propertyId);
      const property = properties.find(p => p.id === propertyId);
      
      if (!property) return;
      
      const updatedRoomTypes = [...property.roomTypes];
      const oldMultiplier = updatedRoomTypes[roomTypeIndex].weekendMultiplier;
      const basePrice = updatedRoomTypes[roomTypeIndex].price;
      
      // Create price history entry
      const historyEntry: PriceHistory = {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        price: basePrice * tempWeekendMultiplier,
        type: 'weekend',
        description: `Weekend price updated from $${(basePrice * oldMultiplier).toFixed(2)} to $${(basePrice * tempWeekendMultiplier).toFixed(2)}`
      };

      updatedRoomTypes[roomTypeIndex] = {
        ...updatedRoomTypes[roomTypeIndex],
        weekendMultiplier: tempWeekendMultiplier,
        priceHistory: [
          ...(updatedRoomTypes[roomTypeIndex].priceHistory || []),
          historyEntry
        ]
      };

      await updateDoc(propertyRef, {
        roomTypes: updatedRoomTypes
      });

      setProperties(prevProperties =>
        prevProperties.map(prop =>
          prop.id === propertyId
            ? { ...prop, roomTypes: updatedRoomTypes }
            : prop
        )
      );
      
      // Force calendar to refresh by updating its key
      setCalendarKey(prev => prev + 1);
      setError(null);
    } catch (error) {
      console.error('Error updating weekend multiplier:', error);
      setError('Failed to update weekend multiplier. Please try again.');
    }
  };

  const renderPriceHistory = () => {
    if (!selectedProperty || !selectedRoomType) return null;

    const history = [...(selectedRoomType.priceHistory || [])].reverse(); // Reverse to show newest first
    const displayHistory = showAllHistory ? history : history.slice(0, 3);
    const hasMoreHistory = history.length > 3;

    return (
      <div className="bg-white shadow sm:rounded-lg mt-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Price History
            </h3>
            {hasMoreHistory && (
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showAllHistory ? 'Show Less' : `Show More (${history.length - 3} more)`}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {displayHistory.map((historyItem, index) => (
              <div 
                key={index} 
                className={`bg-gray-50 p-4 rounded-md flex flex-col space-y-1 ${index === 0 ? 'border-2 border-indigo-200' : ''}`}
              >
                {index === 0 && (
                  <div className="text-xs font-medium text-indigo-600 mb-1">
                    Most Recent Change
                  </div>
                )}
                <div className="text-sm text-gray-900">
                  {historyItem.startDate} - {historyItem.endDate}
                </div>
                <div className="text-sm text-gray-600">
                  Price: ${historyItem.price.toFixed(2)}
                </div>
                {historyItem.description && (
                  <div className="text-sm text-gray-500">
                    {historyItem.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Property Pricing Management</h1>

      {/* Property Selection */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Property
          </label>
          <select
            value={selectedPropertyId}
            onChange={(e) => handlePropertyChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Room Type
          </label>
          <select
            value={selectedRoomTypeIndex}
            onChange={(e) => handleRoomTypeChange(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={!selectedPropertyId}
          >
            <option value={-1}>Select a room type</option>
            {selectedProperty?.roomTypes.map((roomType, index) => (
              <option key={index} value={index}>
                {roomType.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price Management Section */}
      {selectedProperty && selectedRoomType && (
        <div className="mt-8 space-y-6">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Base Price (per night)
              </h3>
              <div className="mt-2 flex items-center space-x-4">
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={selectedRoomType.price}
                    onChange={(e) => {
                      const newPrice = Number(e.target.value);
                      if (newPrice >= 0) {
                        handlePriceChange(selectedProperty.id, selectedRoomTypeIndex, newPrice);
                      }
                    }}
                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Weekend Price Multiplier
              </h3>
              <div className="mt-2 flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={tempWeekendMultiplier}
                  onChange={(e) => setTempWeekendMultiplier(parseFloat(e.target.value))}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-32 sm:text-sm border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    const roomTypeIndex = selectedProperty.roomTypes.findIndex(
                      rt => rt.name === selectedRoomType.name
                    );
                    handleUpdateWeekendMultiplier(selectedProperty.id, roomTypeIndex);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update Weekend Price
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Weekend price: ${(selectedRoomType.price * selectedRoomType.weekendMultiplier).toFixed(2)}
                {tempWeekendMultiplier !== selectedRoomType.weekendMultiplier && (
                  <span className="ml-2 text-indigo-600">
                    → ${(selectedRoomType.price * tempWeekendMultiplier).toFixed(2)} (after update)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Calendar
              </h3>
              <PriceCalendar
                key={calendarKey}
                roomId={`${selectedPropertyId}_${selectedRoomType.name}`}
                basePrice={selectedRoomType.price}
                weekendMultiplier={selectedRoomType.weekendMultiplier}
                seasonalPricing={selectedRoomType.seasonalPricing || []}
                onPriceUpdate={() => {
                  // Refresh calendar after price updates
                  setCalendarKey(prev => prev + 1);
                }}
              />
            </div>
          </div>
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Seasonal Pricing
              </h3>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      min={getTodayString()}
                      value={newSeasonalPricing.startDate}
                      onChange={handleStartDateChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      min={getTodayString()}
                      value={newSeasonalPricing.endDate}
                      onChange={handleEndDateChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={newSeasonalPricing.multiplier}
                      onChange={(e) => setNewSeasonalPricing(prev => ({
                        ...prev,
                        multiplier: Number(e.target.value)
                      }))}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (e.g., "Holiday Season")
                    </label>
                    <input
                      type="text"
                      value={newSeasonalPricing.description}
                      onChange={(e) => setNewSeasonalPricing(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => addSeasonalPricing(selectedPropertyId, selectedRoomTypeIndex)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Seasonal Price
                  </button>
                  {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {(selectedRoomType as RoomTypeWithPricing).seasonalPricing?.map((pricing, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                    <div>
                      <p className="font-medium">{pricing.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(pricing.startDate).toLocaleDateString()} - {new Date(pricing.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price: ${(selectedRoomType.price * pricing.multiplier).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {renderPriceHistory()}
        </div>
      )}
    </div>
  );
};

export default PricingPage;
