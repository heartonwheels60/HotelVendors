export type RoomTypeName = 'Standard Room' | 'Deluxe Room' | 'Suite';

export interface RoomType {
  name: RoomTypeName;
  price: number;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  images: string[];
  roomTypes: RoomType[];
  amenities: string[];
  status: 'active' | 'inactive' | 'maintenance';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PropertyFormData extends Omit<Property, 'id' | 'createdAt' | 'updatedAt'> {
  roomTypes: Array<{
    name: RoomTypeName;
    price: number;
  }>;
}