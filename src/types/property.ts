export type RoomTypeName = 'Standard Room' | 'Deluxe Room' | 'Suite';

export interface SeasonalPricing {
  startDate: string;
  endDate: string;
  multiplier: number;
  description: string;
}

export interface DailyPrice {
  price: number;
  type: 'custom' | 'seasonal' | 'weekend' | 'base';
}

export interface PriceHistory {
  startDate: string;
  endDate: string;
  price: number;
  type: 'weekend' | 'seasonal' | 'custom';
  description?: string;
}

export interface RoomType {
  name: RoomTypeName;
  price: number;
  numberOfRooms: number;
  weekendMultiplier: number;
  seasonalPricing: SeasonalPricing[];
  priceHistory: PriceHistory[];
  dailyPrices?: { [date: string]: DailyPrice };
}

export interface Property {
  id: string;
  userId: string;
  name: string;
  description: string;
  address: string;
  images: string[];
  roomTypes: RoomType[];
  amenities: string[];
  status: 'active' | 'booked' | 'inactive' | 'maintenance';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PropertyFormData extends Omit<Property, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  roomTypes: Array<RoomType>;
}