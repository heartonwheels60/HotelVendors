import React from 'react';
import { Button } from '../ui/Button';

interface AmenityManagerProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
}

const AMENITY_CATEGORIES = [
  {
    name: 'Basic Amenities',
    amenities: [
      { id: 'wifi', name: 'WiFi' },
      { id: 'parking', name: 'Parking' },
      { id: 'airConditioning', name: 'Air Conditioning' },
      { id: 'heating', name: 'Heating' },
      { id: 'elevator', name: 'Elevator' },
      { id: '24hrFrontDesk', name: '24/7 Front Desk' },
      { id: 'security', name: '24/7 Security' },
      { id: 'smokeFree', name: 'Smoke-Free Property' },
    ]
  },
  {
    name: 'Health & Medical',
    amenities: [
      { id: 'firstAid', name: 'First Aid Station' },
      { id: 'doctorOnCall', name: 'Doctor On Call' },
      { id: 'pharmacy', name: 'Pharmacy Service' },
      { id: 'ambulanceAccess', name: 'Ambulance Access' },
      { id: 'medicalCenter', name: 'Medical Center' },
      { id: 'nurseOnDuty', name: 'Nurse On Duty' },
      { id: 'defibrillator', name: 'AED Defibrillator' },
      { id: 'oxygenService', name: 'Oxygen Service' },
      { id: 'wheelchairRental', name: 'Wheelchair Rental' },
      { id: 'medicalEquipment', name: 'Medical Equipment' },
      { id: 'isolationRoom', name: 'Isolation Room' },
      { id: 'healthScreening', name: 'Health Screening' }
    ]
  },
  {
    name: 'Room Features',
    amenities: [
      { id: 'tv', name: 'TV' },
      { id: 'minibar', name: 'Minibar' },
      { id: 'safe', name: 'In-Room Safe' },
      { id: 'workDesk', name: 'Work Desk' },
      { id: 'coffeemaker', name: 'Coffee Maker' },
      { id: 'hairDryer', name: 'Hair Dryer' },
      { id: 'ironingFacilities', name: 'Iron & Board' },
      { id: 'bathtub', name: 'Bathtub' },
      { id: 'shower', name: 'Shower' },
      { id: 'toiletries', name: 'Toiletries' },
      { id: 'bathrobes', name: 'Bathrobes' },
      { id: 'roomService', name: 'Room Service' },
    ]
  },
  {
    name: 'Food & Beverage',
    amenities: [
      { id: 'restaurant', name: 'Restaurant' },
      { id: 'bar', name: 'Bar/Lounge' },
      { id: 'breakfast', name: 'Breakfast Available' },
      { id: 'cafe', name: 'Café' },
      { id: 'minimarket', name: 'Mini-Market' },
      { id: 'waterDispenser', name: 'Water Dispenser' },
    ]
  },
  {
    name: 'Recreation & Wellness',
    amenities: [
      { id: 'swimmingPool', name: 'Swimming Pool' },
      { id: 'gym', name: 'Fitness Center' },
      { id: 'spa', name: 'Spa' },
      { id: 'sauna', name: 'Sauna' },
      { id: 'jacuzzi', name: 'Jacuzzi' },
      { id: 'garden', name: 'Garden' },
      { id: 'terrace', name: 'Terrace' },
      { id: 'playground', name: 'Kids Playground' },
      { id: 'gameRoom', name: 'Game Room' },
    ]
  },
  {
    name: 'Business Services',
    amenities: [
      { id: 'businessCenter', name: 'Business Center' },
      { id: 'meetingRooms', name: 'Meeting Rooms' },
      { id: 'conferenceRoom', name: 'Conference Facilities' },
      { id: 'faxCopy', name: 'Fax/Copy Service' },
      { id: 'computerStation', name: 'Computer Station' },
    ]
  },
  {
    name: 'Services',
    amenities: [
      { id: 'laundry', name: 'Laundry Service' },
      { id: 'dryClean', name: 'Dry Cleaning' },
      { id: 'concierge', name: 'Concierge Service' },
      { id: 'luggageStorage', name: 'Luggage Storage' },
      { id: 'currencyExchange', name: 'Currency Exchange' },
      { id: 'tourDesk', name: 'Tour Desk' },
      { id: 'carRental', name: 'Car Rental' },
      { id: 'airportTransfer', name: 'Airport Transfer' },
      { id: 'babysitting', name: 'Babysitting Service' },
    ]
  },
  {
    name: 'Accessibility',
    amenities: [
      { id: 'wheelchair', name: 'Wheelchair Accessible' },
      { id: 'braille', name: 'Braille Signage' },
      { id: 'handicapParking', name: 'Handicap Parking' },
      { id: 'accessibleBathroom', name: 'Accessible Bathroom' },
    ]
  }
];

export const AmenityManager: React.FC<AmenityManagerProps> = ({ selectedAmenities, onChange }) => {
  const handleToggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onChange(selectedAmenities.filter(id => id !== amenityId));
    } else {
      onChange([...selectedAmenities, amenityId]);
    }
  };

  return (
    <div className="space-y-8">
      {AMENITY_CATEGORIES.map(category => (
        <div key={category.name} className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {category.amenities.map(amenity => (
              <Button
                key={amenity.id}
                type="button"
                variant={selectedAmenities.includes(amenity.id) ? 'primary' : 'secondary'}
                onClick={() => handleToggleAmenity(amenity.id)}
                className="justify-start"
              >
                {amenity.name}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};