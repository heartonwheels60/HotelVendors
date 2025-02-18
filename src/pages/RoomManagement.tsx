import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import RoomSelector from '../components/rooms/RoomSelector';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../components/icons/ArrowRight';
import { Check } from '../components/icons/Check';
import { Plus } from '../components/icons/Plus';
import { useAuth } from '../contexts/AuthContext';
import RoomCard from '../components/rooms/RoomCard';
import AddRoomModal from '../components/rooms/AddRoomModal';

const RoomManagement: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, [user]);

  const fetchRooms = async () => {
    if (!user) return;
    
    try {
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('ownerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const roomsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to fetch rooms');
    }
  };

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

  const handleAddRoom = async (roomData: any) => {
    try {
      const roomsRef = collection(db, 'rooms');
      await addDoc(roomsRef, {
        ...roomData,
        ownerId: user?.uid,
        createdAt: new Date()
      });
      setShowAddRoomModal(false);
      fetchRooms();
    } catch (error) {
      console.error('Error adding room:', error);
      setError('Failed to add room');
    }
  };

  const handleEditRoom = (room: any) => {
    setSelectedRoomId(room.id);
    setShowAddRoomModal(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await deleteDoc(doc(db, 'rooms', roomId));
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      setError('Failed to delete room');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
        <button
          onClick={() => setShowAddRoomModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Room
        </button>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onEdit={() => handleEditRoom(room)}
            onDelete={() => handleDeleteRoom(room.id)}
          />
        ))}
      </div>

      {/* Add/Edit Room Modal */}
      {showAddRoomModal && (
        <AddRoomModal
          isOpen={showAddRoomModal}
          onClose={() => setShowAddRoomModal(false)}
          onSubmit={handleAddRoom}
          initialData={rooms.find(room => room.id === selectedRoomId)}
        />
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default RoomManagement;