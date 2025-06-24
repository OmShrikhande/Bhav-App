import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  catalogueImages?: string[]; // Add this line
  referralCode?: string;
  sellerId?: string;
  catalogue: ReactNode;
  sellerVerified: any;
  isPremium: any;
  buyRequestCount: number;
  isActive: boolean;
  createdAt: number;
  premiumPlan?: string; // Added to fix compile error
  username?: string; // Added to fix compile error
  brandImage?: string; // Add this line
  sellerPlan?: string; // Add this line
}


// Define a type for the mock user that includes password
interface MockUser extends User {
  isPremium: any;
  city: any;
  state: any;
  sellerTier: any;
  isEmailVerified: any;
  username: any;
  password: string;
  premiumPlan?: string; // Added to fix compile error
  sellerVerified: any; // Changed to required to match User interface
  updatedAt?: number; // Added to fix compile error for updatedAt

}


// Define notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'user_signup' | 'seller_signup' | 'customer_signup' | 'transaction' | 'system' | 'alert' | 'user_deletion' | 'email_verification' | 'contact_request' | 'referral' | 'role_change' | 'payment_success' | 'rate_interest' | 'buy_request' | 'buy_request_accepted' | 'buy_request_declined';
  recipientId?: string; // ID of the user this notification is for (null/undefined for all/admin)
  data?: any;
}


// Define referral code interface
export interface ReferralCode {
  id: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  isUsed: boolean;
  usedBy?: string; // User ID who used this code
  usedAt?: number; // When the code was used
}


// Define seller referral interface
export interface SellerReferral {
  id: string;
  customerId: string;
  sellerId: string;
  referralCode: string;
  addedAt: number;
}


// Define contacted seller interface
export interface ContactedSeller {
  sellerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCity?: string;
  customerState?: string;
  timestamp: number;
}

// // Define metal rate interface
// export interface MetalRate {
//   id: string;
//   sellerId: string;
//   metalType: 'gold' | 'silver';
//   weight: string;
//   weightUnit: 'g' | 'kg';
//   rate: number;
//   image?: string;
//   createdAt: number;
//   updatedAt: number;
// }


// Define rate interest interface
export interface RateInterest {
  id: string;
  rateId: string;
  customerId: string;
  sellerId: string;
  timestamp: number;
}

// Define inventory item interface
export interface InventoryItem {
  image: any;
  isBuyPremiumEnabled: boolean;
  isSellPremiumEnabled: boolean;
  productType: string;
  sellPremium: any;
  buyPremium: any;
  id: string;
  sellerId: string;
  productName: string;
  description?: string;
  price: number;
  quantity: number;
  isVisible: boolean;
  createdAt: number;
  updatedAt: number;
}

// Define buy request interface
export interface BuyRequest {
  id: string;
  itemId: string;
  customerId: string;
  sellerId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  updatedAt: number;
}


// Add this interface in auth-store.ts
export interface BuyRequestStatus {
  [requestId: string]: {
    status: 'accepted' | 'declined';
    timestamp: number;
  };
}


