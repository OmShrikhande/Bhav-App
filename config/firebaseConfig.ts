// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  initializeAuth, 
  getReactNativePersistence,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXaOS6p-j5x4FXHaHHgZ3DdsdDr_87bdI",
  authDomain: "userguru-46628.firebaseapp.com",
  projectId: "userguru-46628",
  storageBucket: "userguru-46628.firebasestorage.app",
  messagingSenderId: "14861879382",
  appId: "1:14861879382:web:b576623dc293dbe3d513f7",
  measurementId: "G-ZLGJJ24QZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(error => {
  console.log('Analytics not supported:', error);
});

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Collection references
const usersCollection = collection(db, 'users');
const ratesCollection = collection(db, 'rates');
const transactionsCollection = collection(db, 'transactions');
const notificationsCollection = collection(db, 'notifications');

export { 
  app, 
  analytics, 
  auth, 
  db,
  usersCollection,
  ratesCollection,
  transactionsCollection,
  notificationsCollection,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  FirebaseUser,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp
};