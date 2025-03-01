import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { storageService } from '../services/storageService';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  folder: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 30,
  folder
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Please upload only image files');
      return;
    }

    // Validate number of files
    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const uploadedUrls = await storageService.uploadMultipleImages(files, folder);
      onImagesChange([...images, ...uploadedUrls]);
      
      // Clear the input value to allow uploading the same file again
      const input = e.target as HTMLInputElement;
      input.value = '';
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (indexToRemove: number) => {
    try {
      const imageUrl = images[indexToRemove];
      await storageService.deleteImage(imageUrl);
      
      const newImages = images.filter((_, index) => index !== indexToRemove);
      onImagesChange(newImages);
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image');
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Upload Button */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB ({images.length}/{maxImages} images)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading || images.length >= maxImages}
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="text-blue-500 text-sm">Uploading images...</div>
      )}

      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={image}
                alt={`Uploaded image ${index + 1}`}
                className="object-cover rounded-lg"
              />
            </div>
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
