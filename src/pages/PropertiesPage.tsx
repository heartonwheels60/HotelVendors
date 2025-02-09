import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle, Building2 } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../contexts/AuthContext';
import type { Property } from '../types/property';

// Function to get amenity name from ID
const getAmenityName = (id: string): string => {
  // Convert amenityId to display name (e.g., 'firstAid' -> 'First Aid')
  return id
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
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
  property,
  onEdit, 
  onDelete 
}: { 
  property: Property;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-gray-400" />
            <span className="ml-2 text-lg font-medium text-gray-900">{property.name}</span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            property.status === 'active' ? 'bg-green-100 text-green-800' :
            property.status === 'booked' ? 'bg-blue-100 text-blue-800' :
            property.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">{property.address}</p>

        {/* Room Types */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">Room Types & Prices</h3>
          <div className="mt-2 space-y-2">
            {property.roomTypes.map((room, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{room.name}</span>
                <div className="text-gray-900">
                  <span className="font-medium">${room.price}</span>
                  <span className="text-gray-500 ml-2">· {room.numberOfRooms} rooms</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">Amenities</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {getAmenityName(amenity)}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => onEdit(property.id)}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(property.id)}
            className="inline-flex items-center text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export const HotelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [hotels, setHotels] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHotels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!user) {
        setError('Please log in to view your properties');
        return;
      }

      console.log('Loading properties for user:', user.uid); // Debug log
      const data = await propertyService.getProperties();
      console.log('Properties loaded:', data); // Debug log
      setHotels(data);
    } catch (err: any) {
      console.error('Error loading hotels:', err);
      setError(err.message || 'Failed to load hotels');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadHotels();
    }
  }, [loadHotels, authLoading]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }

    try {
      setError(null);
      await propertyService.deleteProperty(id);
      await loadHotels();
    } catch (err: any) {
      console.error('Error deleting hotel:', err);
      setError(err.message || 'Failed to delete hotel');
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-2 text-lg font-medium">Authentication Required</h2>
          <p className="mt-1 text-sm text-gray-500">Please log in to view your properties.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching properties
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Hotels</h1>
          {error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/hotels/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Hotel
        </button>
      </div>

      {hotels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hotels found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first hotel.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/hotels/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Hotel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map(hotel => (
            <PropertyCard
              key={hotel.id}
              property={hotel}
              onEdit={(id) => navigate(`/hotels/edit/${id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};