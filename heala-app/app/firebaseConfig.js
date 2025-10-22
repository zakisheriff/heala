import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHLAYpmzr1DI4bcmRTXJO8T1Br-VAA0RA",
  authDomain: "heala-1-a0fd9.firebaseapp.com",
  projectId: "heala-1-a0fd9",
  storageBucket: "heala-1-a0fd9.firebasestorage.app",
  messagingSenderId: "177691222211",
  appId: "1:177691222211:web:5e5d5460247210c3564276"
};

// Initialize Firebase App only if not already initialized
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export default auth;
