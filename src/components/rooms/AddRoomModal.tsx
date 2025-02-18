import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'standard',
    description: '',
    maxOccupancy: 2,
    size: 30,
    amenities: [] as string[],
    pricingOptions: [{ type: 'room-only', price: 100 }],
    weekendMultiplier: 1.2,
    status: 'active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Room Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Occupancy
              </label>
              <input
                type="number"
                value={formData.maxOccupancy}
                onChange={(e) => setFormData({ ...formData, maxOccupancy: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Size (sqm)
              </label>
              <input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price (per night)
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">$</span>
              <input
                type="number"
                value={formData.pricingOptions[0].price}
                onChange={(e) => setFormData({
                  ...formData,
                  pricingOptions: [
                    { ...formData.pricingOptions[0], price: Number(e.target.value) }
                  ]
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              {initialData ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;
