import React from 'react';
import { Wifi, Coffee, Tv, Wind, Utensils, Car, Bath, Sun } from 'lucide-react';
import type { RoomDetails } from '../../types/room';

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  breakfast: Coffee,
  tv: Tv,
  ac: Wind,
  minibar: Utensils,
  parking: Car,
  bathtub: Bath,
  view: Sun,
};

interface RoomPreviewProps {
  room: RoomDetails;
}

export const RoomPreview: React.FC<RoomPreviewProps> = ({ room }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-64">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        {room.promotion && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {room.promotion.discountPercentage}% OFF
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{room.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{room.type} Room</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${room.pricingOptions[0]?.price}
            </p>
            <p className="text-sm text-gray-500">per night</p>
          </div>
        </div>

        <p className="mt-4 text-gray-600">{room.description}</p>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Room Details</h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">Size:</span>
              <span className="ml-2">{room.size} m²</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">Max Occupancy:</span>
              <span className="ml-2">{room.maxOccupancy} persons</span>
            </div>
            {room.hasBalcony && (
              <div className="flex items-center text-sm text-gray-500">
                <span>Balcony Available</span>
              </div>
            )}
            {room.isSmokingAllowed && (
              <div className="flex items-center text-sm text-gray-500">
                <span>Smoking Allowed</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Amenities</h3>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {room.amenities.map(amenityId => {
              const Icon = amenityIcons[amenityId];
              return (
                <div key={amenityId} className="flex items-center text-sm text-gray-600">
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  <span>{amenityId}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Pricing Options</h3>
          <div className="mt-2 space-y-2">
            {room.pricingOptions.map((option, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{option.type.replace('-', ' ')}</p>
                  {option.description && (
                    <p className="text-sm text-gray-500">{option.description}</p>
                  )}
                </div>
                <p className="font-semibold">${option.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};