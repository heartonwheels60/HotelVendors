import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, ThumbsUp, Calendar, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import type { Review } from '../types/review';
import { format } from 'date-fns';

// Star rating component
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'md' }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${
            size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
          }`}
          fill={star <= rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
};

// Category rating component
const CategoryRating: React.FC<{ label: string; rating: number }> = ({ label, rating }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}</span>
    <StarRating rating={rating} size="sm" />
  </div>
);

// Review card component
const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const [showFullComment, setShowFullComment] = useState(false);

  const toggleComment = () => {
    setShowFullComment(!showFullComment);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
          <p className="text-sm text-gray-600">{review.propertyName}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {/* Guest Info & Date */}
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{review.guestName}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Stayed {format(review.stayDate, 'MMM yyyy')}</span>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-2">
        <CategoryRating label="Cleanliness" rating={review.categories.cleanliness} />
        <CategoryRating label="Comfort" rating={review.categories.comfort} />
        <CategoryRating label="Location" rating={review.categories.location} />
        <CategoryRating label="Service" rating={review.categories.service} />
        <CategoryRating label="Value" rating={review.categories.value} />
      </div>

      {/* Comment */}
      <div>
        <p className={`text-gray-700 ${!showFullComment && 'line-clamp-3'}`}>
          {review.comment}
        </p>
        {review.comment.length > 150 && (
          <button
            onClick={toggleComment}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showFullComment ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto py-2">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="h-20 w-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Owner Response */}
      {review.response && (
        <div className="mt-4 pl-4 border-l-4 border-blue-100 bg-blue-50 p-4 rounded">
          <p className="text-sm font-medium text-gray-900 mb-1">Response from the owner</p>
          <p className="text-sm text-gray-700">{review.response.text}</p>
          <p className="text-xs text-gray-500 mt-2">
            Responded on {format(review.response.respondedAt, 'MMM d, yyyy')}
          </p>
        </div>
      )}
    </div>
  );
};

export const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        const data = await reviewService.getReviews();
        setReviews(data);
        setError(null);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, []);

  if (isLoading) {
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

  // Calculate average ratings
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  const averageCategories = reviews.reduce(
    (acc, review) => ({
      cleanliness: acc.cleanliness + review.categories.cleanliness,
      comfort: acc.comfort + review.categories.comfort,
      location: acc.location + review.categories.location,
      service: acc.service + review.categories.service,
      value: acc.value + review.categories.value
    }),
    { cleanliness: 0, comfort: 0, location: 0, service: 0, value: 0 }
  );

  Object.keys(averageCategories).forEach(key => {
    averageCategories[key as keyof typeof averageCategories] /= reviews.length;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header with summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Guest Reviews</h1>
            <p className="text-gray-600">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <StarRating rating={Math.round(averageRating)} />
              <span className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Average rating</p>
          </div>
        </div>

        {/* Category averages */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <CategoryRating label="Cleanliness" rating={Math.round(averageCategories.cleanliness)} />
          <CategoryRating label="Comfort" rating={Math.round(averageCategories.comfort)} />
          <CategoryRating label="Location" rating={Math.round(averageCategories.location)} />
          <CategoryRating label="Service" rating={Math.round(averageCategories.service)} />
          <CategoryRating label="Value" rating={Math.round(averageCategories.value)} />
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No reviews yet. Reviews will appear here after guests complete their stay.</p>
        </div>
      )}
    </div>
  );
};
