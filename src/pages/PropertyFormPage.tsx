import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PropertyForm } from '../components/properties/PropertyForm';
import type { PropertyFormData } from '../types/property';

export const PropertyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSubmit = (data: PropertyFormData) => {
    // Here you would typically save the data to your backend
    console.log('Submitted property:', data);
    navigate('/properties');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-8">
        {id ? 'Edit Property' : 'Add New Property'}
      </h1>
      <PropertyForm onSubmit={handleSubmit} />
    </div>
  );
};