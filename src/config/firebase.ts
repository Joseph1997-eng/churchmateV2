import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB2fvJaMt080z_In24d7oNHkwblSIJEXEo",
    authDomain: "churchmate-fc390.firebaseapp.com",
    projectId: "churchmate-fc390",
    storageBucket: "churchmate-fc390.firebasestorage.app",
    messagingSenderId: "213466608804",
    appId: "1:213466608804:web:de397bf63e1cfee2e72231",
    measurementId: "G-EYQ8WC258Y"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
// Offline persistence is AUTOMATIC on React Native - no configuration needed!
export const db = getFirestore(app);

// Initialize Auth with React Native persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Storage for logo uploads
export const storage = getStorage(app);

export default app;
