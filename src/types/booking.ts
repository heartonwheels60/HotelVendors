export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  roomType: string;
  guestId: string;
  guest: Guest;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  totalAmount: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingFormData extends Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'guest' | 'guestId'> {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}
