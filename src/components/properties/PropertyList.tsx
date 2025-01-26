import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Property } from '../../types/property';

interface PropertyListProps {
  properties: Property[];
}

export const PropertyList: React.FC<PropertyListProps> = ({ properties }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Properties</h2>
        <Link
          to="/properties/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          Add Property
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <Link
            key={property.id}
            to={`/properties/${property.id}`}
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative h-48">
              {property.images[0] ? (
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-t-lg">
                  <Building2 size={48} className="text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 px-2 py-1 bg-white rounded text-sm font-medium">
                {property.status}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{property.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{property.address}</p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>{property.amenities.length} amenities</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};