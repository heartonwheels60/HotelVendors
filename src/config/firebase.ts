import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBILV267yY6adZYRt6gz7qO8NO7RJoSzJo",
  authDomain: "heart-on-wheels.firebaseapp.com",
  databaseURL: "https://heart-on-wheels-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "heart-on-wheels",
  storageBucket: "heart-on-wheels.firebasestorage.app",
  messagingSenderId: "210758606190",
  appId: "1:210758606190:web:0979e3de0045b71e8c357f",
  measurementId: "G-BRS3W1QYMK"
};

// Initialize Firebase only if it hasn't been initialized
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

// Initialize Firebase services
let db;
let auth;
let storage;

try {
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase services:', error);
  throw new Error('Failed to initialize Firebase services.');
}

// Export initialized services
export { db, auth, storage, app as default };
