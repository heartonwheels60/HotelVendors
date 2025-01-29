import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import type { PropertyFormData, RoomTypeName } from '../types/property';
import { AmenityManager } from '../components/amenities/AmenityManager';
import { AlertCircle } from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Room' },
  { value: 'suite', label: 'Suite' },
  { value: 'deluxe', label: 'Deluxe Room' }
] as const;

export const PropertyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    description: '',
    address: '',
    roomTypes: [],
    amenities: [],
    images: [],
    status: 'active'
  });

  // Room type form state
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: ROOM_TYPES[0].value,
    price: 0,
    numberOfRooms: 1
  });

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const property = await propertyService.getPropertyById(id);
        if (!property) {
          setError('Property not found');
          return;
        }
        
        setFormData({
          name: property.name,
          description: property.description,
          address: property.address,
          roomTypes: property.roomTypes,
          amenities: property.amenities,
          images: property.images,
          status: property.status
        });
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      if (id) {
        await propertyService.updateProperty(id, formData);
      } else {
        await propertyService.createProperty(formData);
      }
      navigate('/properties');
    } catch (err) {
      console.error('Error saving property:', err);
      setError('Failed to save property');
      setIsLoading(false);
    }
  };

  const handleAddRoomType = (e: React.MouseEvent) => {
    e.preventDefault();
    if (roomTypeForm.name && roomTypeForm.price > 0 && roomTypeForm.numberOfRooms > 0) {
      setFormData(prev => ({
        ...prev,
        roomTypes: [...prev.roomTypes, {
          name: roomTypeForm.name as RoomTypeName,
          price: roomTypeForm.price,
          numberOfRooms: roomTypeForm.numberOfRooms
        }]
      }));
      setRoomTypeForm({ name: ROOM_TYPES[0].value, price: 0, numberOfRooms: 1 });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {id ? 'Edit Property' : 'Add New Property'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Property Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Property Images</label>
          <ImageUploader
            images={formData.images}
            onImagesChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))}
            maxImages={5}
            folder={`properties/${formData.name.toLowerCase().replace(/\s+/g, '-')}`}
          />
        </div>

        {/* Room Types */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Room Types</h2>
          
          {/* Existing Room Types */}
          <div className="mb-4">
            {formData.roomTypes.map((roomType, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2">
                <div>
                  <span className="font-medium">{roomType.name}</span>
                  <span className="text-gray-500 ml-2">
                    ${roomType.price} per night · {roomType.numberOfRooms} rooms
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      roomTypes: prev.roomTypes.filter((_, i) => i !== index)
                    }));
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add Room Type Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Room Type
                </label>
                <select
                  value={roomTypeForm.name}
                  onChange={(e) => setRoomTypeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {ROOM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price per Night
                </label>
                <input
                  type="number"
                  min="0"
                  value={roomTypeForm.price}
                  onChange={(e) => setRoomTypeForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Rooms
                </label>
                <input
                  type="number"
                  min="1"
                  value={roomTypeForm.numberOfRooms}
                  onChange={(e) => setRoomTypeForm(prev => ({ ...prev, numberOfRooms: Math.max(1, Number(e.target.value)) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddRoomType}
              className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Room Type
            </button>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Property Amenities</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select all amenities available at this property. These will be displayed to potential guests.
          </p>
          <AmenityManager
            selectedAmenities={formData.amenities}
            onChange={(amenities) => setFormData(prev => ({ ...prev, amenities }))}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </div>
  );
};