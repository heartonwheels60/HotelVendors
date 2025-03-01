export interface Booking {
  id: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalAmount: number;
}

export interface Review {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  date: Date;
  response?: string;
}