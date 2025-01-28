import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Wifi, Car, Dumbbell, Coffee, Utensils, Bath, Bed, Wine } from 'lucide-react';
import type { Property } from '../../types/property';
import { propertyService } from '../../services/propertyService';

interface PropertyCardProps {
  property: Property;
  onRefresh: () => void;
}

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  parking: Car,
  swimmingPool: Bath,
  gym: Dumbbell,
  restaurant: Utensils,
  bar: Wine,
  roomService: Coffee,
  breakfast: Coffee,
  spa: Bath,
  businessCenter: Bed
};

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onRefresh }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(property.id);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  const formatAmenityName = (amenity: string) => {
    return amenity
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="relative h-48">
        <img
          src={property.images[0] || '/placeholder-property.jpg'}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 right-0 p-2 flex gap-2">
          {property.amenities.slice(0, 5).map((amenity) => {
            const Icon = amenityIcons[amenity];
            return Icon ? (
              <div
                key={amenity}
                className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
                title={formatAmenityName(amenity)}
              >
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
            ) : null;
          })}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{property.address}</p>
        
        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Amenities:</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {formatAmenityName(amenity)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => navigate(`/properties/${property.id}/edit`)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
