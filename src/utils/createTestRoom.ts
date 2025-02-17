import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { RoomDetails } from '../types/room';

export const createTestRoom = async () => {
  console.log('Starting test room creation...');
  
  try {
    // First check if we can access Firestore
    const roomsCollection = collection(db, 'rooms');
    
    // Verify Firestore connection by trying to read
    console.log('Verifying Firestore connection...');
    const testQuery = await getDocs(roomsCollection);
    console.log('Firestore connection verified. Current room count:', testQuery.size);

    const testRoom: RoomDetails = {
      name: 'Test Room',
      type: 'standard',
      description: 'A test room for development',
      basePrice: 100,
      weekendMultiplier: 1.2,
      size: 30,
      maxOccupancy: 2,
      bedConfiguration: 'Queen',
      images: [],
      pricingOptions: [
        {
          type: 'room-only',
          price: 100
        }
      ],
      priceRules: [],
      dailyPrices: {},
      amenities: [],
      isSmokingAllowed: false,
      hasBalcony: false,
      status: 'active'
    };

    console.log('Attempting to add test room with data:', testRoom);
    const docRef = await addDoc(roomsCollection, testRoom);
    console.log('Successfully created test room with ID:', docRef.id);
    
    // Verify the room was created
    const verifySnapshot = await getDocs(roomsCollection);
    console.log(`After creation: total rooms = ${verifySnapshot.size}`);
    
    if (verifySnapshot.size <= testQuery.size) {
      throw new Error('Room count did not increase after creation');
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating test room:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to create test room: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
