import React from 'react';
import type { AmenityGroup, Amenity } from '../../types/amenity';

interface AmenityPreviewProps {
  selectedIds: string[];
  amenityGroups: AmenityGroup[];
  customAmenities: Amenity[];
}

export const AmenityPreview: React.FC<AmenityPreviewProps> = ({
  selectedIds,
  amenityGroups,
  customAmenities
}) => {
  const selectedAmenities = [
    ...amenityGroups.flatMap(group =>
      group.amenities.filter(amenity => selectedIds.includes(amenity.id))
    ),
    ...customAmenities.filter(amenity => selectedIds.includes(amenity.id))
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Preview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {selectedAmenities.map(amenity => (
          <div
            key={amenity.id}
            className="flex items-center p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-sm">{amenity.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};