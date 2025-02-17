import { db, auth } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import type { Property, PropertyFormData } from '../types/property';
import type { DynamicPricing } from '../types/pricing';

const PROPERTIES_COLLECTION = 'properties';
const DYNAMIC_PRICING_COLLECTION = 'dynamicPricing';

// Helper function to get current user ID with better error handling
const getCurrentUserId = (): string => {
  const user = auth.currentUser;
  if (!user?.uid) {
    throw new Error('Please log in to continue');
  }
  return user.uid;
};

// Helper function to convert Firestore timestamps
const convertTimestamp = (timestamp: Timestamp | null | undefined) => {
  return timestamp ? timestamp.toDate() : null;
};

// Helper function to convert property data
const convertPropertyData = (doc: any): Property => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    description: data.description || '',
    location: data.location || '',
    amenities: data.amenities || [],
    roomTypes: data.roomTypes || [],
    images: data.images || [],
    status: data.status || 'active',
    userId: data.userId || '',
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt)
  };
};

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    try {
      console.log('Getting current user...'); // Debug log
      const userId = getCurrentUserId();
      console.log('Current user ID:', userId); // Debug log

      console.log('Creating query...'); // Debug log
      // Simplified query without ordering until index is created
      const q = query(
        collection(db, PROPERTIES_COLLECTION),
        where('userId', '==', userId)
      );

      console.log('Executing query...'); // Debug log
      const querySnapshot = await getDocs(q);
      console.log('Query results:', querySnapshot.size, 'documents'); // Debug log

      // Convert and return properties
      const properties = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Converting property:', doc.id, data); // Debug log
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          location: data.location || '',
          amenities: data.amenities || [],
          roomTypes: data.roomTypes || [],
          images: data.images || [],
          status: data.status || 'active',
          userId: data.userId || '',
          createdAt: data.createdAt?.toDate() || null,
          updatedAt: data.updatedAt?.toDate() || null
        } as Property;
      }).sort((a, b) => {
        // Client-side sorting by createdAt
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });

      console.log('Returning properties:', properties); // Debug log
      return properties;

    } catch (error: any) {
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      if (error.message === 'Please log in to continue') {
        throw new Error('Please log in to view your properties');
      }
      
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to access these properties');
      }

      throw new Error('Failed to load properties. Please try again.');
    }
  },

  async getPropertyById(id: string): Promise<Property | null> {
    try {
      // Ensure user is authenticated
      const userId = getCurrentUserId();

      // Get property
      const docRef = doc(db, PROPERTIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      // Check if property exists
      if (!docSnap.exists()) {
        return null;
      }

      // Check property ownership
      const data = docSnap.data();
      if (data.userId !== userId) {
        throw new Error('You do not have permission to access this property');
      }

      // Convert and return property
      return convertPropertyData(docSnap);

    } catch (error: any) {
      console.error('Error getting property:', error);
      
      if (error.message === 'Please log in to continue') {
        throw new Error('Please log in to view this property');
      }
      
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to access this property');
      }

      throw new Error('Failed to load property. Please try again.');
    }
  },

  async createProperty(data: PropertyFormData): Promise<Property> {
    try {
      // Ensure user is authenticated
      const userId = getCurrentUserId();

      // Prepare property data
      const propertyData = {
        ...data,
        userId,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Create property
      const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), propertyData);
      
      // Get and return the new property
      const newProperty = await this.getPropertyById(docRef.id);
      if (!newProperty) {
        throw new Error('Failed to create property');
      }

      return newProperty;

    } catch (error: any) {
      console.error('Error creating property:', error);
      
      if (error.message === 'Please log in to continue') {
        throw new Error('Please log in to create a property');
      }
      
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to create properties');
      }

      throw new Error('Failed to create property. Please try again.');
    }
  },

  async updateProperty(id: string, data: Partial<PropertyFormData>): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const property = await this.getPropertyById(id);
      
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.userId !== userId) {
        throw new Error('Unauthorized access to property');
      }

      const docRef = doc(db, PROPERTIES_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  async deleteProperty(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const property = await this.getPropertyById(id);
      
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.userId !== userId) {
        throw new Error('Unauthorized access to property');
      }

      const docRef = doc(db, PROPERTIES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  async getPropertyDynamicPricing(propertyId: string) {
    try {
      // First get the property to access room prices
      const propertyDoc = await getDoc(doc(db, PROPERTIES_COLLECTION, propertyId));
      if (!propertyDoc.exists()) {
        throw new Error('Property not found');
      }
      
      const propertyData = propertyDoc.data();
      const standardRoomPrice = propertyData.roomTypes?.[0]?.price || 100; // Default to 100 if no price found

      const docRef = doc(db, DYNAMIC_PRICING_COLLECTION, propertyId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          roomOnly: {
            ...data.roomOnly,
            basePrice: data.roomOnly.basePrice || standardRoomPrice
          },
          breakfastIncluded: data.breakfastIncluded && {
            ...data.breakfastIncluded,
            basePrice: data.breakfastIncluded.basePrice || (standardRoomPrice * 1.2)
          },
          halfBoard: data.halfBoard && {
            ...data.halfBoard,
            basePrice: data.halfBoard.basePrice || (standardRoomPrice * 1.4)
          },
          fullBoard: data.fullBoard && {
            ...data.fullBoard,
            basePrice: data.fullBoard.basePrice || (standardRoomPrice * 1.6)
          }
        };
      }

      // If no dynamic pricing exists, return default pricing based on room price
      return {
        roomOnly: {
          basePrice: standardRoomPrice,
          weekendMultiplier: 1.3,
          specialDays: [],
          seasonalPricing: []
        },
        breakfastIncluded: {
          basePrice: standardRoomPrice * 1.2, // 20% more for breakfast
          weekendMultiplier: 1.3,
          specialDays: [],
          seasonalPricing: []
        },
        halfBoard: {
          basePrice: standardRoomPrice * 1.4, // 40% more for half board
          weekendMultiplier: 1.3,
          specialDays: [],
          seasonalPricing: []
        },
        fullBoard: {
          basePrice: standardRoomPrice * 1.6, // 60% more for full board
          weekendMultiplier: 1.3,
          specialDays: [],
          seasonalPricing: []
        }
      };
    } catch (error) {
      console.error('Error getting dynamic pricing:', error);
      throw new Error('Failed to load dynamic pricing');
    }
  },

  async updatePropertyDynamicPricing(propertyId: string, dynamicPricing: {
    roomOnly: DynamicPricing;
    breakfastIncluded?: DynamicPricing;
    halfBoard?: DynamicPricing;
    fullBoard?: DynamicPricing;
  }): Promise<void> {
    try {
      const docRef = doc(db, DYNAMIC_PRICING_COLLECTION, propertyId);
      await setDoc(docRef, dynamicPricing);
    } catch (error) {
      console.error('Error updating dynamic pricing:', error);
      throw error;
    }
  }
};
