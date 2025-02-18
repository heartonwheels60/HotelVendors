import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { auth } from '../config/firebase';
import type { Booking, BookingFormData, Guest } from '../types/booking';
import { propertyService } from './propertyService';

const BOOKINGS_COLLECTION = 'bookings';
const GUESTS_COLLECTION = 'guests';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Helper function to determine booking status based on dates
const determineBookingStatus = (checkIn: Date, checkOut: Date): string => {
  const now = new Date();
  
  if (now > checkOut) {
    return 'completed';
  } else if (now >= checkIn && now <= checkOut) {
    return 'active';
  } else if (now < checkIn) {
    return 'pending';
  }
  return 'pending';
};

// Helper function to convert Firestore data to Booking type
const convertBookingData = (docData: DocumentData, id: string): Booking => {
  const checkIn = docData.checkIn ? convertTimestamp(docData.checkIn) : new Date();
  const checkOut = docData.checkOut ? convertTimestamp(docData.checkOut) : new Date();
  const createdAt = docData.createdAt ? convertTimestamp(docData.createdAt) : new Date();
  const updatedAt = docData.updatedAt ? convertTimestamp(docData.updatedAt) : new Date();

  // Determine the current status based on dates
  const currentStatus = determineBookingStatus(checkIn, checkOut);
  
  // Only update status if it's not cancelled
  const status = docData.status === 'cancelled' ? 'cancelled' : currentStatus;

  return {
    id,
    propertyId: docData.propertyId || '',
    propertyName: docData.propertyName || '',
    roomType: docData.roomType || '',
    guestId: docData.guestId || '',
    guest: {
      name: docData.guest?.name || '',
      email: docData.guest?.email || '',
      phone: docData.guest?.phone || ''
    },
    checkIn,
    checkOut,
    numberOfGuests: docData.numberOfGuests || 1,
    totalAmount: docData.totalAmount || 0,
    status,
    notes: docData.notes || '',
    createdAt,
    updatedAt,
    userId: docData.userId || ''
  };
};

// Helper function to check if all rooms are booked
const checkAllRoomsBooked = async (propertyId: string, date: Date): Promise<boolean> => {
  try {
    const property = await propertyService.getPropertyById(propertyId);
    if (!property) return false;

    // Get all active bookings for this property
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('propertyId', '==', propertyId),
      where('status', '!=', 'cancelled')
    );
    const bookings = await getDocs(q);

    // Count booked rooms for each room type
    const bookedRooms: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      const data = booking.data();
      const bookingCheckIn = convertTimestamp(data.checkIn);
      const bookingCheckOut = convertTimestamp(data.checkOut);

      // Check if booking overlaps with the given date
      if (date >= bookingCheckIn && date <= bookingCheckOut) {
        const roomType = data.roomType;
        bookedRooms[roomType] = (bookedRooms[roomType] || 0) + 1;
      }
    });

    // Check if all room types are fully booked
    return property.roomTypes.every(roomType => {
      const booked = bookedRooms[roomType.name] || 0;
      return booked >= roomType.numberOfRooms;
    });
  } catch (error) {
    console.error('Error checking all rooms booked:', error);
    return false;
  }
};

