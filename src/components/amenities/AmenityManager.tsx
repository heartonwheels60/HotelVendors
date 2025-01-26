import React, { useState } from 'react';
import { amenityGroups } from '../../data/amenities';
import { AmenityCategory } from './AmenityCategory';
import { CustomAmenityInput } from './CustomAmenityInput';
import { AmenityPreview } from './AmenityPreview';
import type { Amenity } from '../../types/amenity';

export const AmenityManager: React.FC = () => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenities, setCustomAmenities] = useState<Amenity[]>([]);

  const handleToggle = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleAddCustom = (name: string) => {
    const newAmenity: Amenity = {
      id: `custom-${Date.now()}`,
      name,
      category: 'other',
      isCustom: true
    };
    setCustomAmenities(prev => [...prev, newAmenity]);
    setSelectedAmenities(prev => [...prev, newAmenity.id]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Property Amenities</h2>
        
        {amenityGroups.map(group => (
          <AmenityCategory
            key={group.category}
            group={group}
            selectedAmenities={selectedAmenities}
            onToggle={handleToggle}
          />
        ))}

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Custom Amenities</h3>
          <CustomAmenityInput onAdd={handleAddCustom} />
        </div>
      </div>

      <AmenityPreview
        selectedIds={selectedAmenities}
        amenityGroups={amenityGroups}
        customAmenities={customAmenities}
      />
    </div>
  );
};