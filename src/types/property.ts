export type RoomTypeName = 'Standard Room' | 'Deluxe Room' | 'Suite';

export interface RoomType {
  name: RoomTypeName;
  price: number;
  numberOfRooms: number;
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
  roomTypes: Array<{
    name: RoomTypeName;
    price: number;
    numberOfRooms: number;
  }>;
}