export type RoomType = 'standard' | 'deluxe' | 'suite' | 'executive';

export type PricingOption = {
  type: 'room-only' | 'breakfast-included' | 'half-board' | 'full-board';
  price: number;
  description?: string;
};

export type Amenity = {
  id: string;
  name: string;
  icon: string;
  category: 'basic' | 'comfort' | 'luxury';
};

export interface RoomDetails {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  size: number;
  maxOccupancy: number;
  bedConfiguration: string;
  images: string[];
  pricingOptions: PricingOption[];
  amenities: string[];
  isSmokingAllowed: boolean;
  hasBalcony: boolean;
  status: 'active' | 'inactive' | 'maintenance';
  promotion?: {
    discountPercentage: number;
    validUntil: Date;
    description: string;
  };
}