export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  adminUsernameRegistered: boolean;
  users: MockUser[];
  notifications: Notification[];
  unreadNotificationsCount: number;
  contactedDealers: string[]; // Array of dealer IDs that the user has contacted
  contactedSellerDetails: ContactedSeller[]; // Array of detailed contact records
  isPremiumUser: boolean; // Added isPremiumUser to the state
  referralCodes: ReferralCode[]; // Added referral codes array
  sellerReferrals: SellerReferral[]; // Added seller referrals array
  rateInterests: RateInterest[]; // Added rate interests array
  inventoryItems: InventoryItem[]; // Added inventory items array
  buyRequests: BuyRequest[]; // Added buy requests array
  buyRequestStatuses: BuyRequestStatus;
  selectedSeller?: User | null;
  setSelectedSeller: (seller: User | null) => void;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (userData: Partial<User>, password: string) => { success: boolean; error?: string; userId?: string };
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  isAdminUsername: (username: string) => boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getUserByEmail: (email: string) => MockUser | undefined;
  getUserById: (id: string) => User | undefined;
  contactDealer: (dealerId: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
  getUnreadNotificationsCountForUser: (userId: string) => number;
  generateReferralCode: () => string;
  getReferralStats: () => { total: number; active: number; used: number };
  applyReferralCode: (code: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  getSellerCount: () => number;
  getCustomerCount: () => number;
  getContactedSellerDetails: () => ContactedSeller[];
  getCustomersForSeller: (sellerId: string) => ContactedSeller[];
  // Inventory functions
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; itemId?: string }>;
  updateInventoryItem: (item: Partial<InventoryItem> & { id: string }) => Promise<{ success: boolean; error?: string }>;
  deleteInventoryItem: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  toggleInventoryItemVisibility: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  getInventoryItemsForSeller: (sellerId: string) => InventoryItem[];
  getAllInventoryItems: () => InventoryItem[];
  // Buy request functions
  createBuyRequest: (itemId: string, customerId: string, sellerId: string) => Promise<{ success: boolean; error?: string; requestId?: string; limitReached?: boolean }>;
  acceptBuyRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  declineBuyRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  getBuyRequestsForSeller: (sellerId: string) => BuyRequest[];
  getBuyRequestsForCustomer: (customerId: string) => BuyRequest[];
  getAllBuyRequests: () => BuyRequest[];
  getBuyRequestById: (requestId: string) => BuyRequest | undefined;
  // Buy request limit functions
  getUserBuyRequestCount: (userId: string) => number;
  hasReachedBuyRequestLimit: (userId: string) => boolean;
  incrementUserBuyRequestCount: (userId: string) => Promise<{ success: boolean; error?: string }>;
  resetUserBuyRequestCount: (userId: string) => Promise<{ success: boolean; error?: string }>;
  // Seller referral code functions
  generateSellerReferralCode: (sellerId: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  getSellerByReferralCode: (code: string) => User | undefined;
  addSellerReferral: (customerId: string, sellerId: string, referralCode: string) => Promise<{ success: boolean; error?: string }>;
  getSellerReferralsForCustomer: (customerId: string) => SellerReferral[];
  hasReachedSellerReferralLimit: (customerId: string) => boolean;
  removeSellerReferral: (referralId: string) => Promise<{ success: boolean; error?: string }>;

  setBuyRequestStatus: (requestId: string, status: 'accepted' | 'declined') => void;
  getBuyRequestStatus: (requestId: string) => 'accepted' | 'declined' | null;
}


// Initial mock user data for testing
const initialMockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Vipin Soni',
    fullName: 'Vipin Soni',
    email: 'vipin@gmail.com',
    password: 'password@123',
    role: 'admin',
    city: 'Noida',
    state: 'Uttar Pradesh',
    phone: '+91 9876543214',
    address: 'Sector 62, Noida',
    username: 'vipin_bullion',
    isEmailVerified: true,
    buyRequestCount: 0,
    isPremium: undefined,
    sellerTier: undefined,
    isActive: true,
    createdAt: 0,
    sellerVerified: true,
    catalogue: undefined
  },
  {
    id: '2',
    name: 'Dev Soni',
    fullName: 'Dev Soni',
    email: 'dev@gmail.com',
    password: 'password@123',
    role: 'customer',
    city: 'Noida',
    state: 'Uttar Pradesh',
    phone: '+91 9876543214',
    address: 'Sector 62, Noida',
    username: 'dev_soni',
    isEmailVerified: true,
    buyRequestCount: 0,
    isPremium: false,
    sellerTier: undefined,
    isActive: true,
    createdAt: Date.now() - 86400000, // 1 day ago
    sellerVerified: undefined,
    catalogue: undefined
  },
  {
    id: '3',
    name: 'Rahul Jewellers',
    fullName: 'Rahul Sharma',
    email: 'seller@gmail.com',
    password: 'password@123',
    role: 'seller',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '+91 9876543210',
    address: 'Zaveri Bazaar, Mumbai',
    username: 'rahul_jewellers',
    isEmailVerified: true,
    buyRequestCount: 0,
    isPremium: true,
    sellerTier: 2,
    isActive: true,
    createdAt: Date.now() - 604800000, // 1 week ago
    sellerVerified: true,
    catalogue: undefined,
    brandName: 'Rahul Jewellers',
    referralCode: 'RJ3RAH',
    about: 'Specializing in gold and silver bullion with competitive rates',
    whatsappNumber: '+91 9876543210',
    instagramHandle: 'rahul_jewellers_official'
  },
  {
    id: '4',
    name: 'Priya Gold',
    fullName: 'Priya Patel',
    email: 'buyer@gmail.com',
    password: 'password@123',
    role: 'buyer',
    city: 'Delhi',
    state: 'Delhi',
    phone: '+91 9876543211',
    address: 'Chandni Chowk, Delhi',
    username: 'priya_gold',
    isEmailVerified: true,
    buyRequestCount: 5,
    isPremium: false,
    sellerTier: undefined,
    isActive: true,
    createdAt: Date.now() - 172800000, // 2 days ago
    sellerVerified: undefined,
    catalogue: undefined
  }
];

// Initial notifications
const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Admin Dashboard',
    message: 'Welcome to Bhav admin dashboard. You can manage users, view analytics, and monitor transactions here.',
    timestamp: Date.now() - 3600000, // 1 hour ago
    read: false,
    type: 'system',
  },
  {
    id: '2',
    title: 'System Update',
    message: 'The system has been updated to version 1.2.0 with new features and improvements.',
    timestamp: Date.now() - 86400000, // 1 day ago
    read: false,
    type: 'system',
  }
];

// Initial referral codes
const initialReferralCodes: ReferralCode[] = [];

// Initial seller referrals
const initialSellerReferrals: SellerReferral[] = [];

// Initial rate interests
const initialRateInterests: RateInterest[] = [];

// Initial inventory items
const initialInventoryItems: InventoryItem[] = [
  {
    id: '1',
    sellerId: '3', // Rahul Jewellers
    productName: '24K Gold Bar - 10g',
    description: 'Pure 24 karat gold bar, 10 grams, with certification',
    price: 65000,
    quantity: 10,
    isVisible: true,
    createdAt: Date.now() - 432000000, // 5 days ago
    updatedAt: Date.now() - 86400000, // 1 day ago
    image: 'https://example.com/gold-bar.jpg',
    productType: 'Gold',
    isBuyPremiumEnabled: false,
    isSellPremiumEnabled: true,
    sellPremium: 2.5,
    buyPremium: 0
  },
  {
    id: '2',
    sellerId: '3', // Rahul Jewellers
    productName: 'Silver Coin - 50g',
    description: '999 Fine Silver commemorative coin, 50 grams',
    price: 4500,
    quantity: 25,
    isVisible: true,
    createdAt: Date.now() - 345600000, // 4 days ago
    updatedAt: Date.now() - 172800000, // 2 days ago
    image: 'https://example.com/silver-coin.jpg',
    productType: 'Silver',
    isBuyPremiumEnabled: true,
    isSellPremiumEnabled: true,
    sellPremium: 3,
    buyPremium: 1.5
  },
  {
    id: '3',
    sellerId: '3', // Rahul Jewellers
    productName: '22K Gold Coin - 8g',
    description: '22 karat gold coin with religious motif, 8 grams',
    price: 48000,
    quantity: 15,
    isVisible: true,
    createdAt: Date.now() - 259200000, // 3 days ago
    updatedAt: Date.now() - 86400000, // 1 day ago
    image: 'https://example.com/gold-coin.jpg',
    productType: 'Gold',
    isBuyPremiumEnabled: true,
    isSellPremiumEnabled: true,
    sellPremium: 2,
    buyPremium: 1
  }
];

