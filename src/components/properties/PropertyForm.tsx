import React, { useState, useEffect } from 'react';
import type { PropertyFormData } from '@/types/property';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { AmenityManager } from '@/components/amenities/AmenityManager';

interface PropertyFormProps {
  initialData: PropertyFormData | null;
  onSubmit: (data: PropertyFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ROOM_TYPES = ['Standard Room', 'Deluxe Room', 'Suite'] as const;

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    description: '',
    address: '',
    images: [],
    roomTypes: [],
    amenities: [],
    status: 'active'
  });

  const [newRoom, setNewRoom] = useState({
    name: 'Standard Room',
    price: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      console.log('Setting initial form data:', initialData);
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    setFormData(prev => ({ ...prev, amenities }));
  };

  const handleRoomPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNewRoom(prev => ({ ...prev, price: value }));
    }
  };

  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.price) return;
    
    // Check if this room type already exists
    if (formData.roomTypes.some(room => room.name === newRoom.name)) {
      setErrors(prev => ({
        ...prev,
        roomType: 'This room type already exists'
      }));
      return;
    }

    const price = parseFloat(newRoom.price);
    if (isNaN(price)) {
      setErrors(prev => ({
        ...prev,
        roomType: 'Please enter a valid price'
      }));
      return;
    }

    // Add room with numeric price
    setFormData(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, {
        name: newRoom.name,
        price: price
      }]
    }));

    console.log('Added room:', { name: newRoom.name, price });
    
    setNewRoom({ name: 'Standard Room', price: '' });
    setErrors(prev => ({ ...prev, roomType: '' }));
  };

  const handleRemoveRoom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.address) errors.address = 'Address is required';
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    console.log('Form data before submit:', formData);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          error={errors.description}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <Input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          error={errors.address}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <ImageUpload
          images={formData.images}
          onChange={handleImagesChange}
          maxImages={5}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Room Types</label>
        <div className="flex gap-4 mb-2">
          <Select
            value={newRoom.name}
            onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
          >
            {ROOM_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Input
            type="text"
            placeholder="Price"
            value={newRoom.price}
            onChange={handleRoomPriceChange}
            className="w-32"
          />
          <Button type="button" onClick={handleAddRoom}>
            Add Room
          </Button>
        </div>
        {errors.roomType && (
          <p className="text-sm text-red-600 mt-1">{errors.roomType}</p>
        )}
        <div className="space-y-2">
          {formData.roomTypes.map((room, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>
                {room.name} - ${room.price}
              </span>
              <Button
                type="button"
                variant="danger"
                onClick={() => handleRemoveRoom(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amenities</label>
        <AmenityManager
          selectedAmenities={formData.amenities}
          onChange={handleAmenitiesChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <Select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </Select>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Property'}
        </Button>
      </div>
    </form>
  );
};