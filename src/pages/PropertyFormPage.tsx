import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { PropertyForm } from '../components/properties/PropertyForm';
import type { PropertyFormData } from '../types/property';
import { AlertCircle } from 'lucide-react';

export const PropertyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<PropertyFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      try {
        const property = await propertyService.getPropertyById(id);
        if (property) {
          // Convert property data to form data format
          const formData: PropertyFormData = {
            name: property.name.split(' - ')[0], // Remove room type from name
            description: property.description,
            address: property.address,
            images: property.images,
            roomTypes: property.roomTypes.map(room => ({
              name: room.name,
              price: room.price
            })),
            amenities: property.amenities,
            status: property.status
          };
          console.log('Loaded property data:', formData); // Debug log
          setInitialData(formData);
        }
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Failed to load property');
      }
    };
    loadProperty();
  }, [id]);

  const handleSubmit = async (data: PropertyFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Submitting property data:', data); // Debug log

      if (id) {
        await propertyService.updateProperty(id, data);
      } else {
        const properties = await propertyService.createProperty(data);
        console.log('Created properties:', properties); // Debug log
      }

      // Navigate back to properties list
      navigate('/properties');
    } catch (err) {
      console.error('Error submitting property:', err);
      setError('Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (id && !initialData && !error) {
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

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {id ? 'Edit Property' : 'Add New Property'}
      </h1>
      <PropertyForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};