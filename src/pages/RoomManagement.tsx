import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import RoomSelector from '../components/rooms/RoomSelector';
import PriceRules from '../components/pricing/PriceRules';
import { createTestRoom } from '../utils/createTestRoom';

const RoomManagement: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [isCreatingTestRoom, setIsCreatingTestRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRoomId) {
      fetchRoomDetails();
    }
  }, [selectedRoomId]);

  const fetchRoomDetails = async () => {
    try {
      const roomRef = doc(db, 'rooms', selectedRoomId);
      const roomDoc = await getDoc(roomRef);
      if (roomDoc.exists()) {
        setRoomDetails(roomDoc.data());
        setError(null);
      } else {
        setRoomDetails(null);
        setError('Room not found');
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
      setError('Failed to fetch room details');
    }
  };

  const handleCreateTestRoom = async () => {
    try {
      setIsCreatingTestRoom(true);
      setError(null);
      const roomId = await createTestRoom();
      setSelectedRoomId(roomId);
    } catch (error) {
      console.error('Error creating test room:', error);
      setError('Failed to create test room');
    } finally {
      setIsCreatingTestRoom(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Room Pricing Management</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Room Selection Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Room</h2>
            <button
              onClick={handleCreateTestRoom}
              disabled={isCreatingTestRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isCreatingTestRoom ? 'Creating...' : 'Create Test Room'}
            </button>
          </div>
          <RoomSelector
            selectedRoomId={selectedRoomId}
            onRoomSelect={setSelectedRoomId}
          />
        </div>

        {/* Room Details and Pricing Section */}
        {selectedRoomId && roomDetails && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4">{roomDetails.name || 'Test Room'}</h2>
              
              {/* Base Price Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Base Price (per night)</h3>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">$</span>
                  <input
                    type="number"
                    value={roomDetails.basePrice || 100}
                    className="border rounded p-2 w-32"
                    disabled
                  />
                </div>
              </div>

              {/* Weekend Multiplier Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Weekend Price Multiplier</h3>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={roomDetails.weekendMultiplier || 1.2}
                    step="0.1"
                    className="border rounded p-2 w-32"
                    disabled
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Weekend price: ${((roomDetails.basePrice || 100) * (roomDetails.weekendMultiplier || 1.2)).toFixed(2)}
                </p>
              </div>

              {/* Pricing Rules Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Seasonal Pricing</h3>
                <PriceRules
                  roomId={selectedRoomId}
                  onRuleChange={fetchRoomDetails}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;