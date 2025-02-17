import React, { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import type { RoomDetails, PricingOption } from '../../types/room';
import { AmenitySelector } from './AmenitySelector';
import { PricingOptionsForm } from './PricingOptionsForm';
import { RoomPreview } from './RoomPreview';
import { DynamicPricingForm } from './DynamicPricingForm';
import type { DynamicPricing } from '../../types/pricing';

interface RoomFormProps {
  onSubmit: (room: Partial<RoomDetails>) => void;
  initialData?: Partial<RoomDetails>;
}

export const RoomForm: React.FC<RoomFormProps> = ({ onSubmit, initialData }) => {
  const [room, setRoom] = useState<Partial<RoomDetails>>(initialData || {
    type: 'standard',
    pricingOptions: [{ type: 'room-only', price: 0 }],
    dynamicPricing: {
      roomOnly: {
        basePrice: 0,
        weekendMultiplier: 1.3,
        specialDays: [],
        seasonalPricing: []
      }
    },
    amenities: [],
    images: [],
    isSmokingAllowed: false,
    hasBalcony: false,
    status: 'active'
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload these to a storage service
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setRoom(prev => ({
        ...prev,
        images: [...(prev.images || []), ...imageUrls]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(room);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold">Add New Room</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
        >
          {showPreview ? 'Edit Details' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        <RoomPreview room={room as RoomDetails} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Name</label>
                <input
                  type="text"
                  value={room.name || ''}
                  onChange={e => setRoom(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Room Type</label>
                <select
                  value={room.type}
                  onChange={e => setRoom(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={room.description || ''}
                  onChange={e => setRoom(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Size (m²)</label>
                  <input
                    type="number"
                    value={room.size || ''}
                    onChange={e => setRoom(prev => ({ ...prev, size: Number(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Occupancy</label>
                  <input
                    type="number"
                    value={room.maxOccupancy || ''}
                    onChange={e => setRoom(prev => ({ ...prev, maxOccupancy: Number(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Images</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload images</span>
                        <input type="file" className="sr-only" multiple accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {room.images?.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt="" className="h-20 w-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => setRoom(prev => ({
                        ...prev,
                        images: prev.images?.filter((_, i) => i !== index)
                      }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Features</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={room.hasBalcony}
                      onChange={e => setRoom(prev => ({ ...prev, hasBalcony: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Balcony</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={room.isSmokingAllowed}
                      onChange={e => setRoom(prev => ({ ...prev, isSmokingAllowed: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Smoking Allowed</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <AmenitySelector
            selectedAmenities={room.amenities || []}
            onChange={amenities => setRoom(prev => ({ ...prev, amenities }))}
          />

          <PricingOptionsForm
            options={room.pricingOptions || []}
            onChange={options => setRoom(prev => ({ ...prev, pricingOptions: options }))}
          />

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Dynamic Pricing</h3>
            <div className="space-y-6">
              <DynamicPricingForm
                initialData={room.dynamicPricing?.roomOnly}
                onChange={(pricing) =>
                  setRoom((prev) => ({
                    ...prev,
                    dynamicPricing: {
                      ...prev.dynamicPricing,
                      roomOnly: pricing,
                    },
                  }))
                }
                roomType={room.type}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
            >
              Save Room
            </button>
          </div>
        </form>
      )}
    </div>
  );
};