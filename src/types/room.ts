export type RoomType = 'standard' | 'deluxe' | 'suite' | 'executive';

export type PricingOption = {
  type: 'room-only' | 'breakfast-included' | 'half-board' | 'full-board';
  price: number;
  description?: string;
};

export type PriceRule = {
  id: string;
  name: string;
  type: 'seasonal' | 'special_event' | 'last_minute' | 'early_bird';
  startDate: string;
  endDate: string;
  priceAdjustment: number; // percentage adjustment
  description?: string;
};

export type DynamicPricing = {
  basePrice: number;
  weekendMultiplier: number;
  specialDays: Array<{
    date: string;
    price: number;
  }>;
  seasonalPricing: Array<{
    startDate: string;
    endDate: string;
    multiplier: number;
  }>;
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
  basePrice: number;
  weekendMultiplier: number;
  pricingOptions: PricingOption[];
  priceRules: PriceRule[];
  dailyPrices: {
    [date: string]: {
      price: number;
      type: 'custom' | 'weekend' | 'seasonal' | 'base';
    };
  };
  dynamicPricing?: {
    roomOnly: DynamicPricing;
    breakfastIncluded?: DynamicPricing;
    halfBoard?: DynamicPricing;
    fullBoard?: DynamicPricing;
  };
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