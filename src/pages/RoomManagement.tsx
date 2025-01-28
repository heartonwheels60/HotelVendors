import React from 'react';
import { RoomForm } from '../components/rooms/RoomForm';
import type { RoomDetails } from '../types/room';

const RoomManagement: React.FC = () => {
  const handleSubmit = (room: Partial<RoomDetails>) => {
    // In a real application, this would send the data to your backend
    console.log('Submitted room:', room);
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <RoomForm onSubmit={handleSubmit} />
    </div>
  );
};

export default RoomManagement;