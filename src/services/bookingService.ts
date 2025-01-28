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
import type { Booking, BookingFormData, Guest } from '../types/booking';

const BOOKINGS_COLLECTION = 'bookings';
const GUESTS_COLLECTION = 'guests';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Helper function to convert Firestore data to Booking type
const convertBookingData = (docData: DocumentData, id: string): Booking => {
  return {
    id,
    propertyId: docData.propertyId || '',
    propertyName: docData.propertyName || '',
    roomType: docData.roomType || '',
    guestId: docData.guestId || '',
    guest: docData.guest || {},
    checkIn: convertTimestamp(docData.checkIn),
    checkOut: convertTimestamp(docData.checkOut),
    numberOfGuests: docData.numberOfGuests || 1,
    totalAmount: docData.totalAmount || 0,
    status: docData.status || 'pending',
    notes: docData.notes,
    createdAt: convertTimestamp(docData.createdAt),
    updatedAt: convertTimestamp(docData.updatedAt)
  };
};

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        convertBookingData(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw new Error('Failed to load bookings');
    }
  },

  async getBookingsByPropertyId(propertyId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('propertyId', '==', propertyId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        convertBookingData(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw new Error('Failed to load bookings');
    }
  },

  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return convertBookingData(docSnap.data(), docSnap.id);
    } catch (error) {
      console.error('Error getting booking:', error);
      throw new Error('Failed to load booking');
    }
  },

  async createBooking(data: BookingFormData): Promise<Booking> {
    try {
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

      // Then create the booking
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingData);
      
      return {
        id: docRef.id,
        ...bookingData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  },

  async updateBooking(id: string, data: Partial<BookingFormData>): Promise<void> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw new Error('Failed to update booking');
    }
  },

  async deleteBooking(id: string): Promise<void> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw new Error('Failed to delete booking');
    }
  }
};
