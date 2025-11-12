// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';



// Configuración de Firebase 
const firebaseConfig = {
    apiKey: "AIzaSyDZq-BkvWpLQB6-KH-_SnX4lIwZsm2uxrQ",
    authDomain: "miyayita-store.firebaseapp.com",
    projectId: "miyayita-store",
    storageBucket: "miyayita-store.appspot.com",
    messagingSenderId: "18919622963",
    appId: "1:18919622963:web:d62f7d385c795637cc1646",
    measurementId: "G-0RXKFYWB12"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Configurar Auth con persistencia según plataforma
let auth: Auth;
if (Platform.OS === 'web') {
  // En web usa IndexedDB/localStorage automáticamente
  auth = getAuth(app);
} else {
  // En móviles usa AsyncStorage para persistencia
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    // Si ya fue inicializado (hot reload), usa la instancia existente
    auth = getAuth(app);
  }
}
// Exportar servicios
export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
// Initialize Firebase