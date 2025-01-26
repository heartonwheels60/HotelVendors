import React from 'react';
import { Check } from 'lucide-react';
import { Amenity } from '../../types/amenity';

interface AmenityItemProps {
  amenity: Amenity;
  isSelected: boolean;
  onToggle: () => void;
}

export const AmenityItem: React.FC<AmenityItemProps> = ({
  amenity,
  isSelected,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
        }`}
      >
        {isSelected && <Check size={12} className="text-white" />}
      </div>
      <span className="flex-1 text-left">{amenity.name}</span>
    </button>
  );
};