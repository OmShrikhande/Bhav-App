// Script to create an admin user in Firebase
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword 
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc,
  serverTimestamp
} = require('firebase/firestore');

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// Admin user details - CHANGE THESE VALUES
const adminEmail = "admin@example.com";
const adminPassword = "StrongPassword123!";
const adminUsername = "vipin_bullion"; // This is the reserved admin username
const adminFullName = "Admin User";

// Create admin user
async function createAdminUser() {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log(`User created with UID: ${user.uid}`);
    
    // Create user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: adminEmail,
      username: adminUsername,
      fullName: adminFullName,
      name: adminFullName,
      role: 'admin',
      isActive: true,
      sellerVerified: true,
      isPremium: true,
      buyRequestCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      city: "Admin City",
      state: "Admin State",
      firebaseUid: user.uid,
      catalogue: null
    });
    
    console.log('Admin user created successfully in Firestore');
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
createAdminUser();