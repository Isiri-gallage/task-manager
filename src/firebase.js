import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// REPLACE THIS WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCRwK0vrZBj80SYW6nUMkW8F4aAQzkCxQY",
  authDomain: "task-manager-58d07.firebaseapp.com",
  projectId: "task-manager-58d07",
  storageBucket: "task-manager-58d07.firebasestorage.app",
  messagingSenderId: "823831072060",
  appId: "1:823831072060:web:a9560177bb6178e69c6239"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;