// Helper function to update property status
const updatePropertyStatus = async (propertyId: string, checkIn: Date, checkOut: Date) => {
  try {
    const isFullyBooked = await checkAllRoomsBooked(propertyId, checkIn);
    if (isFullyBooked) {
      await propertyService.updateProperty(propertyId, { status: 'booked' });
    }
  } catch (error) {
    console.error('Error updating property status:', error);
  }
};

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    try {
      const userId = getCurrentUserId();
      
      // Query bookings where user is either the owner or the creator
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const bookings = querySnapshot.docs.map(doc => convertBookingData(doc.data(), doc.id));
      
      // Sort bookings by check-in date, most recent first
      return bookings.sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime());
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings. Please try again.');
    }
  },

  async getBookingsByPropertyId(propertyId: string): Promise<Booking[]> {
    try {
      const userId = getCurrentUserId();
      
      // Simplified query without ordering until index is created
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('userId', '==', userId),
        where('propertyId', '==', propertyId)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Convert and sort on client side
      return querySnapshot.docs
        .map(doc => convertBookingData(doc.data(), doc.id))
        .sort((a, b) => {
          const dateA = a.createdAt?.getTime() || 0;
          const dateB = b.createdAt?.getTime() || 0;
          return dateB - dateA;
        });
    } catch (error: any) {
      console.error('Error getting bookings:', error);
      
      if (error.message === 'Please log in to continue') {
        throw new Error('Please log in to view your bookings');
      }
      
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to access these bookings');
      }

      throw new Error('Failed to load bookings. Please try again.');
    }
  },

  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const userId = getCurrentUserId();
      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      // Verify the booking belongs to the current user
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to booking');
      }

      return convertBookingData(data, docSnap.id);
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  },

  async checkRoomAvailability(
    propertyId: string, 
    roomType: string, 
    checkIn: Date, 
    checkOut: Date, 
    excludeBookingId?: string
  ): Promise<boolean> {
    try {
      // Get property to check total rooms
      const property = await propertyService.getPropertyById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      const roomTypeData = property.roomTypes.find(rt => rt.name === roomType);
      if (!roomTypeData) {
        throw new Error('Room type not found');
      }

      const totalRooms = roomTypeData.numberOfRooms;

      // Get overlapping bookings
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('propertyId', '==', propertyId)
      );

      const bookings = await getDocs(q);
      let bookedRooms = 0;

      bookings.forEach(booking => {
        const data = booking.data();
        // Skip if not the right room type, if cancelled, or if it's the booking being updated
        if (
          data.roomType !== roomType || 
          data.status === 'cancelled' || 
          (excludeBookingId && booking.id === excludeBookingId)
        ) {
          return;
        }
        const bookingCheckIn = convertTimestamp(data.checkIn);
        const bookingCheckOut = convertTimestamp(data.checkOut);

        // Check if dates overlap
        if (
          (checkIn <= bookingCheckOut && checkOut >= bookingCheckIn) ||
          (bookingCheckIn <= checkOut && bookingCheckOut >= checkIn)
        ) {
          bookedRooms++;
        }
      });

      const isAvailable = bookedRooms < totalRooms;

      // If this room type is full, check if all room types are full
      if (!isAvailable) {
        await updatePropertyStatus(propertyId, checkIn, checkOut);
      }

      return isAvailable;
    } catch (error) {
      console.error('Error checking room availability:', error);
      throw new Error('Failed to check room availability');
    }
  },

  async createBooking(data: BookingFormData): Promise<Booking> {
    try {
      const userId = getCurrentUserId();
      
      // Check room availability
      const isAvailable = await this.checkRoomAvailability(
        data.propertyId,
        data.roomType,
        data.checkIn,
        data.checkOut
      );

      if (!isAvailable) {
        throw new Error('Rooms Filled');
      }

      // First create or get the guest
      const guestData = {
        name: data.guestName,
        email: data.guestEmail,
        phone: data.guestPhone
      };

      const guestQuery = query(
        collection(db, GUESTS_COLLECTION),
        where('email', '==', guestData.email)
      );
      const guestSnapshot = await getDocs(guestQuery);
      
      let guestId: string;
      let guest: Guest;

      if (guestSnapshot.empty) {
        // Create new guest
        const guestDoc = await addDoc(collection(db, GUESTS_COLLECTION), {
          ...guestData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        guestId = guestDoc.id;
        guest = { id: guestId, ...guestData };
      } else {
        // Use existing guest
        const existingGuest = guestSnapshot.docs[0];
        guestId = existingGuest.id;
        guest = { id: guestId, ...existingGuest.data() } as Guest;
      }

      const bookingData = {
        propertyId: data.propertyId,
        propertyName: data.propertyName,
        roomType: data.roomType,
        guestId,
        guest,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        numberOfGuests: data.numberOfGuests,
        totalAmount: data.totalAmount,
        status: data.status,
        notes: data.notes,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingData);
      
      // Update property status after successful booking
      await updatePropertyStatus(data.propertyId, data.checkIn, data.checkOut);

      return {
        id: docRef.id,
        ...bookingData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  async updateBooking(id: string, data: Partial<BookingFormData>): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const booking = await this.getBookingById(id);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new Error('Unauthorized access to booking');
      }

      // If updating dates or room type, check availability first
      if ((data.checkIn && data.checkOut) || data.roomType) {
        const isAvailable = await this.checkRoomAvailability(
          data.propertyId || booking.propertyId,
          data.roomType || booking.roomType,
          data.checkIn || booking.checkIn,
          data.checkOut || booking.checkOut,
          id
        );

        if (!isAvailable) {
          throw new Error('Rooms Filled');
        }
      }

      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      
      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp()
      };

      // Update property and room info
      if (data.propertyId) {
        const property = await propertyService.getPropertyById(data.propertyId);
        if (!property) {
          throw new Error('Property not found');
        }
        updateData.propertyId = data.propertyId;
        updateData.propertyName = property.name;
      }
      
      if (data.roomType) updateData.roomType = data.roomType;
      if (data.numberOfGuests) updateData.numberOfGuests = data.numberOfGuests;
      if (data.totalAmount) updateData.totalAmount = data.totalAmount;
      if (data.status) updateData.status = data.status;
      if (data.notes) updateData.notes = data.notes;

      // Update dates
      if (data.checkIn) updateData.checkIn = Timestamp.fromDate(new Date(data.checkIn));
      if (data.checkOut) updateData.checkOut = Timestamp.fromDate(new Date(data.checkOut));

      // Update guest info
      if (data.guestName || data.guestEmail || data.guestPhone) {
        updateData.guest = {
          name: data.guestName || booking.guest.name,
          email: data.guestEmail || booking.guest.email,
          phone: data.guestPhone || booking.guest.phone
        };
      }

      await updateDoc(docRef, updateData);

      // Update property status after successful update
      if (data.propertyId && data.checkIn && data.checkOut) {
        await updatePropertyStatus(data.propertyId, data.checkIn, data.checkOut);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  async deleteBooking(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const booking = await this.getBookingById(id);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new Error('Unauthorized access to booking');
      }

      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
};
