export interface Review {
  id: string;
  propertyId: string;
  propertyName: string;
  bookingId: string;
  guestId: string;
  guestName: string;
  rating: number;
  title: string;
  comment: string;
  stayDate: Date;
  createdAt: Date;
  updatedAt: Date;
  response?: {
    text: string;
    respondedAt: Date;
  };
  images?: string[];
  categories: {
    cleanliness: number;
    comfort: number;
    location: number;
    service: number;
    value: number;
  };
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  categories: {
    cleanliness: number;
    comfort: number;
    location: number;
    service: number;
    value: number;
  };
}
