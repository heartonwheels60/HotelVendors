import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AmenityGroup } from '../../types/amenity';
import { AmenityItem } from './AmenityItem';

interface AmenityCategoryProps {
  group: AmenityGroup;
  selectedAmenities: string[];
  onToggle: (amenityId: string) => void;
}

export const AmenityCategory: React.FC<AmenityCategoryProps> = ({
  group,
  selectedAmenities,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
      >
        <div>
          <h3 className="font-medium text-gray-900">{group.label}</h3>
          <p className="text-sm text-gray-500">{group.description}</p>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.amenities.map((amenity) => (
            <AmenityItem
              key={amenity.id}
              amenity={amenity}
              isSelected={selectedAmenities.includes(amenity.id)}
              onToggle={() => onToggle(amenity.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};


//test