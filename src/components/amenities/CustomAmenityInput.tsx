import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface CustomAmenityInputProps {
  onAdd: (name: string) => void;
}

export const CustomAmenityInput: React.FC<CustomAmenityInputProps> = ({ onAdd }) => {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Add custom amenity"
        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
      >
        <Plus size={20} className="mr-2" />
        Add
      </button>
    </div>
  );
};