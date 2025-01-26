import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBILV267yY6adZYRt6gz7qO8NO7RJoSzJo",
  authDomain: "heart-on-wheels.firebaseapp.com",
  databaseURL: "https://heart-on-wheels-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "heart-on-wheels",
  storageBucket: "heart-on-wheels.firebasestorage.app",
  messagingSenderId: "210758606190",
  appId: "1:210758606190:web:0979e3de0045b71e8c357f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
