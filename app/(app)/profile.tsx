import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Share,
  FlatList,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  CheckCircle, 
  ArrowUpCircle, 
  Store, 
  Check, 
  Copy, 
  Share2, 
  Menu, 
  Instagram, 
  Plus, 
  X, 
  Calendar, 
  Clock, 
  Shield, 
  Award, 
  Star, 
  Gift, 
  FileText, 
  Settings,
  Info,
  AlertCircle,
  HelpCircle,
  Bell
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useAuthStore } from "@/store/auth-store";
import { useAuth } from "@/context/auth-context";
import { firestoreService } from "@/services/firestore";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function ProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const { user: firebaseUser, firebaseAuth } = useAuth();
  const router = useRouter();
  const db = getFirestore();
  
  // Use Firebase user if available, otherwise fall back to legacy user
  const currentUser = firebaseUser || user;
  const [fullName, setFullName] = useState(currentUser?.fullName || currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [brandName, setBrandName] = useState(currentUser?.brandName || "");
  const [about, setAbout] = useState(currentUser?.about || "");
  const [profileImage, setProfileImage] = useState<string | null>(currentUser?.profileImage || null);
  const [brandImage, setBrandImage] = useState<string | null>(currentUser?.brandImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  // WhatsApp and Instagram
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser?.whatsappNumber || "");
  const [instagramHandle, setInstagramHandle] = useState(currentUser?.instagramHandle || "");
  const [location, setLocation] = useState(currentUser?.location || "");

  // Additional user details
  const [userDetails, setUserDetails] = useState<any>({
    joinDate: null,
    lastActive: null,
    transactions: [],
    notifications: [],
    accountStatus: 'Active',
    verificationStatus: false,
    referralCode: '',
    referralCount: 0
  });
  
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'activity', 'settings'

  // Add catalogue images state
  const [catalogueImages, setCatalogueImages] = useState<string[]>(() => {
    if (currentUser?.catalogueImages) {
      if (typeof currentUser.catalogueImages === 'string') {
        try {
          const parsedImages = JSON.parse(currentUser.catalogueImages);
          return Array.isArray(parsedImages) ? parsedImages : [];
        } catch (error) {
          console.error('Error parsing initial catalogue images:', error);
          return [];
        }
      } else if (Array.isArray(currentUser.catalogueImages)) {
        return currentUser.catalogueImages;
      }
    }
    return [];
  });

  // Function to fetch additional user details from Firebase
  const fetchUserDetails = async () => {
    if (!currentUser || !currentUser.id) return;
    
    setIsLoadingDetails(true);
    try {
      // Get user document from Firestore
      const userRef = doc(db, 'users', currentUser.id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Format dates
        const joinDate = userData.createdAt ? new Date(userData.createdAt.seconds * 1000) : null;
        const lastActive = userData.lastActive ? new Date(userData.lastActive.seconds * 1000) : null;
        
        // Get user's transactions
        const transactionsRef = collection(db, 'transactions');
        const transactionsQuery = query(
          transactionsRef, 
          where('userId', '==', currentUser.id),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const transactionsSnap = await getDocs(transactionsQuery);
        const transactions = transactionsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Get user's notifications
        const notificationsRef = collection(db, 'notifications');
        const notificationsQuery = query(
          notificationsRef,
          where('userId', '==', currentUser.id),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const notificationsSnap = await getDocs(notificationsQuery);
        const notifications = notificationsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Get referral information
        const referralCode = userData.referralCode || '';
        
        // Count referrals (users who used this referral code)
        let referralCount = 0;
        if (referralCode) {
          const referralsQuery = query(
            collection(db, 'users'),
            where('referredBy', '==', referralCode)
          );
          const referralsSnap = await getDocs(referralsQuery);
          referralCount = referralsSnap.size;
        }
        
        setUserDetails({
          joinDate,
          lastActive,
          transactions,
          notifications,
          accountStatus: userData.isActive ? 'Active' : 'Inactive',
          verificationStatus: userData.verified || false,
          referralCode,
          referralCount
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Update state when user changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setAddress(currentUser.address || "");
      setBrandName(currentUser.brandName || "");
      setAbout(currentUser.about || "");
      setProfileImage(currentUser.profileImage || null);
      setBrandImage(currentUser.brandImage || null);
      setWhatsappNumber(currentUser.whatsappNumber || "");
      setInstagramHandle(currentUser.instagramHandle || "");
      setLocation(currentUser.location || "");

      // Parse catalogue images properly
      if (currentUser.catalogueImages) {
        if (typeof currentUser.catalogueImages === 'string') {
          try {
            const parsedImages = JSON.parse(currentUser.catalogueImages);
            setCatalogueImages(Array.isArray(parsedImages) ? parsedImages : []);
          } catch (error) {
            console.error('Error parsing catalogue images:', error);
            setCatalogueImages([]);
          }
        } else if (Array.isArray(currentUser.catalogueImages)) {
          setCatalogueImages(currentUser.catalogueImages);
        } else {
          setCatalogueImages([]);
        }
      } else {
        setCatalogueImages([]);
      }
      
      // Fetch additional user details
      fetchUserDetails();
    }
  }, [currentUser]);

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Failed to pick image. Please try again.");
    }
  };

  // Function to pick brand image
  const pickBrandImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Wide aspect ratio like the live rates image
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setBrandImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking brand image:", err);
      setError("Failed to pick brand image. Please try again.");
    }
  };

  // Function to pick catalogue image
  const pickCatalogueImage = async () => {
    if (catalogueImages.length >= 8) {
      Alert.alert("Limit Reached", "You can only upload up to 8 catalogue images.");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0].uri;
        setCatalogueImages(prev => [...prev, newImage]);
      }
    } catch (err) {
      console.error("Error picking catalogue image:", err);
      setError("Failed to pick image. Please try again.");
    }
  };

  // Function to remove catalogue image
  const removeCatalogueImage = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    setCatalogueImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Create user data object with updated fields
      const userData = {
        fullName,
        name: fullName, // Update name to match fullName
        email,
        phone,
        address,
        profileImage: profileImage ?? undefined,
        brandImage: currentUser?.role === 'seller' ? (brandImage ?? undefined) : undefined,
        brandName: currentUser?.role === 'seller' ? brandName : undefined, // Only include brandName for sellers
        about: currentUser?.role === 'seller' ? about : undefined, // Only include about for sellers
        whatsappNumber: currentUser?.role === 'seller' ? whatsappNumber : undefined, // Only include whatsappNumber for sellers
        instagramHandle: currentUser?.role === 'seller' ? instagramHandle : undefined, // Only include instagramHandle for sellers
        location: currentUser?.role === 'seller' ? location : undefined, // Only include location for sellers
        catalogueImages: currentUser?.role === 'seller'
          ? (catalogueImages.length > 0 ? catalogueImages : undefined)
          : undefined, // Pass array directly
      };

      let result = { success: false, error: "" };

      // Try to update in Firestore first if we have a Firebase user
      if (firebaseUser && firebaseUser.id) {
        try {
          // Update in Firestore
          await firestoreService.updateUser(firebaseUser.id, userData);
          
          // Update in Firebase Auth store
          await firebaseAuth.updateUserProfile(userData);
          
          result = { success: true };
        } catch (error: any) {
          console.error("Error updating Firestore profile:", error);
          // Fall back to legacy update if Firestore fails
        }
      }
      
      // If Firestore update failed or we don't have a Firebase user, try legacy update
      if (!result.success && user) {
        result = await updateUser(userData);
      }

      if (result.success) {
        // Trigger haptic feedback on success
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);

        // Show success alert
        if (Platform.OS === 'web') {
          alert("Profile updated successfully!");
        } else {
          Alert.alert(
            "Profile Updated",
            "Your profile information has been updated successfully.",
            [{ text: "OK" }]
          );
        }
      } else {
        setError(result.error || "Failed to update profile. Please try again.");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to readable string
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.seconds) {
      // Firestore timestamp
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'number') {
      // Unix timestamp in milliseconds
      date = new Date(timestamp);
    } else {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  // Handle opening WhatsApp
  const openWhatsApp = () => {
    if (!whatsappNumber) return;
    
    let phoneNumber = whatsappNumber;
    // Remove any non-numeric characters
    phoneNumber = phoneNumber.replace(/\D/g, '');
    
    // Open WhatsApp with the phone number
    Linking.openURL(`https://wa.me/${phoneNumber}`);
  };
  
  // Handle opening Instagram
  const openInstagram = () => {
    if (!instagramHandle) return;
    
    // Try to open in Instagram app first
    Linking.canOpenURL('instagram://user?username=' + instagramHandle)
      .then(supported => {
        if (supported) {
          return Linking.openURL('instagram://user?username=' + instagramHandle);
        } else {
          // Fallback to browser
          return Linking.openURL('https://www.instagram.com/' + instagramHandle);
        }
      })
      .catch(err => console.error('Error opening Instagram:', err));
  };
  
  // Handle opening location
  const openLocation = () => {
    if (!location) return;
    
    Linking.openURL(location);
  };
  
  // Generate a referral code
  const generateReferralCode = async () => {
    if (!currentUser || !currentUser.id) return;
    
    try {
      setIsLoading(true);
      
      // Generate a random code
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Update user with the new referral code
      await firestoreService.updateUser(currentUser.id, {
        referralCode: code
      });
      
      // Update local state
      setUserDetails(prev => ({
        ...prev,
        referralCode: code
      }));
      
      Alert.alert('Success', 'Referral code generated successfully!');
    } catch (error) {
      console.error('Error generating referral code:', error);
      Alert.alert('Error', 'Failed to generate referral code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Share referral code
  const shareReferralCode = async () => {
    if (!userDetails.referralCode) return;
    
    try {
      await Share.share({
        message: `Join me on BHAV App using my referral code: ${userDetails.referralCode}`
      });
    } catch (error) {
      console.error('Error sharing referral code:', error);
    }
  };
  
  // Copy referral code to clipboard
  const copyReferralCode = async () => {
    if (!userDetails.referralCode) return;
    
    try {
      await Clipboard.setStringAsync(userDetails.referralCode);
      Alert.alert('Copied', 'Referral code copied to clipboard!');
    } catch (error) {
      console.error('Error copying referral code:', error);
    }
  };
  
  // Handle upgrade to seller
  const handleUpgradeToSeller = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Navigate to seller upgrade screen
    router.push("/seller-upgrade");
  };
  
  // Open drawer navigation
  const openDrawer = () => {
    router.push("/drawer");
  };
  
  // Handle logout
  const handleLogout = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    try {
      setIsLoading(true);
      
      // Logout from Firebase if available
      if (firebaseAuth) {
        await firebaseAuth.signOut();
      }
      
      // Clear local auth state
      router.push("/");
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use a placeholder image if no profile image is set
  const getProfileImage = () => {
    if (profileImage) {
      return profileImage;
    }
    return images.profilePlaceholder;
  };
  
  // Use a placeholder image if no brand image is set
  const getBrandImage = () => {
    if (brandImage) return brandImage;
  };

  // This function was removed to fix duplicate declaration
  
  

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={openDrawer}
        >
          <Menu size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
        >
          <Settings size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
          onPress={() => setActiveTab('profile')}
        >
          <User size={16} color={activeTab === 'profile' ? "#F3B62B" : "#666666"} />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'activity' && styles.activeTabButton]}
          onPress={() => setActiveTab('activity')}
        >
          <Clock size={16} color={activeTab === 'activity' ? "#F3B62B" : "#666666"} />
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Activity</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'settings' && styles.activeTabButton]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings size={16} color={activeTab === 'settings' ? "#F3B62B" : "#666666"} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Header Section */}
          <View style={styles.profileImageContainer}>
            {/* Brand Cover Image - Only for sellers */}
            {currentUser?.role === 'seller' && (
              <View style={styles.top}>
                {/* Show brand image if available, otherwise show brand name */}
                {brandImage ? (
                  <Image
                    source={{ uri: getBrandImage() }}
                    style={styles.brandCoverImage}
                    contentFit="cover"
                  />
                ) : (
                  /* Default brand name display when no image */
                  currentUser?.brandName && (
                    <Text style={styles.brandName}>{currentUser.brandName}</Text>
                  )
                )}

                {/* Camera button - always visible */}
                <TouchableOpacity
                  style={styles.brandCameraButton}
                  onPress={pickBrandImage}
                >
                  <Camera size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}



            {/* Profile Image - positioned over brand cover */}
            <View style={styles.profileImageWrapper}>
              <Image
                source={{ uri: getProfileImage() }}
                style={styles.profileImage}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={pickImage}
              >
                <Camera size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>{fullName}</Text>

            {currentUser?.role === 'admin' && (
              <Text style={styles.profileEmail}>{currentUser?.role}</Text>
            )}

            {/* Display seller badge if user is a seller */}
            {currentUser?.role === 'seller' && (
              <View style={styles.sellerBadge}>
                <Text style={styles.sellerBadgeText}>
                  Verified Seller
                </Text>
              </View>
            )}

            {/* Display upgrade to seller button if user is not a seller */}
            {currentUser?.role === 'customer' && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgradeToSeller}
              >
                <ArrowUpCircle size={16} color="#F3B62B" style={styles.upgradeIcon} />
                <Text style={styles.upgradeButtonText}>
                  Upgrade to Seller
                </Text>
              </TouchableOpacity>
            )}
          </View>


          {/* Conditional rendering based on active tab */}
          {activeTab === 'profile' && (
            <>
              {/* Account Information Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Text style={styles.infoCardTitle}>Account Information</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Calendar size={18} color="#F3B62B" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>
                      {isLoadingDetails ? 'Loading...' : formatDate(userDetails.joinDate)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Clock size={18} color="#F3B62B" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Last Active</Text>
                    <Text style={styles.infoValue}>
                      {isLoadingDetails ? 'Loading...' : formatDate(userDetails.lastActive)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Shield size={18} color="#F3B62B" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Account Status</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: userDetails.accountStatus === 'Active' ? '#E8F5E9' : '#FFEBEE' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: userDetails.accountStatus === 'Active' ? '#43A047' : '#E53935' }
                      ]}>
                        {userDetails.accountStatus}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {currentUser?.role === 'seller' && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Award size={18} color="#F3B62B" />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Seller Status</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: userDetails.verificationStatus ? '#E8F5E9' : '#FFF8E1' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: userDetails.verificationStatus ? '#43A047' : '#F3B62B' }
                        ]}>
                          {userDetails.verificationStatus ? 'Verified' : 'Pending Verification'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Referral Code Section */}
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Text style={styles.infoCardTitle}>Referral Program</Text>
                  {userDetails.referralCode && (
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={shareReferralCode}
                    >
                      <Share2 size={18} color="#1976D2" />
                    </TouchableOpacity>
                  )}
                </View>
                
                {userDetails.referralCode ? (
                  <>
                    <View style={styles.referralCodeDisplay}>
                      <Text style={styles.referralCodeText}>{userDetails.referralCode}</Text>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={copyReferralCode}
                      >
                        <Copy size={18} color="#1976D2" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Gift size={18} color="#F3B62B" />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Referrals</Text>
                        <Text style={styles.infoValue}>{userDetails.referralCount} users</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateReferralCode}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Gift size={18} color="#ffffff" style={{ marginRight: 8 }} />
                        <Text style={styles.generateButtonText}>Generate Referral Code</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                
                <Text style={styles.referralInfo}>
                  Share your referral code with friends and earn rewards when they join.
                </Text>
              </View>
              
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Personal Information</Text>
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            </>
          )}
          
          {activeTab === 'activity' && (
            <View style={styles.activityContainer}>
              {isLoadingDetails ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#F3B62B" />
                  <Text style={styles.loadingText}>Loading your activity...</Text>
                </View>
              ) : (
                <>
                  {/* Transactions Section */}
                  <View style={styles.activitySection}>
                    <Text style={styles.activitySectionTitle}>Recent Transactions</Text>
                    
                    {userDetails.transactions.length > 0 ? (
                      userDetails.transactions.map((transaction: any, index: number) => (
                        <View key={transaction.id || index} style={styles.transactionItem}>
                          <View style={styles.transactionHeader}>
                            <View style={[
                              styles.transactionIcon,
                              { backgroundColor: transaction.status === 'completed' ? '#E8F5E9' : 
                                transaction.status === 'pending' ? '#FFF8E1' : '#FFEBEE' }
                            ]}>
                              <FontAwesome 
                                name="money" 
                                size={16} 
                                color={transaction.status === 'completed' ? '#43A047' : 
                                  transaction.status === 'pending' ? '#F3B62B' : '#E53935'} 
                              />
                            </View>
                            <View style={styles.transactionInfo}>
                              <Text style={styles.transactionTitle}>
                                {transaction.type || 'Transaction'}
                              </Text>
                              <Text style={styles.transactionAmount}>
                                ₹{transaction.amount?.toFixed(2) || '0.00'}
                              </Text>
                            </View>
                            <Text style={styles.transactionDate}>
                              {formatTimestamp(transaction.timestamp)}
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <FileText size={40} color="#cccccc" />
                        <Text style={styles.emptyStateText}>No transactions yet</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Notifications Section */}
                  <View style={styles.activitySection}>
                    <Text style={styles.activitySectionTitle}>Recent Notifications</Text>
                    
                    {userDetails.notifications.length > 0 ? (
                      userDetails.notifications.map((notification: any, index: number) => (
                        <View key={notification.id || index} style={styles.notificationItem}>
                          <View style={styles.notificationHeader}>
                            <View style={[
                              styles.notificationIcon,
                              { backgroundColor: 
                                notification.type === 'alert' ? '#FFEBEE' :
                                notification.type === 'transaction' ? '#FFF8E1' : '#E8F5E9' 
                              }
                            ]}>
                              {notification.type === 'alert' ? (
                                <AlertCircle size={16} color="#E53935" />
                              ) : notification.type === 'transaction' ? (
                                <FontAwesome name="money" size={16} color="#F3B62B" />
                              ) : (
                                <Info size={16} color="#43A047" />
                              )}
                            </View>
                            <View style={styles.notificationInfo}>
                              <Text style={styles.notificationTitle}>
                                {notification.title || 'Notification'}
                              </Text>
                              <Text style={styles.notificationMessage}>
                                {notification.message}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.notificationDate}>
                            {formatTimestamp(notification.timestamp)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Bell size={40} color="#cccccc" />
                        <Text style={styles.emptyStateText}>No notifications yet</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>
          )}
          
          {activeTab === 'settings' && (
            <View style={styles.settingsContainer}>
              {/* Account Settings */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Account Settings</Text>
                
                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemIcon}>
                    <Shield size={20} color="#F3B62B" />
                  </View>
                  <View style={styles.settingsItemContent}>
                    <Text style={styles.settingsItemTitle}>Security</Text>
                    <Text style={styles.settingsItemDescription}>
                      Change password, enable 2FA
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemIcon}>
                    <Bell size={20} color="#F3B62B" />
                  </View>
                  <View style={styles.settingsItemContent}>
                    <Text style={styles.settingsItemTitle}>Notifications</Text>
                    <Text style={styles.settingsItemDescription}>
                      Manage notification preferences
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemIcon}>
                    <HelpCircle size={20} color="#F3B62B" />
                  </View>
                  <View style={styles.settingsItemContent}>
                    <Text style={styles.settingsItemTitle}>Help & Support</Text>
                    <Text style={styles.settingsItemDescription}>
                      Contact us, FAQs, report issues
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'profile' && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Personal Information</Text>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9e9e9e"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>


            {/* Brand Name field - only visible for sellers */}
            {user?.role === 'seller' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Brand Name</Text>
                  <View style={styles.inputContainer}>
                    <Store size={20} color="#F3B62B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your business or brand name"
                      placeholderTextColor="#9e9e9e"
                      value={brandName}
                      onChangeText={setBrandName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>About</Text>
                  <View style={styles.textAreaContainer}>
                    <Store size={20} color="#F3B62B" style={[styles.inputIcon, { marginTop: 6 }]} />
                    <TextInput
                      style={styles.textArea}
                      placeholder="Enter a brief description about your business"
                      placeholderTextColor="#9e9e9e"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      value={about}
                      onChangeText={setAbout}
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9e9e9e"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9e9e9e"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={styles.textAreaContainer}>
                <MapPin size={20} color="#F3B62B" style={[styles.inputIcon, { marginTop: 6 }]} />
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter your address"
                  placeholderTextColor="#9e9e9e"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>


            {user?.role === 'seller' && (
              <>
                {/* WhatsApp Input */}
                <Text style={styles.inputLabel}>WhatsApp</Text>
                <View style={styles.socialInputContainer}>
                  <View style={styles.socialIconContainer}>
                    <FontAwesome name="whatsapp" size={20} color="#25D366" />
                  </View>
                  <TextInput
                    style={styles.socialInput}
                    placeholder="WhatsApp number"
                    placeholderTextColor="#9e9e9e"
                    keyboardType="phone-pad"
                    value={whatsappNumber}
                    onChangeText={setWhatsappNumber}
                  />
                </View>

                {/* Instagram Input */}
                <Text style={styles.inputLabel}>Instagram</Text>
                <View style={styles.socialInputContainer}>
                  <View style={styles.socialIconContainer}>
                    <FontAwesome name="instagram" size={20} color="#E4405F" />
                  </View>
                  <TextInput
                    style={styles.socialInput}
                    placeholder="Instagram link"
                    placeholderTextColor="#9e9e9e"
                    value={instagramHandle}
                    onChangeText={setInstagramHandle}
                  />
                </View>

                {/* Location Input */}
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.socialInputContainer}>
                  <View style={styles.socialIconContainer}>
                    <FontAwesome name="map-marker" size={20} color="#1F7D53" style={{ marginHorizontal: 3 }} />
                  </View>
                  <TextInput
                    style={styles.socialInput}
                    placeholder="Location link"
                    placeholderTextColor="#9e9e9e"
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>

                {/* Catalogue Images Section */}
                <View style={styles.inputGroup}>
                  <View style={styles.catalogueHeader}>
                    <Text style={styles.inputLabel}>Catalogue Images</Text>
                    <Text style={styles.catalogueCount}>
                      {catalogueImages.length}/8
                    </Text>
                  </View>

                  <View style={styles.catalogueContainer}>
                    <FlatList
                      data={[...catalogueImages, 'add']}
                      numColumns={2}
                      scrollEnabled={false}
                      keyExtractor={(item, index) =>
                        typeof item === 'string' && item === 'add' ? 'add-button' : `image-${index}`
                      }
                      renderItem={({ item, index }) => {
                        if (item === 'add' && catalogueImages.length < 8) {
                          return (
                            <TouchableOpacity
                              style={styles.addImageButton}
                              onPress={pickCatalogueImage}
                            >
                              <Plus size={32} color="#F3B62B" />
                              <Text style={styles.addImageText}>Add Image</Text>
                            </TouchableOpacity>
                          );
                        } else if (item !== 'add') {
                          return (
                            <View style={styles.catalogueImageContainer}>
                              <Image
                                source={{ uri: item }}
                                style={styles.catalogueImage}
                                contentFit="cover"
                              />
                              <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => removeCatalogueImage(index)}
                              >
                                <X size={16} color="#ffffff" />
                              </TouchableOpacity>
                            </View>
                          );
                        }
                        return null;
                      }}
                      contentContainerStyle={styles.catalogueGrid}
                    />
                  </View>

                  <Text style={styles.catalogueInfo}>
                    Upload product images to showcase your inventory. Maximum 8 images allowed.
                  </Text>
                </View>
              </>
            )}


            {/* Upgrade to Seller button - larger version above Save Changes */}
            {user?.role === 'customer' && (
              <TouchableOpacity
                style={styles.largeUpgradeButton}
                onPress={handleUpgradeToSeller}
              >
                <LinearGradient
                  colors={["#F5D76E", "#F3B62B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.largeUpgradeButtonInner}
                >
                  <ArrowUpCircle size={20} color="#fff" style={styles.largeUpgradeIcon} />
                  <Text style={styles.largeUpgradeText}>Upgrade to Seller</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleSave}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#F3B62B", "#F5D76E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Save Changes</Text>
                    <Save size={18} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {isSaved && (
              <View style={styles.savedMessage}>
                <CheckCircle size={18} color="#4CAF50" style={styles.savedIcon} />
                <Text style={styles.savedMessageText}>Profile updated successfully!</Text>
              </View>
            )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 16,
    fontSize: 14,
  },
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#F3B62B',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#F3B62B',
    fontWeight: 'bold',
  },
  
  // Loading Container
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 15,
  },
  
  // Info Card Styles
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Referral Code Styles
  referralCodeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  referralCodeText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3B62B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  referralInfo: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  
  // Activity Styles
  activityContainer: {
    padding: 20,
  },
  activitySection: {
    marginBottom: 24,
  },
  activitySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  transactionAmount: {
    fontSize: 14,
    color: '#666666',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
  },
  
  // Settings Styles
  settingsContainer: {
    padding: 20,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  settingsItemDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandCoverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  brandCameraButton: {
    position: "absolute",
    top: 8,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  brandNameOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  brandNameText: {
    color: "#F5D76E", // Golden color like "Sarth Jewels"
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Brush Script MT' : 'cursive', // Elegant script font
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 5,
    zIndex: 1, // Ensure profile image is above brand cover
    margin: "auto",
    // marginTop: -60, // Overlap with brand cover
  },
  profileImage: {
    borderWidth: 2,
    borderColor: "#ffffff",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#002810",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    fontWeight: "500",
  },
  sellerBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  sellerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F5D76E",
    marginTop: 8,
  },
  upgradeIcon: {
    marginRight: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F3B62B",
  },
  formContainer: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: "#333333",
  },
  textAreaContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    flex: 1,
    height: 75,
    color: "#333333",
    textAlignVertical: "top",
    paddingTop: 8,
  },
  largeUpgradeButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  largeUpgradeButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  largeUpgradeIcon: {
    marginRight: 8,
  },
  largeUpgradeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  button: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  savedMessage: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  savedIcon: {
    marginRight: 8,
  },
  savedMessageText: {
    color: "#4CAF50",
    fontWeight: "500",
  },



  // Referral Code Styles
  referralCodeContainer: {
    backgroundColor: "#E3F2FD",
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  referralCodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  referralCodeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  referralCodeContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  referralCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    letterSpacing: 1,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  generateButton: {
    flex: 1,
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  referralCodeInfo: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  // Social Inputs
  socialInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
  },
  socialIconContainer: {
    marginRight: 12,
  },
  socialInput: {
    flex: 1,
    height: 56,
    color: "#333333",
  },

  // Catalogue Images Styles
  catalogueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catalogueCount: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  catalogueContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  catalogueGrid: {
    gap: 12,
  },
  catalogueImageContainer: {
    position: "relative",
    width: "45%",
    aspectRatio: 4 / 3,
    margin: 8,
  },
  catalogueImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageButton: {
    width: "45%",
    aspectRatio: 4 / 3,
    borderWidth: 2,
    borderColor: "#F3B62B",
    borderStyle: "dashed",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E1",
    margin: 8,
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    color: "#F3B62B",
    fontWeight: "600",
  },
  catalogueInfo: {
    fontSize: 12,
    color: "#666666",
    marginTop: 8,
    lineHeight: 16,
  },

  top: {
    backgroundColor: "#002810",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 16,
    width: "90%",
    height: 150,
    color: "#ffffff",
    marginBottom: -60,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 20,
  },
  
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  brandName: {
    fontSize: 50,
    fontFamily: 'LavishlyYours-Regular',
    fontWeight: "bold",
    color: "#F3B62B",
    marginTop: -30,
  },
});