import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAGneswXx14HIpw7lZ1dqINU2f5jJIxg2s",
  authDomain: "how-dev-team.firebaseapp.com",
  projectId: "how-dev-team",
  storageBucket: "how-dev-team.firebasestorage.app",
  messagingSenderId: "530990096651",
  appId: "1:530990096651:web:684c8a7ba6d1dbd340420e",
  measurementId: "G-FL7VYVKZ9G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
