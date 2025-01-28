import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual image upload logic
      // For now, we'll just create object URLs
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      onChange([...images, ...newImages].slice(0, maxImages));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={image}
              alt={`Property image ${index + 1}`}
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
            <label className="flex cursor-pointer flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              <span className="mt-2 text-sm text-gray-500">
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </span>
            </label>
          </div>
        )}
      </div>
      {images.length >= maxImages && (
        <p className="text-sm text-gray-500">
          Maximum number of images ({maxImages}) reached
        </p>
      )}
    </div>
  );
};
