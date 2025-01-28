import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertCircle, Star, Upload } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import { bookingService } from '../services/bookingService';
import type { ReviewFormData } from '../types/review';
import type { Booking } from '../types/booking';

// Star rating input component
const StarRatingInput: React.FC<{
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md';
  label?: string;
}> = ({ value, onChange, size = 'md', label }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex flex-col">
      {label && <span className="text-sm font-medium text-gray-700 mb-1">{label}</span>}
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} focus:outline-none`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`${
                star <= (hoverRating || value) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill={star <= (hoverRating || value) ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export const ReviewFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    comment: '',
    images: [],
    categories: {
      cleanliness: 0,
      comfort: 0,
      location: 0,
      service: 0,
      value: 0
    }
  });

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;
      
      try {
        setIsLoading(true);
        const bookingData = await bookingService.getBookingById(bookingId);
        if (bookingData) {
          setBooking(bookingData);
        }
      } catch (err) {
        console.error('Error loading booking:', err);
        setError('Failed to load booking');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking) {
      setError('Booking information is required');
      return;
    }

    // Validate all ratings are provided
    if (formData.rating === 0 || 
        Object.values(formData.categories).some(rating => rating === 0)) {
      setError('Please provide ratings for all categories');
      return;
    }
    
    try {
      setIsLoading(true);
      await reviewService.createReview(
        booking.id,
        booking.guest.id,
        booking.propertyId,
        booking.propertyName,
        booking.guest.name,
        booking.checkOut,
        formData
      );
      navigate('/reviews');
    } catch (err) {
      console.error('Error saving review:', err);
      setError('Failed to save review');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Booking not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Review your stay at {booking.propertyName}
      </h1>

      {error && (
        <div className="mb-4 bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <StarRatingInput
            label="Overall Rating"
            value={formData.rating}
            onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
          />
        </div>

        {/* Category Ratings */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Rate Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StarRatingInput
              label="Cleanliness"
              size="sm"
              value={formData.categories.cleanliness}
              onChange={(rating) => setFormData(prev => ({
                ...prev,
                categories: { ...prev.categories, cleanliness: rating }
              }))}
            />
            <StarRatingInput
              label="Comfort"
              size="sm"
              value={formData.categories.comfort}
              onChange={(rating) => setFormData(prev => ({
                ...prev,
                categories: { ...prev.categories, comfort: rating }
              }))}
            />
            <StarRatingInput
              label="Location"
              size="sm"
              value={formData.categories.location}
              onChange={(rating) => setFormData(prev => ({
                ...prev,
                categories: { ...prev.categories, location: rating }
              }))}
            />
            <StarRatingInput
              label="Service"
              size="sm"
              value={formData.categories.service}
              onChange={(rating) => setFormData(prev => ({
                ...prev,
                categories: { ...prev.categories, service: rating }
              }))}
            />
            <StarRatingInput
              label="Value"
              size="sm"
              value={formData.categories.value}
              onChange={(rating) => setFormData(prev => ({
                ...prev,
                categories: { ...prev.categories, value: rating }
              }))}
            />
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Review Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Review Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Your Review</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            rows={4}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Add Photos</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    multiple
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/reviews')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};
