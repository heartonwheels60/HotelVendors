import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { Property, PropertyFormData } from '../types/property';

const COLLECTION_NAME = 'properties';

export const propertyService = {
  async getAllProperties(): Promise<Property[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Property));
  },

  async getProperty(id: string): Promise<Property> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Property not found');
    }
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Property;
  },

  async createProperty(data: PropertyFormData): Promise<Property> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  async updateProperty(id: string, data: PropertyFormData): Promise<Property> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

    return {
      id,
      ...data,
      updatedAt: new Date()
    };
  },

  async deleteProperty(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async uploadImage(file: File): Promise<string> {
    const storageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
};
