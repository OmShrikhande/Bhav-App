import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useFirebaseAuthStore } from '@/store/firebase-auth-store';
import { auth, onAuthStateChanged } from '@/config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context that combines both auth stores
type CombinedAuthStore = ReturnType<typeof useAuthStore> & {
  firebaseAuth: ReturnType<typeof useFirebaseAuthStore>;
  logout: () => Promise<void>; // Enhanced logout function
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
        
        // Check if we're in a logout state by checking AsyncStorage
        let isLoggingOut = false;
        try {
          const logoutState = await AsyncStorage.getItem('logout-in-progress');
          isLoggingOut = logoutState === 'true';
          console.log("Logout in progress:", isLoggingOut);
        } catch (error) {
          console.error("Error checking logout state:", error);
        }
        
        if (isLoggingOut) {
          console.log("Logout in progress, skipping auth initialization");
          setIsInitialized(true);
          return;
        }
        
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
    
    const checkLogoutState = async () => {
      try {
        const logoutState = await AsyncStorage.getItem('logout-in-progress');
        return logoutState === 'true';
      } catch (error) {
        console.error("Error checking logout state:", error);
        return false;
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Ongoing auth state changed:", firebaseUser?.uid);
      
      // Check if we're in a logout state
      const isLoggingOut = await checkLogoutState();
      if (isLoggingOut) {
        console.log("Logout in progress, ignoring auth state change");
        return;
      }
      
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
  
  // Create a wrapper for the logout function to handle both stores
  const enhancedLogout = async () => {
    console.log("Auth context: Enhanced logout called");
    
    // Set logout in progress flag
    try {
      await AsyncStorage.setItem('logout-in-progress', 'true');
      console.log("Auth context: Set logout in progress flag");
    } catch (error) {
      console.error("Auth context: Error setting logout flag:", error);
    }
    
    // Clear all auth storage first
    try {
      console.log("Auth context: Clearing all auth storage");
      const keys = [
        'firebase-auth-storage',
        'auth-storage',
        'zustand-auth-storage',
        'auth-state'
      ];
      
      for (const key of keys) {
        await AsyncStorage.removeItem(key);
      }
      
      // Try to clear all auth-related keys
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const authKeys = allKeys.filter(key => 
          key.includes('auth') || 
          key.includes('firebase') || 
          key.includes('user') ||
          key.includes('zustand')
        );
        
        if (authKeys.length > 0) {
          console.log("Auth context: Clearing all auth-related keys:", authKeys);
          await AsyncStorage.multiRemove(authKeys);
        }
      } catch (clearError) {
        console.error("Auth context: Error clearing all auth keys:", clearError);
      }
    } catch (storageError) {
      console.error("Auth context: Error clearing auth storage:", storageError);
    }
    
    // Logout from both stores
    try {
      await firebaseAuthStore.logOut();
    } catch (error) {
      console.error("Auth context: Error logging out from Firebase:", error);
    }
    
    try {
      await legacyAuthStore.logout();
    } catch (error) {
      console.error("Auth context: Error logging out from legacy store:", error);
    }
    
    // Force reset of auth stores
    try {
      console.log("Auth context: Force resetting auth stores");
      
      firebaseAuthStore.setState({
        user: null,
        firebaseUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      legacyAuthStore.setState({
        user: null,
        isAuthenticated: false,
        token: null,
        isPremiumUser: false,
        contactedDealers: [],
        contactedSellerDetails: []
      });
    } catch (resetError) {
      console.error("Auth context: Error resetting auth stores:", resetError);
    }
    
    console.log("Auth context: Enhanced logout complete");
  };
  
  // Combine both stores with enhanced logout
  const combinedStore: CombinedAuthStore = {
    ...legacyAuthStore,
    firebaseAuth: firebaseAuthStore,
    logout: enhancedLogout
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