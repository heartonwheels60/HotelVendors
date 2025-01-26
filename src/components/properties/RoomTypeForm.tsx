import React from 'react';
import { RoomType, RoomPrice } from '../../types/property';

interface RoomTypeFormProps {
  roomTypes: RoomPrice[];
  onChange: (roomTypes: RoomPrice[]) => void;
}

const defaultAmenities = {
  standard: ['Free Wi-Fi', 'TV', 'Air Conditioning', 'Daily Housekeeping'],
  deluxe: ['Free Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'City View', 'Daily Housekeeping'],
  suite: ['Free Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Living Room', 'Ocean View', 'Butler Service', 'Daily Housekeeping']
};

const defaultCapacity = {
  standard: 2,
  deluxe: 3,
  suite: 4
};

export const RoomTypeForm: React.FC<RoomTypeFormProps> = ({ roomTypes, onChange }) => {
  const handleRoomTypeChange = (index: number, field: keyof RoomPrice, value: any) => {
    const updatedRoomTypes = [...roomTypes];
    updatedRoomTypes[index] = {
      ...updatedRoomTypes[index],
      [field]: value,
      // Set default amenities and capacity when room type changes
      ...(field === 'type' && {
        amenities: defaultAmenities[value as RoomType],
        capacity: defaultCapacity[value as RoomType]
      })
    };
    onChange(updatedRoomTypes);
  };

  const addRoomType = () => {
    onChange([
      ...roomTypes,
      {
        type: 'standard',
        pricePerNight: 0,
        capacity: defaultCapacity.standard,
        amenities: defaultAmenities.standard
      }
    ]);
  };

  const removeRoomType = (index: number) => {
    onChange(roomTypes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Room Types</h3>
        <button
          type="button"
          onClick={addRoomType}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Room Type
        </button>
      </div>

      {roomTypes.map((room, index) => (
        <div key={index} className="p-4 border rounded-md space-y-4">
          <div className="flex justify-between">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Type</label>
                <select
                  value={room.type}
                  onChange={(e) => handleRoomTypeChange(index, 'type', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={room.pricePerNight}
                    onChange={(e) => handleRoomTypeChange(index, 'pricePerNight', Number(e.target.value))}
                    className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  value={room.capacity}
                  onChange={(e) => handleRoomTypeChange(index, 'capacity', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amenities</label>
                <div className="mt-1 text-sm text-gray-500">
                  {room.amenities.join(', ')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeRoomType(index)}
              className="ml-4 p-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
