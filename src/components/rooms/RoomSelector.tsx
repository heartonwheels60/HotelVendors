import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { RoomDetails } from '../../types/room';

interface RoomSelectorProps {
  onRoomSelect: (roomId: string) => void;
  selectedRoomId: string;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ onRoomSelect, selectedRoomId }) => {
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log('Fetching rooms...');
        setLoading(true);
        setError(null);

        const roomsCollection = collection(db, 'rooms');
        console.log('Querying Firestore for rooms...');
        
        const roomsSnapshot = await getDocs(roomsCollection);
        console.log('Rooms snapshot received:', roomsSnapshot.size, 'documents found');
        
        if (roomsSnapshot.empty) {
          console.log('No rooms found in the database');
        }

        const roomsList = roomsSnapshot.docs.map(doc => {
          const data = doc.data() as RoomDetails;
          console.log('Room data:', { id: doc.id, name: data.name || `Room ${doc.id}` });
          return {
            id: doc.id,
            name: data.name || `Room ${doc.id}`
          };
        });
        
        console.log('Processed rooms:', roomsList);
        setRooms(roomsList);
        setError(null);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load rooms. Please try again.');
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="text-red-600 bg-red-50 p-4 rounded-md">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 text-sm text-red-700 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label htmlFor="room-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Room {rooms.length > 0 ? `(${rooms.length} rooms available)` : '(No rooms found)'}
      </label>
      {rooms.length > 0 ? (
        <select
          id="room-select"
          value={selectedRoomId}
          onChange={(e) => onRoomSelect(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="mt-2 text-sm text-gray-500">
          No rooms found. Click "Create Test Room" to add a sample room.
        </div>
      )}
    </div>
  );
};

export default RoomSelector;
