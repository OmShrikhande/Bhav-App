import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  FirebaseUser 
} from '@/config/firebaseConfig';

// Reserved admin username - this is the username that only admin can use
export const ADMIN_USERNAME = "vipin_bullion";

// Maximum number of buy requests for non-premium users
export const MAX_BUY_REQUESTS = 15;

// Maximum number of sellers a customer can add via referral codes
export const MAX_SELLER_REFERRALS = 15;

export interface User {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: 'admin' | 'seller' | 'customer' | 'buyer';
  city: string | undefined;
  state: string | undefined;
  phone?: string;
  address?: string;
  profileImage?: string;
  brandName?: string;
  about?: string;
  whatsappNumber?: string;
  instagramHandle?: string;
  location?: string;
  catalogueImages?: string[]; 
  referralCode?: string;
  sellerId?: string;
  catalogue: any;
  sellerVerified: any;
  isPremium: any;
  buyRequestCount: number;
  isActive: boolean;
  createdAt: number;
  premiumPlan?: string;
  username?: string;
  brandImage?: string;
  sellerPlan?: string;
  firebaseUid: string; // Add Firebase UID to link with Firebase Auth
}

export interface UserProfile {
  name?: string;
  fullName?: string;
  email: string;
  role: 'admin' | 'seller' | 'customer' | 'buyer';
  city?: string;
  state?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  brandName?: string;
  about?: string;
  whatsappNumber?: string;
  instagramHandle?: string;
  location?: string;
  catalogueImages?: string[];
  referralCode?: string;
  sellerId?: string;
  sellerVerified?: boolean;
  isPremium?: boolean;
  buyRequestCount?: number;
  isActive?: boolean;
  createdAt?: number;
  premiumPlan?: string;
  username?: string;
  brandImage?: string;
  sellerPlan?: string;
}

export type FirebaseAuthState = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Firebase Auth methods
  signUp: (email: string, password: string, profile: UserProfile) => Promise<{ success: boolean; error?: string; userId?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logOut: () => Promise<{ success: boolean; error?: string }>;
  
  // User profile methods
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  
  // State management
  setError: (error: string | null) => void;
  clearError: () => void;
};

export const useFirebaseAuthStore = create<FirebaseAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      signUp: async (email, password, profile) => {
        set({ isLoading: true, error: null });
        
        try {
          // Import firestoreService here to avoid circular dependencies
          const { firestoreService } = await import('@/services/firestore');
          
          // Create user in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Create user profile with default values for required fields
          const newUser: User = {
            id: firebaseUser.uid,
            firebaseUid: firebaseUser.uid,
            email: email,
            role: profile.role || 'customer',
            name: profile.name || '',
            fullName: profile.fullName || profile.name || '',
            city: profile.city || '',
            state: profile.state || '', // Ensure state is never undefined
            phone: profile.phone || '',
            address: profile.address || '',
            profileImage: profile.profileImage || '',
            brandName: profile.brandName || '',
            sellerVerified: profile.role === 'admin',
            isPremium: profile.isPremium || false,
            buyRequestCount: 0,
            isActive: true,
            createdAt: Date.now(),
            catalogue: null,
            username: profile.username || '',
            referralCode: profile.referralCode || '',
            about: profile.about || '',
            whatsappNumber: profile.whatsappNumber || '',
            instagramHandle: profile.instagramHandle || '',
            location: profile.location || '',
            catalogueImages: profile.catalogueImages || [],
            sellerId: profile.sellerId || '',
            premiumPlan: profile.premiumPlan || '',
            brandImage: profile.brandImage || '',
            sellerPlan: profile.sellerPlan || ''
          };
          
          // Save user data to Firestore
          await firestoreService.createUser(firebaseUser.uid, newUser);
          
          // Update state with new user
          set({
            user: newUser,
            firebaseUser: firebaseUser,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true, userId: newUser.id };
        } catch (error: any) {
          console.error('Signup error:', error);
          
          // Format user-friendly error messages for common Firebase errors
          let errorMessage = 'Failed to sign up';
          
          if (error.code) {
            switch (error.code) {
              case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered. Please use a different email or try logging in.';
                break;
              case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
              case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please use a stronger password.';
                break;
              case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your internet connection and try again.';
                break;
              default:
                errorMessage = error.message || 'Failed to sign up';
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ 
            isLoading: false, 
            error: errorMessage
          });
          
          return { success: false, error: errorMessage };
        }
      },
      
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // Import firestoreService here to avoid circular dependencies
          const { firestoreService } = await import('@/services/firestore');
          
          // Sign in with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Fetch user data from Firestore
          let userData: User | null = null;
          
          try {
            userData = await firestoreService.getUserById(firebaseUser.uid);
          } catch (firestoreError) {
            console.error('Error fetching user data from Firestore:', firestoreError);
          }
          
          // If no user data in Firestore, try to get from AsyncStorage
          if (!userData) {
            try {
              const storedData = await AsyncStorage.getItem('firebase-auth-storage');
              if (storedData) {
                const parsedData = JSON.parse(storedData);
                if (parsedData.state && parsedData.state.user) {
                  userData = parsedData.state.user;
                }
              }
            } catch (storageError) {
              console.error('Error retrieving user data from storage:', storageError);
            }
          }
          
          // If still no user data, create a basic user object
          if (!userData) {
            userData = {
              id: firebaseUser.uid,
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email || email,
              role: 'customer', // Default role
              city: undefined,
              state: undefined,
              name: firebaseUser.displayName || '',
              fullName: firebaseUser.displayName || '',
              sellerVerified: false,
              isPremium: false,
              buyRequestCount: 0,
              isActive: true,
              createdAt: Date.now(),
              catalogue: null
            };
            
            // Save this basic user to Firestore
            try {
              await firestoreService.createUser(firebaseUser.uid, userData);
            } catch (createError) {
              console.error('Error creating user in Firestore during sign in:', createError);
            }
          }
          
          // Make sure the Firebase UID is set correctly
          userData.firebaseUid = firebaseUser.uid;
          
          // Update state with signed in user
          set({
            user: userData,
            firebaseUser: firebaseUser,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error: any) {
          console.error('Sign in error:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to sign in' 
          });
          return { success: false, error: error.message || 'Failed to sign in' };
        }
      },
      
      logOut: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Sign out from Firebase Auth
          await signOut(auth);
          
          // Clear user state
          set({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false
          });
          
          return { success: true };
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to log out' 
          });
          return { success: false, error: error.message || 'Failed to log out' };
        }
      },
      
      updateUserProfile: async (profile) => {
        const { user } = get();
        
        if (!user) {
          return { success: false, error: 'User not authenticated' };
        }
        
        try {
          // Import firestoreService here to avoid circular dependencies
          const { firestoreService } = await import('@/services/firestore');
          
          // Update user profile in Firestore
          await firestoreService.updateUser(user.id, profile);
          
          // Update user profile in state
          const updatedUser = {
            ...user,
            ...profile,
          };
          
          // Update state with updated user
          set({ user: updatedUser });
          
          return { success: true };
        } catch (error: any) {
          console.error('Error updating user profile:', error);
          set({ error: error.message || 'Failed to update profile' });
          return { success: false, error: error.message || 'Failed to update profile' };
        }
      },
      
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'firebase-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);