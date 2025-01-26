import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { PricingOption } from '../../types/room';

interface PricingOptionsFormProps {
  options: PricingOption[];
  onChange: (options: PricingOption[]) => void;
}

export const PricingOptionsForm: React.FC<PricingOptionsFormProps> = ({
  options,
  onChange,
}) => {
  const addOption = () => {
    onChange([...options, { type: 'room-only', price: 0 }]);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: keyof PricingOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Pricing Options</h3>
        <button
          type="button"
          onClick={addOption}
          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </button>
      </div>

      <div className="space-y-4">
        {options.map((option, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={option.type}
                  onChange={e => updateOption(index, 'type', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="room-only">Room Only</option>
                  <option value="breakfast-included">With Breakfast</option>
                  <option value="half-board">Half Board</option>
                  <option value="full-board">Full Board</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={option.price}
                  onChange={e => updateOption(index, 'price', Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={option.description || ''}
                  onChange={e => updateOption(index, 'description', e.target.value)}
                  placeholder="Optional description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeOption(index)}
              className="p-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};