import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface RoomCardProps {
  room: {
    name: string;
    type: string;
    description: string;
    maxOccupancy: number;
    size: number;
    amenities?: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
          <p className="text-sm text-gray-600">{room.type}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Edit Room"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete Room"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">{room.description}</p>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Max Occupancy: {room.maxOccupancy}</span>
          <span>Size: {room.size} sqm</span>
        </div>

        {room.amenities && room.amenities.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
