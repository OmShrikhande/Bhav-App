import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useFirebaseAuthStore } from '@/store/firebase-auth-store';
import { auth, onAuthStateChanged } from '@/config/firebaseConfig';

// Create context that combines both auth stores
type CombinedAuthStore = ReturnType<typeof useAuthStore> & {
  firebaseAuth: ReturnType<typeof useFirebaseAuthStore>;
};

const AuthContext = createContext<CombinedAuthStore | null>(null);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Get both auth states from Zustand
  const legacyAuthStore = useAuthStore();
  const firebaseAuthStore = useFirebaseAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth context");
        // Check if we already have a user in the store
        const currentFirebaseUser = firebaseAuthStore.user;
        const currentLegacyUser = legacyAuthStore.user;
        
        console.log("Current Firebase user:", currentFirebaseUser?.id);
        console.log("Current Legacy user:", currentLegacyUser?.id);
        
        if (!currentFirebaseUser && !currentLegacyUser) {
          console.log("No user in store, checking Firebase auth state");
          // No user in store, check Firebase auth state
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("Firebase auth state changed:", firebaseUser?.uid);
            
            if (firebaseUser) {
              // User is signed in
              console.log("User is signed in with Firebase");
              firebaseAuthStore.setError(null);
              
              // Import firestoreService here to avoid circular dependencies
              const { firestoreService } = await import('@/services/firestore');
              
              try {
                // Fetch user data from Firestore
                console.log("Fetching user data from Firestore");
                const userData = await firestoreService.getUserById(firebaseUser.uid);
                
                if (userData) {
                  console.log("User data found in Firestore:", userData.id, userData.role);
                  // Update the auth store with the user data
                  await firebaseAuthStore.updateUserProfile(userData);
                  console.log("Auth store updated with user data");
                } else {
                  console.log("No user data found in Firestore");
                }
              } catch (error) {
                console.error('Error fetching user data in auth context:', error);
              }
            } else {
              // User is signed out
              console.log("User is signed out");
              if (firebaseAuthStore.isAuthenticated) {
                await firebaseAuthStore.logOut();
                console.log("User logged out from Firebase auth store");
              }
            }
            
            setIsInitialized(true);
            console.log("Auth initialization complete");
            unsubscribe();
          });
        } else {
          // We already have a user in the store
          console.log("User already in store, skipping Firebase auth check");
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Set up ongoing auth state listener
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log("Setting up ongoing auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Ongoing auth state changed:", firebaseUser?.uid);
      
      if (firebaseUser) {
        // User is signed in
        console.log("User is signed in with Firebase (ongoing)");
        firebaseAuthStore.setError(null);
        
        if (!firebaseAuthStore.user) {
          console.log("No user in Firebase auth store, fetching from Firestore");
          // Import firestoreService here to avoid circular dependencies
          const { firestoreService } = await import('@/services/firestore');
          
          try {
            // Fetch user data from Firestore
            console.log("Fetching user data from Firestore (ongoing)");
            const userData = await firestoreService.getUserById(firebaseUser.uid);
            
            if (userData) {
              console.log("User data found in Firestore (ongoing):", userData.id, userData.role);
              // Update the auth store with the user data
              await firebaseAuthStore.updateUserProfile(userData);
              console.log("Auth store updated with user data (ongoing)");
            } else {
              console.log("No user data found in Firestore (ongoing)");
            }
          } catch (error) {
            console.error('Error fetching user data in auth context (ongoing):', error);
          }
        } else {
          console.log("User already in Firebase auth store:", firebaseAuthStore.user.id, firebaseAuthStore.user.role);
        }
      } else {
        // User is signed out
        console.log("User is signed out (ongoing)");
        if (firebaseAuthStore.isAuthenticated) {
          await firebaseAuthStore.logOut();
          console.log("User logged out from Firebase auth store (ongoing)");
        }
      }
    });
    
    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, [isInitialized]);
  
  // Combine both stores
  const combinedStore: CombinedAuthStore = {
    ...legacyAuthStore,
    firebaseAuth: firebaseAuthStore
  };

  // If auth is not initialized yet, return null or a loading indicator
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={combinedStore}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};