// Initial buy requests
const initialBuyRequests: BuyRequest[] = [
  {
    id: '1',
    itemId: '1', // 24K Gold Bar
    customerId: '2', // Dev Soni (customer)
    sellerId: '3', // Rahul Jewellers
    status: 'pending',
    createdAt: Date.now() - 43200000, // 12 hours ago
    updatedAt: Date.now() - 43200000
  },
  {
    id: '2',
    itemId: '2', // Silver Coin
    customerId: '4', // Priya Gold (buyer)
    sellerId: '3', // Rahul Jewellers
    status: 'accepted',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 43200000 // 12 hours ago
  },
  {
    id: '3',
    itemId: '3', // 22K Gold Coin
    customerId: '4', // Priya Gold (buyer)
    sellerId: '3', // Rahul Jewellers
    status: 'declined',
    createdAt: Date.now() - 129600000, // 1.5 days ago
    updatedAt: Date.now() - 86400000 // 1 day ago
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      adminUsernameRegistered: true, // Set to true since we now have a pre-defined admin
      users: initialMockUsers, // Initialize with mock users
      notifications: initialNotifications, // Initialize with mock notifications
      unreadNotificationsCount: initialNotifications.filter(n => !n.read).length,
      contactedDealers: [], // Initialize with empty array
      contactedSellerDetails: [], // Initialize with empty array for detailed contact records
      isPremiumUser: false, // Initialize isPremiumUser as false
      referralCodes: initialReferralCodes, // Initialize with empty array
      sellerReferrals: initialSellerReferrals, // Initialize with empty array
      rateInterests: initialRateInterests, // Initialize with empty array
      inventoryItems: initialInventoryItems, // Initialize with mock inventory items
      buyRequests: initialBuyRequests, // Initialize with empty array
      buyRequestStatuses: {} as BuyRequestStatus,
      selectedSeller: null,
      setSelectedSeller: (seller: User | null) => set({ selectedSeller: seller }),

      isAdminUsername: (username: string) => {
        return username === ADMIN_USERNAME;
      },

      getUserByEmail: (email: string) => {
        return get().users.find(u => u.email === email);
      },

      getUserById: (id: string) => {
        const user = get().users.find(u => u.id === id);
        if (user) {
          // Return user without password
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
        return undefined;
      },

      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          // Remove password from user object before storing
          const { password: pwd, ...userWithoutPassword } = user;

          // Check if this is the admin username and update adminUsernameRegistered if needed
          if (user.username === ADMIN_USERNAME) {
            set({
              adminUsernameRegistered: true
            });
          }

          set({
            user: userWithoutPassword,
            isAuthenticated: true,
            token: 'mock-jwt-token',
            isPremiumUser: !!user.isPremium, // Set isPremiumUser based on user data
          });
          return { success: true };
        }

        return {
          success: false,
          error: "Invalid email or password."
        };
      },

      signup: (userData, password) => {
        // Check if username is the reserved admin username
        if (userData.username === ADMIN_USERNAME) {
          // Check if admin username is already registered
          if (get().adminUsernameRegistered || get().users.some(u => u.username === ADMIN_USERNAME)) {
            return {
              success: false,
              error: "This admin username is already registered and cannot be used again."
            };
          }

          // If not registered yet, allow it but set the role to admin
          userData.role = 'admin';
        }

        // Check if email or username already exists in the persisted users array
        const existingUser = get().users.find(
          (u) => u.email === userData.email || u.username === userData.username
        );

        if (existingUser) {
          return {
            success: false,
            error: existingUser.email === userData.email
              ? "Email already in use."
              : "Username already taken."
          };
        }

        // Set sellerTier if the role is seller
        const sellerTier = userData.role === 'seller' ? 2 : undefined;

        // Create new user
        const newUser: MockUser = {
          id: String(get().users.length + 1),
          name: userData.name || '',
          fullName: userData.fullName || userData.name || '',
          email: userData.email || '',
          password,
          role: userData.role || 'customer',
          city: userData.city,
          state: userData.state,
          phone: userData.phone,
          address: userData.address,
          profileImage: userData.profileImage,
          username: userData.username || '',
          brandName: userData.brandName,
          sellerTier,
          sellerVerified: userData.role === 'admin',
          isEmailVerified: true,
          isPremium: userData.isPremium || false,
          premiumPlan: userData.premiumPlan,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          buyRequestCount: 0,
          isActive: false,
          catalogue: undefined
        };

        // Generate referral code for seller
        if (newUser.role === 'seller') {
          if (newUser.phone) {
            let referralCode = newUser.phone
              .replace(/^\+91\s?/, '')
              .replace(/\s/g, '')
              .replace(/-/g, '')
              .replace(/\(/g, '')
              .replace(/\)/g, '');

            const existingUser = get().users.find(u => u.referralCode === referralCode);
            if (existingUser) {
              return {
                success: false,
                error: "A seller with this phone number already exists. Please use a different phone number."
              };
            }

            newUser.referralCode = referralCode;
          } else {
            return {
              success: false,
              error: "Phone number is required for sellers to generate referral code."
            };
          }
        }

        // Add to persisted users array
        const updatedUsers = [...get().users, newUser];

        // If this is the admin username, mark it as registered
        if (newUser.username === ADMIN_USERNAME) {
          set({
            adminUsernameRegistered: true,
            users: updatedUsers
          });
        } else {
          set({ users: updatedUsers });

          // Create notification based on user role
          if (newUser.role === 'seller') {
            get().addNotification({
              title: `New Seller Registration`,
              message: `${newUser.fullName} has registered as a seller.`,
              type: 'seller_signup',
              data: {
                user: {
                  id: newUser.id,
                  name: newUser.fullName,
                  email: newUser.email,
                  role: newUser.role,
                  city: newUser.city,
                  state: newUser.state,
                  phone: newUser.phone,
                  username: newUser.username,
                  brandName: newUser.brandName,
                  sellerTier: newUser.sellerTier,
                  isEmailVerified: newUser.isEmailVerified,
                  referralCode: newUser.referralCode
                }
              }
            });
          } else if (newUser.role === 'customer') {
            get().addNotification({
              title: `New Customer Registration`,
              message: `${newUser.fullName} has registered as a customer.`,
              type: 'customer_signup',
              data: {
                user: {
                  id: newUser.id,
                  name: newUser.fullName,
                  email: newUser.email,
                  role: newUser.role,
                  city: newUser.city,
                  state: newUser.state,
                  phone: newUser.phone,
                  username: newUser.username,
                  isEmailVerified: newUser.isEmailVerified
                }
              }
            });
          }
        }

        // For admin users, log them in automatically
        if (userData.role === 'admin' || userData.username === ADMIN_USERNAME) {
          const { password: adminPass, ...adminUserData } = newUser;

          set({
            user: {
              ...adminUserData,
              sellerVerified: adminUserData.sellerVerified ?? false
            },
            isAuthenticated: true,
            token: 'mock-jwt-token',
            isPremiumUser: !!adminUserData.isPremium,
          });
        }

        return { success: true, userId: newUser.id };
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          isPremiumUser: false, // Reset isPremiumUser on logout
          contactedDealers: [], // Reset contacted dealers on logout
          contactedSellerDetails: [], // Reset contacted seller details on logout
        });
      },

      updateUser: async (userData) => {
        let success = true;
        let error = undefined;

        try {
          // Get the current user
          const currentUser = get().user;

          // Create updated user data
          const updatedUserData = {
            ...userData,
            updatedAt: Date.now()
          };

          // Check if this is a role change from customer to seller
          const userToUpdate = get().users.find(u => u.id === (userData.id || (currentUser ? currentUser.id : '')));
          const isRoleChangeToSeller = userToUpdate &&
            userToUpdate.role === 'customer' &&
            userData.role === 'seller';

          // If there's a logged-in user, also update them in the users array
          if (currentUser) {
            const updatedUsers = get().users.map(u => {
              if (u.id === (userData.id || currentUser.id)) {
                // If role is changing to seller and no referral code exists, generate one
                if (isRoleChangeToSeller && !u.referralCode) {
                  const brandInitials = userData.brandName || u.brandName
                    ? ((userData.brandName || u.brandName) ? (userData.brandName || u.brandName)!.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 3) : (u?.name ?? '').substring(0, 3).toUpperCase())
                    : (u?.name ?? '').substring(0, 3).toUpperCase();

                  const userInitials = u.username.substring(0, 4).toUpperCase();
                  updatedUserData.referralCode = `${brandInitials}${u.id}${userInitials}`;
                }

                // Preserve the password when updating the user in the users array
                return { ...u, ...updatedUserData };
              }
              return u;
            });

            // Update the user in the state if it's the current user
            if (userData.id === currentUser.id || !userData.id) {
              const updatedUser = {
                ...currentUser,
                ...updatedUserData
              };

              set({
                user: updatedUser,
                users: updatedUsers,
                isPremiumUser: !!updatedUserData.isPremium || !!currentUser.isPremium, // Update isPremiumUser if changed
              });
            } else {
              set({ users: updatedUsers });
            }

            // If this is a role change from customer to seller, create a notification
            if (isRoleChangeToSeller && userToUpdate) {
              get().addNotification({
                title: "User Role Changed",
                message: `${userToUpdate.fullName || userToUpdate.name} has upgraded from customer to seller.`,
                type: "role_change",
                data: {
                  user: {
                    id: userToUpdate.id,
                    name: userToUpdate.fullName || userToUpdate.name,
                    email: userToUpdate.email,
                    role: 'seller',
                    city: userToUpdate.city,
                    state: userToUpdate.state,
                    phone: userToUpdate.phone,
                    brandName: userData.brandName || userToUpdate.brandName
                  },
                  previousRole: 'customer',
                  newRole: 'seller'
                }
              });
            }

          } else {
            // Just update the users array if no user is logged in
            const updatedUsers = get().users.map(u => {
              if (u.id === userData.id) {
                // If role is changing to seller and no referral code exists, generate one
                if (isRoleChangeToSeller && !u.referralCode) {
                  const brandInitials = userData.brandName || u.brandName
                    ? ((userData.brandName || u.brandName) ?? '').split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 3)
                    : (u?.name ?? '').substring(0, 3).toUpperCase();

                  const userInitials = u.username.substring(0, 4).toUpperCase();
                  updatedUserData.referralCode = `${brandInitials}${u.id}${userInitials}`;
                }

                return { ...u, ...updatedUserData };
              }
              return u;
            });

            set({ users: updatedUsers });

            // If this is a role change from customer to seller, create a notification
            if (isRoleChangeToSeller && userToUpdate) {
              get().addNotification({
                title: "User Role Changed",
                message: `${userToUpdate.fullName || userToUpdate.name} has upgraded from customer to seller.`,
                type: "role_change",
                data: {
                  user: {
                    id: userToUpdate.id,
                    name: userToUpdate.fullName || userToUpdate.name,
                    email: userToUpdate.email,
                    role: 'seller',
                    city: userToUpdate.city,
                    state: userToUpdate.state,
                    phone: userToUpdate.phone,
                    brandName: userData.brandName || userToUpdate.brandName
                  },
                  previousRole: 'customer',
                  newRole: 'seller'
                }
              });
            }
          }
        } catch (err) {
          console.error("Error updating user:", err);
          success = false;
          error = "Failed to update user profile";
        }

        return { success, error };
      },

      deleteUser: async (userId) => {
        // Check if user exists
        const userToDelete = get().users.find(u => u.id === userId);

        if (!userToDelete) {
          return {
            success: false,
            error: "User not found."
          };
        }

        // Check if trying to delete admin user
        if (userToDelete.role === 'admin') {
          return {
            success: false,
            error: "Admin users cannot be deleted."
          };
        }

        // Check if trying to delete currently logged in user
        if (get().user?.id === userId) {
          return {
            success: false,
            error: "Cannot delete your own account while logged in."
          };
        }

        try {
          // Remove user from users array
          const updatedUsers = get().users.filter(u => u.id !== userId);

          set({ users: updatedUsers });

          // Create notification about user deletion
          get().addNotification({
            title: `User Deleted`,
            message: `${userToDelete.fullName} (${userToDelete.role}) has been removed from the system.`,
            type: 'user_deletion',
            data: {
              user: {
                id: userToDelete.id,
                name: userToDelete.fullName,
                email: userToDelete.email,
                role: userToDelete.role
              }
            }
          });

          return { success: true };
        } catch (error) {
          console.error("Error deleting user:", error);
          return {
            success: false,
            error: "Failed to delete user from database."
          };
        }
      },

      // Notification functions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: Date.now(),
          read: false,
        };

        set((state) => {
          const updatedNotifications = [newNotification, ...state.notifications];

          // Only increment unread count if notification is for current user or has no recipient (global)
          const shouldIncrementUnread =
            !newNotification.recipientId || // Global notification
            (state.user && newNotification.recipientId === state.user.id); // For current user

          return {
            notifications: updatedNotifications,
            unreadNotificationsCount: shouldIncrementUnread
              ? state.unreadNotificationsCount + 1
              : state.unreadNotificationsCount
          };
        });
      },

      markNotificationAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          );

          // Only count unread notifications for current user or global ones
          const unreadCount = updatedNotifications.filter(n =>
            !n.read &&
            (!n.recipientId || (state.user && n.recipientId === state.user.id))
          ).length;

          return {
            notifications: updatedNotifications,
            unreadNotificationsCount: unreadCount
          };
        });
      },

      markAllNotificationsAsRead: () => {
        set((state) => {
          // Only mark notifications for current user or global ones as read
          const updatedNotifications = state.notifications.map(notification => {
            if (!notification.recipientId || (state.user && notification.recipientId === state.user.id)) {
              return { ...notification, read: true };
            }
            return notification;
          });

          return {
            notifications: updatedNotifications,
            unreadNotificationsCount: 0
          };
        });
      },

      deleteNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(
            notification => notification.id !== id
          );

          // Recalculate unread count for current user
          const unreadCount = updatedNotifications.filter(n =>
            !n.read &&
            (!n.recipientId || (state.user && n.recipientId === state.user.id))
          ).length;

          return {
            notifications: updatedNotifications,
            unreadNotificationsCount: unreadCount
          };
        });
      },

      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadNotificationsCount: 0
        });
      },

      // Get notifications for a specific user
      getNotificationsForUser: (userId) => {
        return get().notifications.filter(n =>
          !n.recipientId || // Global notifications
          n.recipientId === userId // User-specific notifications
        );
      },

      // Get unread notifications count for a specific user
      getUnreadNotificationsCountForUser: (userId) => {
        return get().notifications.filter(n =>
          !n.read &&
          (!n.recipientId || n.recipientId === userId)
        ).length;
      },

      // Get contacted seller details
      getContactedSellerDetails: () => {
        return get().contactedSellerDetails;
      },

      // Get customers for a specific seller
      getCustomersForSeller: (sellerId) => {
        return get().contactedSellerDetails.filter(contact =>
          contact.sellerId === sellerId
        );
      },

      // Dealer contact function
      contactDealer: (dealerId: string) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set((state) => {
          // Add dealer to contacted dealers list if not already contacted
          if (!state.contactedDealers.includes(dealerId)) {
            // Get dealer information
            const dealer = state.users.find(u => u.id === dealerId);
            if (!dealer) return state;

            // Create a new contact record
            const newContact: ContactedSeller = {
              sellerId: dealerId,
              customerName: currentUser.fullName || currentUser.name || '',
              customerEmail: currentUser.email,
              customerPhone: currentUser.phone,
              customerCity: currentUser.city,
              customerState: currentUser.state,
              timestamp: Date.now()
            };

            // Send notification to the seller
            get().addNotification({
              title: "New Customer Inquiry",
              message: `${currentUser.fullName || currentUser.name} is interested in your products and has requested your contact details.`,
              type: "contact_request",
              recipientId: dealerId, // This notification is for the seller
              data: {
                customer: {
                  id: currentUser.id,
                  name: currentUser.fullName || currentUser.name,
                  email: currentUser.email,
                  phone: currentUser.phone,
                  city: currentUser.city,
                  state: currentUser.state,
                  address: currentUser.address
                },
                dealer: {
                  id: dealer.id,
                  name: dealer.fullName || dealer.name,
                  email: dealer.email,
                  brandName: dealer.brandName,
                  phone: dealer.phone
                }
              }
            });

            // Send notification to admin
            get().addNotification({
              title: "New Dealer Contact",
              message: `${currentUser.fullName || currentUser.name} contacted ${dealer.fullName || dealer.name}.`,
              type: "contact_request",
              data: {
                customer: {
                  id: currentUser.id,
                  name: currentUser.fullName || currentUser.name,
                  email: currentUser.email,
                  phone: currentUser.phone,
                  city: currentUser.city,
                  state: currentUser.state,
                  address: currentUser.address
                },
                dealer: {
                  id: dealer.id,
                  name: dealer.fullName || dealer.name,
                  email: dealer.email,
                  brandName: dealer.brandName,
                  phone: dealer.phone
                }
              }
            });

            return {
              contactedDealers: [...state.contactedDealers, dealerId],
              contactedSellerDetails: [...state.contactedSellerDetails, newContact]
            };
          }

          return state;
        });
      },

      // Referral code functions
      generateReferralCode: () => {
        // Generate a random 8-character alphanumeric code
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Create a new referral code object
        const newReferralCode: ReferralCode = {
          id: Date.now().toString(),
          code,
          createdAt: Date.now(),
          expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days expiry
          isUsed: false
        };

        // Add to referral codes array
        set((state) => ({
          referralCodes: [...state.referralCodes, newReferralCode]
        }));

        return code;
      },

      // Get referral stats
      getReferralStats: () => {
        const referralCodes = get().referralCodes;
        const now = Date.now();

        return {
          total: referralCodes.length,
          active: referralCodes.filter(code => !code.isUsed && code.expiresAt > now).length,
          used: referralCodes.filter(code => code.isUsed).length
        };
      },

      // Apply referral code
      applyReferralCode: async (code, userId) => {
        const referralCodes = get().referralCodes;
        const now = Date.now();

        // Find the referral code
        const referralCode = referralCodes.find(rc => rc.code === code);

        // Check if code exists
        if (!referralCode) {
          return {
            success: false,
            error: "Invalid referral code."
          };
        }

        // Check if code is already used
        if (referralCode.isUsed) {
          return {
            success: false,
            error: "This referral code has already been used."
          };
        }

        // Check if code is expired
        if (referralCode.expiresAt < now) {
          return {
            success: false,
            error: "This referral code has expired."
          };
        }

        // Get the user
        const user = get().users.find(u => u.id === userId);
        if (!user) {
          return {
            success: false,
            error: "User not found."
          };
        }

        // Mark code as used
        const updatedReferralCodes = referralCodes.map(rc => {
          if (rc.id === referralCode.id) {
            return {
              ...rc,
              isUsed: true,
              usedBy: userId,
              usedAt: now
            };
          }
          return rc;
        });

        // Update user to premium
        const updatedUsers = get().users.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              isPremium: true,
              premiumPlan: "Referral Premium"
            };
          }
          return u;
        });

        // Update current user if it's the same user
        if (get().user?.id === userId) {
          const { password, ...userWithoutPassword } = user;
          set({
            user: {
              ...userWithoutPassword,
              isPremium: true,
              premiumPlan: "Referral Premium"
            },
            isPremiumUser: true
          });
        }

        // Update state
        set({
          referralCodes: updatedReferralCodes,
          users: updatedUsers
        });

        // Add notification about referral code usage
        get().addNotification({
          title: "Referral Code Used",
          message: `${user.fullName || user.name} used referral code ${code} and gained premium access.`,
          type: "referral",
          data: {
            user: {
              id: user.id,
              name: user.fullName || user.name,
              email: user.email
            },
            referralCode: code
          }
        });

        return { success: true };
      },

      // Get seller count
      getSellerCount: () => {
        return get().users.filter(user => user.role === 'seller').length;
      },

      // Get customer count
      getCustomerCount: () => {
        return get().users.filter(user => user.role === 'customer' || user.role === 'buyer').length;
      },

      // Inventory functions
      addInventoryItem: async (item) => {
        try {
          const newItem: InventoryItem = {
            ...item,
            id: Date.now().toString(),
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          set((state) => ({
            inventoryItems: [...state.inventoryItems, newItem]
          }));

          return { success: true, itemId: newItem.id };
        } catch (error) {
          console.error("Error adding inventory item:", error);
          return {
            success: false,
            error: "Failed to add inventory item."
          };
        }
      },

      updateInventoryItem: async (item) => {
        try {
          set((state) => {
            const updatedItems = state.inventoryItems.map(i => {
              if (i.id === item.id) {
                return {
                  ...i,
                  ...item,
                  updatedAt: Date.now()
                };
              }
              return i;
            });

            return { inventoryItems: updatedItems };
          });

          return { success: true };
        } catch (error) {
          console.error("Error updating inventory item:", error);
          return {
            success: false,
            error: "Failed to update inventory item."
          };
        }
      },

      deleteInventoryItem: async (itemId) => {
        try {
          set((state) => ({
            inventoryItems: state.inventoryItems.filter(item => item.id !== itemId)
          }));

          return { success: true };
        } catch (error) {
          console.error("Error deleting inventory item:", error);
          return {
            success: false,
            error: "Failed to delete inventory item."
          };
        }
      },

      toggleInventoryItemVisibility: async (itemId) => {
        try {
          set((state) => {
            const updatedItems = state.inventoryItems.map(item => {
              if (item.id === itemId) {
                return {
                  ...item,
                  isVisible: !item.isVisible,
                  updatedAt: Date.now()
                };
              }
              return item;
            });

            return { inventoryItems: updatedItems };
          });

          return { success: true };
        } catch (error) {
          console.error("Error toggling inventory item visibility:", error);
          return {
            success: false,
            error: "Failed to toggle inventory item visibility."
          };
        }
      },

      getInventoryItemsForSeller: (sellerId) => {
        return get().inventoryItems.filter(item => item.sellerId === sellerId);
      },

      getAllInventoryItems: () => {
        return get().inventoryItems;
      },

      // Buy request functions
      createBuyRequest: async (itemId, customerId, sellerId) => {
        try {
          // Check if this request already exists
          const existingRequest = get().buyRequests.find(
            request => request.itemId === itemId &&
              request.customerId === customerId &&
              request.status === 'pending'
          );

          if (existingRequest) {
            return {
              success: false,
              error: "You already have a pending request for this item."
            };
          }

          // Check if user has reached the buy request limit
          const user = get().users.find(u => u.id === customerId);
          if (!user) {
            return {
              success: false,
              error: "User not found."
            };
          }

          // If user is not premium and has reached the limit, return error with limitReached flag
          if (!user.isPremium && get().hasReachedBuyRequestLimit(customerId)) {
            return {
              success: false,
              error: "You have reached your free buy request limit. Please upgrade to premium for unlimited requests.",
              limitReached: true
            };
          }

          const newRequest: BuyRequest = {
            id: Date.now().toString(),
            itemId,
            customerId,
            sellerId,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          set((state) => ({
            buyRequests: [...state.buyRequests, newRequest]
          }));

          // Increment the user's buy request count if they're not premium
          if (!user.isPremium) {
            await get().incrementUserBuyRequestCount(customerId);
          }

          // Get customer and item details
          const customer = get().getUserById(customerId);
          const item = get().inventoryItems.find(i => i.id === itemId);
          const seller = get().getUserById(sellerId);

          if (customer && item && seller) {
            // Send notification to seller
            get().addNotification({
              title: "New Buy Request",
              message: `${customer.fullName || customer.name} wants to buy ${item.productName}.`,
              type: "buy_request",
              recipientId: sellerId,
              data: {
                requestId: newRequest.id,
                customer: {
                  id: customer.id,
                  name: customer.fullName || customer.name,
                  email: customer.email,
                  phone: customer.phone,
                  city: customer.city,
                  state: customer.state
                },
                item: {
                  id: item.id,
                  productName: item.productName,
                  sellPremium: item.sellPremium,
                  buyPremium: item.buyPremium
                },
                seller: {
                  id: seller.id,
                  name: seller.fullName || seller.name,
                  brandName: seller.brandName
                }
              }
            });
          }

          return { success: true, requestId: newRequest.id };
        } catch (error) {
          console.error("Error creating buy request:", error);
          return {
            success: false,
            error: "Failed to create buy request."
          };
        }
      },

      acceptBuyRequest: async (requestId) => {
        try {
          const request = get().buyRequests.find(r => r.id === requestId);

          if (!request) {
            return { success: false, error: "Buy request not found." };
          }

          if (request.status !== 'pending') {
            return { success: false, error: "This request has already been processed." };
          }

          // Update the request status
          set((state) => ({
            buyRequests: state.buyRequests.map(r =>
              r.id === requestId
                ? { ...r, status: 'accepted' as const, respondedAt: Date.now() }
                : r
            )
          }));

          // Set the persistent status
          get().setBuyRequestStatus(requestId, 'accepted');

          // Get customer, item, and seller details
          const customer = get().getUserById(request.customerId);
          const item = get().inventoryItems.find(i => i.id === request.itemId);
          const seller = get().getUserById(request.sellerId);

          if (customer && item && seller) {
            // Send notification to customer
            get().addNotification({
              title: "Buy Request Accepted",
              message: `${seller.brandName || seller.fullName || seller.name} has accepted your request to buy ${item.productName}.`,
              type: "buy_request_accepted",
              recipientId: customer.id,
              data: {
                requestId: request.id,
                customer: {
                  id: customer.id,
                  name: customer.fullName || customer.name
                },
                item: {
                  id: item.id,
                  productName: item.productName
                },
                seller: {
                  id: seller.id,
                  name: seller.fullName || seller.name,
                  brandName: seller.brandName,
                  phone: seller.phone,
                  email: seller.email
                }
              }
            });
          }

          return { success: true };
        } catch (error) {
          console.error("Error accepting buy request:", error);
          return { success: false, error: "Failed to accept buy request." };
        }
      },

      declineBuyRequest: async (requestId) => {
        try {
          const request = get().buyRequests.find(r => r.id === requestId);

          if (!request) {
            return { success: false, error: "Buy request not found." };
          }

          if (request.status !== 'pending') {
            return { success: false, error: "This request has already been processed." };
          }

          // Update the request status
          set((state) => ({
            buyRequests: state.buyRequests.map(r =>
              r.id === requestId
                ? { ...r, status: 'declined' as const, respondedAt: Date.now() }
                : r
            )
          }));

          // Set the persistent status
          get().setBuyRequestStatus(requestId, 'declined');

          // Get customer, item, and seller details
          const customer = get().getUserById(request.customerId);
          const item = get().inventoryItems.find(i => i.id === request.itemId);
          const seller = get().getUserById(request.sellerId);

          if (customer && item && seller) {
            // Send notification to customer
            get().addNotification({
              title: "Buy Request Declined",
              message: `${seller.brandName || seller.fullName || seller.name} has declined your request to buy ${item.productName}.`,
              type: "buy_request_declined",
              recipientId: customer.id,
              data: {
                requestId: request.id,
                customer: {
                  id: customer.id,
                  name: customer.fullName || customer.name
                },
                item: {
                  id: item.id,
                  productName: item.productName
                },
                seller: {
                  id: seller.id,
                  name: seller.fullName || seller.name,
                  brandName: seller.brandName
                }
              }
            });
          }

          return { success: true };
        } catch (error) {
          console.error("Error declining buy request:", error);
          return { success: false, error: "Failed to decline buy request." };
        }
      },

      getBuyRequestsForSeller: (sellerId) => {
        return get().buyRequests.filter(request => request.sellerId === sellerId);
      },

      getBuyRequestsForCustomer: (customerId) => {
        return get().buyRequests.filter(request => request.customerId === customerId);
      },

      getAllBuyRequests: () => {
        return get().buyRequests;
      },

      getBuyRequestById: (requestId) => {
        return get().buyRequests.find(request => request.id === requestId);
      },

      // Buy request limit functions
      getUserBuyRequestCount: (userId) => {
        const user = get().users.find(u => u.id === userId);
        return user?.buyRequestCount || 0;
      },

      hasReachedBuyRequestLimit: (userId) => {
        const count = get().getUserBuyRequestCount(userId);
        return count >= MAX_BUY_REQUESTS;
      },

      incrementUserBuyRequestCount: async (userId) => {
        try {
          set((state) => {
            const updatedUsers = state.users.map(u => {
              if (u.id === userId) {
                const currentCount = u.buyRequestCount || 0;
                return {
                  ...u,
                  buyRequestCount: currentCount + 1
                };
              }
              return u;
            });

            // Also update the current user if it's the same user
            if (state.user && state.user.id === userId) {
              return {
                users: updatedUsers,
                user: {
                  ...state.user,
                  buyRequestCount: (state.user.buyRequestCount || 0) + 1
                }
              };
            }

            return { users: updatedUsers };
          });

          return { success: true };
        } catch (error) {
          console.error("Error incrementing buy request count:", error);
          return {
            success: false,
            error: "Failed to update buy request count."
          };
        }
      },

      resetUserBuyRequestCount: async (userId) => {
        try {
          set((state) => {
            const updatedUsers = state.users.map(u => {
              if (u.id === userId) {
                return {
                  ...u,
                  buyRequestCount: 0
                };
              }
              return u;
            });

            // Also update the current user if it's the same user
            if (state.user && state.user.id === userId) {
              return {
                users: updatedUsers,
                user: {
                  ...state.user,
                  buyRequestCount: 0
                }
              };
            }

            return { users: updatedUsers };
          });

          return { success: true };
        } catch (error) {
          console.error("Error resetting buy request count:", error);
          return {
            success: false,
            error: "Failed to reset buy request count."
          };
        }
      },

      // Seller referral code functions
      generateSellerReferralCode: async (sellerId) => {
        try {
          const seller = get().users.find(u => u.id === sellerId);

          if (!seller) {
            return {
              success: false,
              error: "Seller not found."
            };
          }

          // Check if seller already has a referral code
          if (seller.referralCode) {
            return {
              success: true,
              code: seller.referralCode
            };
          }

          // Generate a 6-digit alphanumeric referral code
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let referralCode = '';

          // Generate 6 random characters
          for (let i = 0; i < 4; i++) {
            referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
          }

          // Ensure uniqueness by checking existing codes
          let isUnique = false;
          while (!isUnique) {
            const existingUser = get().users.find(u => u.referralCode === referralCode);
            if (!existingUser) {
              isUnique = true;
            } else {
              // Generate a new code if duplicate found
              referralCode = '';
              for (let i = 0; i < 4; i++) {
                referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
              }
            }
          }

          // Update the seller with the new referral code
          set((state) => {
            const updatedUsers = state.users.map(u => {
              if (u.id === sellerId) {
                return {
                  ...u,
                  referralCode
                };
              }
              return u;
            });

            // Also update the current user if it's the same user
            if (state.user && state.user.id === sellerId) {
              return {
                users: updatedUsers,
                user: {
                  ...state.user,
                  referralCode
                }
              };
            }


            return { users: updatedUsers };
          });

          return { success: true, code: referralCode };
        } catch (error) {
          console.error("Error generating seller referral code:", error);
          return {

            success: false,
            error: "Failed to generate referral code."
          };
        }
      },

      getSellerByReferralCode: (code) => {
        const seller = get().users.find(u => u.role === 'seller' && u.referralCode === code);

        if (seller) {
          // Return seller without password
          const { password, ...sellerWithoutPassword } = seller;
          return sellerWithoutPassword;
        }

        return undefined;
      },

      addSellerReferral: async (customerId, sellerId, referralCode) => {
        try {
          // Check if customer exists
          const customer = get().users.find(u => u.id === customerId);
          if (!customer) {
            return {
              success: false,
              error: "Customer not found."
            };
          }

          // Check if seller exists
          const seller = get().users.find(u => u.id === sellerId);
          if (!seller) {
            return {
              success: false,
              error: "Seller not found."
            };
          }

          // Check if the customer has already added the maximum number of sellers
          if (get().hasReachedSellerReferralLimit(customerId)) {
            return {
              success: false,
              error: `You have reached the maximum limit of ${MAX_SELLER_REFERRALS} sellers. Please remove one to add another.`
            };
          }

          // Create new seller referral
          const newReferral: SellerReferral = {
            id: Date.now().toString(),
            customerId,
            sellerId,
            referralCode,
            addedAt: Date.now()
          };

          // Add to seller referrals array
          set((state) => ({
            sellerReferrals: [...state.sellerReferrals, newReferral]
          }));

          // Add notification for seller
          get().addNotification({
            title: "New Referral Connection",
            message: `${customer.fullName || customer.name} has added you as a seller using your referral code.`,
            type: "referral",
            recipientId: sellerId,
            data: {
              customer: {
                id: customer.id,
                name: customer.fullName || customer.name,
                email: customer.email
              },
              referralCode
            }
          });

          return { success: true };
        } catch (error) {
          console.error("Error adding seller referral:", error);
          return {
            success: false,
            error: "Failed to add seller referral."
          };
        }
      },

      getSellerReferralsForCustomer: (customerId) => {
        return get().sellerReferrals.filter(ref => ref.customerId === customerId);
      },

      hasReachedSellerReferralLimit: (customerId) => {
        const referrals = get().sellerReferrals.filter(ref => ref.customerId === customerId);
        return referrals.length >= MAX_SELLER_REFERRALS;
      },

      removeSellerReferral: async (referralId) => {
        try {
          set((state) => ({
            sellerReferrals: state.sellerReferrals.filter(ref => ref.id !== referralId)
          }));

          return { success: true };
        } catch (error) {
          console.error("Error removing seller referral:", error);
          return {
            success: false,
            error: "Failed to remove seller referral."
          };
        }
      },

      // Buy request status functions
      setBuyRequestStatus: (requestId: string, status: 'accepted' | 'declined') => {
        set((state) => ({
          buyRequestStatuses: {
            ...state.buyRequestStatuses,
            [requestId]: {
              status,
              timestamp: Date.now()
            }
          }
        }));
      },

      getBuyRequestStatus: (requestId: string) => {
        const statusData = get().buyRequestStatuses[requestId];
        return statusData ? statusData.status : null;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


// clear cache func
const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage cleared');
  } catch (e) {
    console.error('Failed to clear AsyncStorage.', e);
  }
};

// clearAsyncStorage(); // Clear AsyncStorage on startup for testing purposes