export interface Booking {
  id: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalAmount: number;
}

export interface Room {
  id: string;
  type: string;
  size: number;
  bedType: string;
  view: string;
  amenities: string[];
  basePrice: number;
  available: boolean;
}

export interface Review {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  date: Date;
  response?: string;
}