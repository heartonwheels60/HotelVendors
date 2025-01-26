export type RoomType = 'standard' | 'deluxe' | 'suite';

export interface RoomPrice {
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
}

export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  images: string[];
  roomTypes: RoomPrice[];
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyFormData = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;