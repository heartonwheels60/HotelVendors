import React from 'react';
import { Wifi, Coffee, Tv, Wind, Utensils, Car, Bath, Sun } from 'lucide-react';

const availableAmenities = [
  { id: 'wifi', name: 'Free Wi-Fi', icon: Wifi, category: 'basic' },
  { id: 'breakfast', name: 'Breakfast Available', icon: Coffee, category: 'basic' },
  { id: 'tv', name: 'Smart TV', icon: Tv, category: 'comfort' },
  { id: 'ac', name: 'Air Conditioning', icon: Wind, category: 'comfort' },
  { id: 'minibar', name: 'Mini Bar', icon: Utensils, category: 'luxury' },
  { id: 'parking', name: 'Free Parking', icon: Car, category: 'basic' },
  { id: 'bathtub', name: 'Bathtub', icon: Bath, category: 'comfort' },
  { id: 'view', name: 'Ocean View', icon: Sun, category: 'luxury' },
];

interface AmenitySelectorProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
}

export const AmenitySelector: React.FC<AmenitySelectorProps> = ({
  selectedAmenities,
  onChange,
}) => {
  const toggleAmenity = (amenityId: string) => {
    const newSelection = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId];
    onChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Room Amenities</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {availableAmenities.map(amenity => {
          const Icon = amenity.icon;
          const isSelected = selectedAmenities.includes(amenity.id);

          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggleAmenity(amenity.id)}
              className={`flex items-center p-4 rounded-lg border ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="ml-3 text-sm font-medium">{amenity.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};