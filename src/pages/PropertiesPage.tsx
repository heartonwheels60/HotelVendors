import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import type { Property } from '../types/property';

// Function to get amenity name from ID
const getAmenityName = (id: string): string => {
  const amenityMap: Record<string, string> = {
    wifi: 'WiFi',
    parking: 'Parking',
    swimmingPool: 'Swimming Pool',
    gym: 'Fitness Center',
    spa: 'Spa',
    restaurant: 'Restaurant',
    bar: 'Bar/Lounge',
    breakfast: 'Breakfast',
    roomService: 'Room Service',
    airConditioning: 'Air Conditioning',
    laundry: 'Laundry Service',
    businessCenter: 'Business Center'
  };
  return amenityMap[id] || id;
};

// Function to group properties by base name (without room type)
const groupProperties = (properties: Property[]): Record<string, Property[]> => {
  const groups: Record<string, Property[]> = {};
  properties.forEach(property => {
    const baseName = property.name.split(' - ')[0];
    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    groups[baseName].push(property);
  });
  return groups;
};

// Memoized property card component
const PropertyCard = React.memo(({ 
  propertyGroup,
  onEdit, 
  onDelete 
}: { 
  propertyGroup: Property[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const baseProperty = propertyGroup[0];
  const baseName = baseProperty.name.split(' - ')[0];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="relative aspect-w-16 aspect-h-9 flex-grow">
          <img
            src={baseProperty.images[0] || '/placeholder-property.jpg'}
            alt={baseName}
            className="object-cover rounded-lg"
          />
        </div>
        <span className={`ml-4 px-2.5 py-1 rounded-full text-xs font-medium ${
          baseProperty.status === 'active' 
            ? 'bg-green-100 text-green-800'
            : baseProperty.status === 'maintenance'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {baseProperty.status.charAt(0).toUpperCase() + baseProperty.status.slice(1)}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{baseName}</h3>
      <p className="text-gray-600 mb-4">{baseProperty.address}</p>

      {/* Room Types & Prices */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Room Types & Prices</h4>
        <div className="grid grid-cols-1 gap-2">
          {propertyGroup.map(property => (
            <div key={property.id} className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-sm text-gray-600">{property.roomTypes[0]?.name}</span>
              <span className="text-sm font-medium text-gray-900">
                ${property.roomTypes[0]?.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
        <div className="flex flex-wrap gap-2">
          {baseProperty.amenities.slice(0, 3).map(amenity => (
            <span
              key={amenity}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {getAmenityName(amenity)}
            </span>
          ))}
          {baseProperty.amenities.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{baseProperty.amenities.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => onEdit(propertyGroup[0].id)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            // Delete all properties in the group
            propertyGroup.forEach(property => onDelete(property.id));
          }}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await propertyService.getProperties();
      setProperties(data);
      setError(null);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertyService.deleteProperty(id);
      await loadProperties(); // Reload the list
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const propertyGroups = groupProperties(properties);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
        <button
          onClick={() => navigate('/properties/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(propertyGroups).map(group => (
          <PropertyCard
            key={group[0].id}
            propertyGroup={group}
            onEdit={(id) => navigate(`/properties/edit/${id}`)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No properties found. Add your first property!</p>
        </div>
      )}
    </div>
  );
};