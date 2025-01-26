import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import type { PropertyFormData } from '../../types/property';
import { propertyService } from '../../services/propertyService';
import { RoomTypeForm } from './RoomTypeForm';
import { AmenityManager } from '../amenities/AmenityManager';

interface PropertyFormProps {
  initialData?: PropertyFormData;
  onSubmit: (data: PropertyFormData) => void;
  onCancel?: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<PropertyFormData>(initialData || {
    name: '',
    description: '',
    address: '',
    images: [],
    roomTypes: [],
    amenities: [],
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});

  // Cleanup object URLs when component unmounts or when images change
  useEffect(() => {
    return () => {
      formData.images.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [formData.images]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PropertyFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsLoading(true);
      try {
        const file = event.target.files[0];
        const imageUrl = await propertyService.uploadImage(file);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrors(prev => ({
          ...prev,
          images: 'Failed to upload image. Please try again.'
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = { ...formData };
      if (initialData?.id) {
        await propertyService.updateProperty(initialData.id, data);
      } else {
        await propertyService.createProperty(data);
      }
      onSubmit(data);
    } catch (error) {
      console.error('Error saving property:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save property. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium mb-6">Property Details</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={e => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              rows={4}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => {
                setFormData(prev => ({ ...prev, address: e.target.value }));
                if (errors.address) {
                  setErrors(prev => ({ ...prev, address: '' }));
                }
              }}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
          </div>

          <RoomTypeForm
            roomTypes={formData.roomTypes}
            onChange={(roomTypes) => setFormData(prev => ({ ...prev, roomTypes }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload images</span>
                    <input
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt=""
                    className="h-24 w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      images: prev.images.filter((_, i) => i !== index)
                    }))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <AmenityManager
          selectedAmenities={formData.amenities}
          onChange={amenities => setFormData(prev => ({ ...prev, amenities }))}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Property'}
        </button>
      </div>
    </form>
  );
};