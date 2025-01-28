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
  DocumentData,
  writeBatch
} from 'firebase/firestore';
import type { Property, PropertyFormData, RoomType } from '../types/property';

const COLLECTION_NAME = 'properties';

// Helper function to safely convert room data
const convertRoomData = (room: DocumentData): RoomType => {
  return {
    name: room.name || 'Standard Room',
    price: typeof room.price === 'number' ? room.price : 0
  };
};

// Helper function to safely convert property data
const convertPropertyData = (docData: DocumentData, id: string): Property => {
  return {
    id,
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
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        convertPropertyData(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error getting properties:', error);
      throw new Error('Failed to load properties');
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
      throw new Error('Failed to load property');
    }
  },

  async createProperty(data: PropertyFormData): Promise<Property[]> {
    try {
      const batch = writeBatch(db);
      const properties: Property[] = [];

      // Create a separate property for each room type
      for (const roomType of data.roomTypes) {
        const propertyData = {
          name: `${data.name} - ${roomType.name}`,
          description: data.description || '',
          address: data.address || '',
          images: Array.isArray(data.images) ? data.images : [],
          roomTypes: [{
            name: roomType.name,
            price: Number(roomType.price) || 0
          }],
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          status: data.status || 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = doc(collection(db, COLLECTION_NAME));
        batch.set(docRef, propertyData);

        properties.push({
          id: docRef.id,
          ...propertyData,
          createdAt: new Date(),
          updatedAt: new Date(),
          roomTypes: propertyData.roomTypes
        });
      }

      await batch.commit();
      return properties;
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error('Failed to create property');
    }
  },

  async updateProperty(id: string, data: PropertyFormData): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Ensure data is properly formatted before saving
      const propertyData = {
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        images: Array.isArray(data.images) ? data.images : [],
        roomTypes: data.roomTypes.map(room => ({
          name: room.name,
          price: Number(room.price) || 0
        })),
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        status: data.status || 'active',
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, propertyData);
    } catch (error) {
      console.error('Error updating property:', error);
      throw new Error('Failed to update property');
    }
  },

  async deleteProperty(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw new Error('Failed to delete property');
    }
  }
};
