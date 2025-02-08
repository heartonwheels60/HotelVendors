import { db } from '../config/firebase';
import { auth } from '../config/firebase';
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
  writeBatch
} from 'firebase/firestore';
import type { Property, PropertyFormData, RoomType } from '../types/property';

const COLLECTION_NAME = 'properties';

// Helper function to safely convert room data
const convertRoomData = (room: DocumentData): RoomType => {
  return {
    name: room.name || 'Standard Room',
    price: typeof room.price === 'number' ? room.price : 0,
    numberOfRooms: typeof room.numberOfRooms === 'number' ? room.numberOfRooms : 1
  };
};

// Helper function to safely convert property data
const convertPropertyData = (docData: DocumentData, id: string): Property => {
  return {
    id,
    userId: docData.userId || '',
    name: docData.name || '',
    description: docData.description || '',
    address: docData.address || '',
    images: Array.isArray(docData.images) ? docData.images : [],
    roomTypes: Array.isArray(docData.roomTypes) 
      ? docData.roomTypes.map(convertRoomData)
      : [],
    amenities: Array.isArray(docData.amenities) ? docData.amenities : [],
    status: docData.status || 'active',
    createdAt: docData.createdAt?.toDate() || new Date(),
    updatedAt: docData.updatedAt?.toDate() || new Date()
  };
};

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => convertPropertyData(doc.data(), doc.id))
        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    } catch (error) {
      console.error('Error getting properties:', error);
      throw error;
    }
  },

  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return convertPropertyData(docSnap.data(), docSnap.id);
    } catch (error) {
      console.error('Error getting property:', error);
      throw error;
    }
  },

  async createProperty(data: PropertyFormData): Promise<Property[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const propertyData = {
        ...data,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        roomTypes: data.roomTypes.map(room => ({
          name: room.name,
          price: room.price,
          numberOfRooms: room.numberOfRooms
        }))
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), propertyData);
      
      // Return updated list of properties
      return this.getProperties();
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  async updateProperty(id: string, data: PropertyFormData): Promise<void> {
    try {
      const propertyRef = doc(db, COLLECTION_NAME, id);
      
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        roomTypes: data.roomTypes.map(room => ({
          name: room.name,
          price: room.price,
          numberOfRooms: room.numberOfRooms
        }))
      };

      await updateDoc(propertyRef, updateData);
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  async deleteProperty(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }
};
