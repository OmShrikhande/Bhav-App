import { 
  db, 
  usersCollection, 
  ratesCollection, 
  transactionsCollection, 
  notificationsCollection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from '@/config/firebaseConfig';
import { User, UserProfile } from '@/store/firebase-auth-store';

/**
 * Firestore service for handling database operations
 */
export const firestoreService = {
  /**
   * Create a new user in Firestore
   * @param userId Firebase Auth UID
   * @param userData User data to store
   */
  createUser: async (userId: string, userData: UserProfile): Promise<void> => {
    try {
      const userRef = doc(usersCollection, userId);
      
      // Create a clean object without undefined values
      const cleanUserData: Record<string, any> = {};
      
      // Copy all defined values from userData to cleanUserData
      Object.keys(userData).forEach(key => {
        if (userData[key as keyof UserProfile] !== undefined) {
          cleanUserData[key] = userData[key as keyof UserProfile];
        }
      });
      
      // Add server timestamp for createdAt and ensure required fields
      await setDoc(userRef, {
        ...cleanUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        // Ensure these fields are never undefined
        state: cleanUserData.state || "",
        city: cleanUserData.city || "",
        role: cleanUserData.role || "customer",
        email: cleanUserData.email
      });
      
      console.log('User created in Firestore with ID:', userId);
    } catch (error) {
      console.error('Error creating user in Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Get user data from Firestore
   * @param userId Firebase Auth UID
   */
  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const userRef = doc(usersCollection, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        return {
          ...userData,
          id: userId,
          firebaseUid: userId
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user from Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Get user by email
   * @param email User email
   */
  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const q = query(usersCollection, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as User;
        return {
          ...userData,
          id: userDoc.id,
          firebaseUid: userDoc.id
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by email from Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Update user data in Firestore
   * @param userId Firebase Auth UID
   * @param userData User data to update
   */
  updateUser: async (userId: string, userData: Partial<UserProfile>): Promise<void> => {
    try {
      const userRef = doc(usersCollection, userId);
      
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      
      console.log('User updated in Firestore with ID:', userId);
    } catch (error) {
      console.error('Error updating user in Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Get all sellers
   */
  getSellers: async (): Promise<User[]> => {
    try {
      const q = query(usersCollection, where("role", "==", "seller"), where("isActive", "==", true));
      const querySnapshot = await getDocs(q);
      
      const sellers: User[] = [];
      querySnapshot.forEach((doc) => {
        const sellerData = doc.data() as User;
        sellers.push({
          ...sellerData,
          id: doc.id,
          firebaseUid: doc.id
        });
      });
      
      return sellers;
    } catch (error) {
      console.error('Error getting sellers from Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Get all customers for a seller
   * @param sellerId Seller ID
   */
  getCustomersForSeller: async (sellerId: string): Promise<User[]> => {
    try {
      const q = query(usersCollection, where("sellerId", "==", sellerId), where("isActive", "==", true));
      const querySnapshot = await getDocs(q);
      
      const customers: User[] = [];
      querySnapshot.forEach((doc) => {
        const customerData = doc.data() as User;
        customers.push({
          ...customerData,
          id: doc.id,
          firebaseUid: doc.id
        });
      });
      
      return customers;
    } catch (error) {
      console.error('Error getting customers for seller from Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Get latest rates
   */
  getLatestRates: async () => {
    try {
      const q = query(ratesCollection);
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Sort by timestamp and get the latest
        const rates = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => b.timestamp - a.timestamp);
        
        return rates[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error getting latest rates from Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Add a new rate
   * @param rateData Rate data
   */
  addRate: async (rateData: any) => {
    try {
      const rateRef = doc(ratesCollection);
      
      await setDoc(rateRef, {
        ...rateData,
        timestamp: serverTimestamp()
      });
      
      console.log('Rate added to Firestore with ID:', rateRef.id);
      return rateRef.id;
    } catch (error) {
      console.error('Error adding rate to Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Get notifications for a user
   * @param userId User ID
   */
  getNotificationsForUser: async (userId: string) => {
    try {
      const q = query(
        notificationsCollection, 
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      
      const notifications: any[] = [];
      querySnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return notifications.sort((a: any, b: any) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting notifications from Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Add a notification
   * @param notificationData Notification data
   */
  addNotification: async (notificationData: any) => {
    try {
      const notificationRef = doc(notificationsCollection);
      
      await setDoc(notificationRef, {
        ...notificationData,
        timestamp: serverTimestamp(),
        read: false
      });
      
      console.log('Notification added to Firestore with ID:', notificationRef.id);
      return notificationRef.id;
    } catch (error) {
      console.error('Error adding notification to Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   */
  markNotificationAsRead: async (notificationId: string) => {
    try {
      const notificationRef = doc(notificationsCollection, notificationId);
      
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      
      console.log('Notification marked as read in Firestore with ID:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read in Firestore:', error);
      throw error;
    }
  }
};