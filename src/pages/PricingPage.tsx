import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RoomDetails } from '../types/room';
import { PriceCalendar } from '../components/pricing/PriceCalendar';

interface SeasonalPricing {
  startDate: string;
  endDate: string;
  multiplier: number;
  description: string;
}

interface RoomPricing extends RoomDetails {
  basePrice: number;
  weekendMultiplier: number;
  seasonalPricing: SeasonalPricing[];
}

export const PricingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [rooms, setRooms] = useState<RoomPricing[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'rules'>('calendar');
  const [newSeasonalPricing, setNewSeasonalPricing] = useState<SeasonalPricing>({
    startDate: '',
    endDate: '',
    multiplier: 1,
    description: ''
  });

  const createTestRoom = async () => {
    if (!user) return;

    try {
      console.log('Creating test room...');
      const roomsRef = collection(db, 'rooms');
      const testRoom = {
        name: 'Test Room',
        type: 'standard',
        description: 'A test room for pricing',
        ownerId: user.uid,
        pricingOptions: [
          {
            type: 'room-only',
            price: 100
          }
        ],
        weekendMultiplier: 1.2,
        seasonalPricing: [],
        dailyPrices: {},
        status: 'active'
      };

      const docRef = await addDoc(roomsRef, testRoom);
      console.log('Test room created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating test room:', error);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) {
        console.log('No user found');
        return;
      }
      
      try {
        console.log('Fetching rooms for user:', user.uid);
        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('ownerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        console.log('Found rooms:', querySnapshot.size);
        
        // If no rooms exist, create a test room
        if (querySnapshot.empty) {
          console.log('No rooms found, creating test room...');
          await createTestRoom();
          // Fetch rooms again after creating test room
          const newQuerySnapshot = await getDocs(q);
          const roomsData = newQuerySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Room data:', data);
            return {
              id: doc.id,
              ...data,
              basePrice: data.pricingOptions?.[0]?.price || 0,
              weekendMultiplier: data.weekendMultiplier || 1.2,
              seasonalPricing: data.seasonalPricing || []
            };
          }) as RoomPricing[];
          
          console.log('Processed rooms data:', roomsData);
          setRooms(roomsData);
          return;
        }

        const roomsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Room data:', data);
          return {
            id: doc.id,
            ...data,
            basePrice: data.pricingOptions?.[0]?.price || 0,
            weekendMultiplier: data.weekendMultiplier || 1.2,
            seasonalPricing: data.seasonalPricing || []
          };
        }) as RoomPricing[];
        
        console.log('Processed rooms data:', roomsData);
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, [user]);

  const handleBasePriceChange = async (roomId: string, newPrice: number) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        'pricingOptions.0.price': newPrice
      });
      
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId 
            ? { ...room, basePrice: newPrice }
            : room
        )
      );
    } catch (error) {
      console.error('Error updating base price:', error);
    }
  };

  const handleWeekendMultiplierChange = async (roomId: string, multiplier: number) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        weekendMultiplier: multiplier
      });
      
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId 
            ? { ...room, weekendMultiplier: multiplier }
            : room
        )
      );
    } catch (error) {
      console.error('Error updating weekend multiplier:', error);
    }
  };

  const addSeasonalPricing = async (roomId: string) => {
    if (!newSeasonalPricing.startDate || !newSeasonalPricing.endDate) return;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      const room = rooms.find(r => r.id === roomId);
      const updatedSeasonalPricing = [...(room?.seasonalPricing || []), newSeasonalPricing];
      
      await updateDoc(roomRef, {
        seasonalPricing: updatedSeasonalPricing
      });
      
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId 
            ? { ...room, seasonalPricing: updatedSeasonalPricing }
            : room
        )
      );
      
      setNewSeasonalPricing({
        startDate: '',
        endDate: '',
        multiplier: 1,
        description: ''
      });
    } catch (error) {
      console.error('Error adding seasonal pricing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Room Pricing Management</h1>
      
      <div className="grid gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{room.name}</h2>
            
            {/* Base Price */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (per night)
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">$</span>
                <input
                  type="number"
                  value={room.basePrice}
                  onChange={(e) => handleBasePriceChange(room.id, Number(e.target.value))}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`${
                    activeTab === 'calendar'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Calendar View
                </button>
                <button
                  onClick={() => setActiveTab('rules')}
                  className={`${
                    activeTab === 'rules'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Pricing Rules
                </button>
              </nav>
            </div>

            {/* Calendar View */}
            {activeTab === 'calendar' && (
              <div className="mb-6">
                <PriceCalendar
                  roomId={room.id}
                  basePrice={room.basePrice}
                  weekendMultiplier={room.weekendMultiplier}
                  seasonalPricing={room.seasonalPricing}
                  onPriceUpdate={() => {
                    // Refresh room data
                    const fetchRooms = async () => {
                      if (!user) return;
                      const roomsRef = collection(db, 'rooms');
                      const q = query(roomsRef, where('ownerId', '==', user.uid));
                      const querySnapshot = await getDocs(q);
                      const roomsData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        basePrice: doc.data().pricingOptions?.[0]?.price || 0,
                        weekendMultiplier: doc.data().weekendMultiplier || 1.2,
                        seasonalPricing: doc.data().seasonalPricing || []
                      })) as RoomPricing[];
                      setRooms(roomsData);
                    };
                    fetchRooms();
                  }}
                />
              </div>
            )}

            {/* Pricing Rules View */}
            {activeTab === 'rules' && (
              <>
                {/* Weekend Multiplier */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weekend Price Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={room.weekendMultiplier}
                    onChange={(e) => handleWeekendMultiplierChange(room.id, Number(e.target.value))}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Weekend price: ${(room.basePrice * room.weekendMultiplier).toFixed(2)}
                  </p>
                </div>

                {/* Seasonal Pricing */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Seasonal Pricing</h3>
                  
                  {/* Add New Seasonal Price */}
                  {selectedRoom === room.id && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={newSeasonalPricing.startDate}
                            onChange={(e) => setNewSeasonalPricing(prev => ({
                              ...prev,
                              startDate: e.target.value
                            }))}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={newSeasonalPricing.endDate}
                            onChange={(e) => setNewSeasonalPricing(prev => ({
                              ...prev,
                              endDate: e.target.value
                            }))}
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
                          onClick={() => addSeasonalPricing(room.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add Seasonal Price
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Seasonal Prices */}
                  <div className="space-y-4">
                    {room.seasonalPricing.map((pricing, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                        <div>
                          <p className="font-medium">{pricing.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(pricing.startDate).toLocaleDateString()} - {new Date(pricing.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Price: ${(room.basePrice * pricing.multiplier).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedRoom(selectedRoom === room.id ? '' : room.id)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {selectedRoom === room.id ? 'Cancel' : 'Add Seasonal Pricing'}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
