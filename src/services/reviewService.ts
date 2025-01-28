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
import type { Review, ReviewFormData } from '../types/review';

const REVIEWS_COLLECTION = 'reviews';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Helper function to convert Firestore data to Review type
const convertReviewData = (docData: DocumentData, id: string): Review => {
  return {
    id,
    propertyId: docData.propertyId,
    propertyName: docData.propertyName,
    bookingId: docData.bookingId,
    guestId: docData.guestId,
    guestName: docData.guestName,
    rating: docData.rating,
    title: docData.title,
    comment: docData.comment,
    stayDate: convertTimestamp(docData.stayDate),
    createdAt: convertTimestamp(docData.createdAt),
    updatedAt: convertTimestamp(docData.updatedAt),
    response: docData.response ? {
      text: docData.response.text,
      respondedAt: convertTimestamp(docData.response.respondedAt)
    } : undefined,
    images: docData.images || [],
    categories: {
      cleanliness: docData.categories.cleanliness,
      comfort: docData.categories.comfort,
      location: docData.categories.location,
      service: docData.categories.service,
      value: docData.categories.value
    }
  };
};

export const reviewService = {
  async getReviews(): Promise<Review[]> {
    try {
      const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        convertReviewData(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw new Error('Failed to load reviews');
    }
  },

  async getReviewsByPropertyId(propertyId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('propertyId', '==', propertyId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        convertReviewData(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw new Error('Failed to load reviews');
    }
  },

  async getReviewsByGuestId(guestId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('guestId', '==', guestId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        convertReviewData(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw new Error('Failed to load reviews');
    }
  },

  async getReviewById(id: string): Promise<Review | null> {
    try {
      const docRef = doc(db, REVIEWS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return convertReviewData(docSnap.data(), docSnap.id);
    } catch (error) {
      console.error('Error getting review:', error);
      throw new Error('Failed to load review');
    }
  },

  async createReview(bookingId: string, guestId: string, propertyId: string, propertyName: string, guestName: string, stayDate: Date, data: ReviewFormData): Promise<Review> {
    try {
      const reviewData = {
        bookingId,
        propertyId,
        propertyName,
        guestId,
        guestName,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        stayDate,
        images: data.images || [],
        categories: data.categories,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);
      
      return {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review');
    }
  },

  async updateReview(id: string, data: Partial<ReviewFormData>): Promise<void> {
    try {
      const docRef = doc(db, REVIEWS_COLLECTION, id);
      
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('Failed to update review');
    }
  },

  async respondToReview(id: string, responseText: string): Promise<void> {
    try {
      const docRef = doc(db, REVIEWS_COLLECTION, id);
      
      await updateDoc(docRef, {
        response: {
          text: responseText,
          respondedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error responding to review:', error);
      throw new Error('Failed to respond to review');
    }
  },

  async deleteReview(id: string): Promise<void> {
    try {
      const docRef = doc(db, REVIEWS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Failed to delete review');
    }
  }
};
