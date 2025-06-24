import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  FlatList,
  Share,
  Modal,
  Image,
  Linking,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore, BuyRequest } from "@/store/auth-store";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  BarChart2,
  Settings,
  User,
  ChevronRight,
  ShoppingBag,
  Bell,
  Mail,
  Phone,
  MapPin,
  Clock,
  Check,
  X,
  Users,
  Tag,
  Copy,
  Share2,
  Award,
  Gift,
  UserCheck,
  CheckCircle,
  LogOut,
  AlertTriangle,
  Trash2,
  Menu,
  ArrowUpRight,
  TrendingUp,
  UsersIcon,
  Info,
  ArrowUpCircle,
  IndianRupee,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Camera,
  Upload,
  Image as ImageIcon
} from "lucide-react-native";
import { NotificationBell } from "@/components/NotificationBell";
import * as Clipboard from 'expo-clipboard';
import { images } from "@/constants/images";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40); // Adjust this value as needed for your layout

export default function SellerDashboardScreen() {
  const { user, firebaseAuth } = useAuth();
  const currentUser = firebaseAuth.user || user;
  
  const {
    getNotificationsForUser,
    markNotificationAsRead,
    getBuyRequestsForSeller,
    getInventoryItemsForSeller,
    getUserById,
    acceptBuyRequest,
    declineBuyRequest,
    generateSellerReferralCode,
    logout, 
    notifications, 
    unreadNotificationsCount, 
    markAllNotificationsAsRead, 
    users, 
    getSellerCount, 
    getCustomerCount, 
    selectedSeller, 
    setSelectedSeller,
    updateUser
  } = useAuthStore();

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [referralCode, setReferralCode] = useState<string | undefined>(currentUser?.referralCode);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [brandName, setBrandName] = useState(currentUser?.brandName || '');
  const [brandImage, setBrandImage] = useState(currentUser?.brandImage || '');

  // States for async data fetching
  const [requestDetails, setRequestDetails] = useState<{ [key: string]: { product: any, customer: any } }>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get notifications for the current seller
  const sellerNotifications = currentUser ? getNotificationsForUser(currentUser.id).filter(n =>
    n.type === 'contact_request' ||
    n.type === 'rate_interest' ||
    n.type === 'buy_request' ||
    n.type === 'referral'
  ) : [];

  // Fetch data on mount
  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    } else {
      // Redirect to login if no user
      router.replace("/auth/login");
    }
  }, [currentUser]);

  // Load all dashboard data
  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      // Load buy requests
      const requests = getBuyRequestsForSeller(currentUser?.id || "");
      const sortedRequests = [...requests].sort((a, b) => b.createdAt - a.createdAt);
      setBuyRequests(sortedRequests);

      // Load inventory
      const items = getInventoryItemsForSeller(currentUser?.id || "");
      setInventory(items);

      // Load customer count
      const contactedDetails = getContactedSellerDetails().filter(
        contact => contact.sellerId === currentUser?.id
      );
      
      // Get notifications for buy requests and rate interests
      const customerNotifications = getNotificationsForUser(currentUser?.id || "").filter(
        n => n.type === 'buy_request' || n.type === 'rate_interest' || n.type === 'contact_request'
      );
      
      // Combine data to get unique customers
      const uniqueCustomerIds = new Set();
      
      // Add customers from contacted details
      for (const contact of contactedDetails) {
        uniqueCustomerIds.add(contact.customerId);
      }
      
      // Add customers from notifications
      for (const notification of customerNotifications) {
        const customerId = notification.data?.customer?.id || 
                          notification.data?.user?.id ||
                          notification.senderId;
        
        if (customerId) {
          uniqueCustomerIds.add(customerId);
        }
      }
      
      setCustomerCount(uniqueCustomerIds.size);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    loadDashboardData();
  };

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    // Less than a minute
    if (diff < 60000) {
      return "Just now";
    }

    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    // Format as date
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Handle notification press
  const handleNotificationPress = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    markNotificationAsRead(id);
  };

  // Handle accept buy request
  const handleAcceptBuyRequest = async (requestId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsProcessing(true);

    try {
      const result = await acceptBuyRequest(requestId);

      if (result.success) {
        // Update local state
        setBuyRequests(prevRequests =>
          prevRequests.map(req =>
            req.id === requestId ? { ...req, status: 'accepted', updatedAt: Date.now() } : req
          )
        );

        Alert.alert(
          "Success",
          "Buy request accepted successfully. The customer has been notified.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to accept buy request.");
      }
    } catch (error) {
      console.error("Error accepting buy request:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle decline buy request
  const handleDeclineBuyRequest = async (requestId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsProcessing(true);

    try {
      const result = await declineBuyRequest(requestId);

      if (result.success) {
        // Update local state
        setBuyRequests(prevRequests =>
          prevRequests.map(req =>
            req.id === requestId ? { ...req, status: 'declined', updatedAt: Date.now() } : req
          )
        );

        Alert.alert(
          "Success",
          "Buy request declined. The customer has been notified.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to decline buy request.");
      }
    } catch (error) {
      console.error("Error declining buy request:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Get product and customer details for a buy request
  const getRequestDetails = async (request: BuyRequest) => {
    if (requestDetails[request.id]) {
      return requestDetails[request.id];
    }

    setIsLoadingDetails(true);

    try {
      // Get inventory item
      const inventory = getInventoryItemsForSeller(currentUser?.id || "");
      const product = inventory.find(item => item.id === request.itemId);

      // Get customer details - properly handling the Promise
      let customerData = null;
      if (typeof getUserById === 'function') {
        const customerResult = await getUserById(request.customerId);
        if (typeof customerResult === 'object' && customerResult !== null) {
          customerData = customerResult;
        }
      }

      // Cache the result
      const details = { product, customer: customerData };
      setRequestDetails(prev => ({
        ...prev,
        [request.id]: details
      }));

      setIsLoadingDetails(false);
      return details;
    } catch (error) {
      console.error("Error fetching request details:", error);
      setIsLoadingDetails(false);
      return { product: null, customer: null };
    }
  };

  // Pre-fetch details for all requests
  useEffect(() => {
    if (buyRequests.length > 0) {
      buyRequests.forEach(request => {
        getRequestDetails(request);
      });
    }
  }, [buyRequests]);

  // Handle generate referral code
  const handleGenerateReferralCode = async () => {
    if (!currentUser) return;

    setIsGeneratingCode(true);

    try {
      const result = await generateSellerReferralCode(currentUser.id);

      if (result.success && result.code) {
        setReferralCode(result.code);

        // Trigger haptic feedback on success
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        Alert.alert("Error", result.error || "Failed to generate referral code.");
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Handle copy referral code
  const handleCopyReferralCode = async () => {
    if (!referralCode) return;

    try {
      await Clipboard.setStringAsync(referralCode);
      setCodeCopied(true);

      // Reset copied state after 3 seconds
      setTimeout(() => setCodeCopied(false), 3000);

      // Trigger haptic feedback on success
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error copying referral code:", error);
      Alert.alert("Error", "Failed to copy referral code.");
    }
  };

  // Handle share referral code
  const handleShareReferralCode = async () => {
    if (!referralCode || !currentUser) return;

    try {
      const brandName = currentUser.brandName || currentUser.fullName || currentUser.name;
      const message = `Add ${brandName} as your seller in Bhav app using my referral code: ${referralCode}`;

      await Share.share({
        message,
        title: "Bhav Seller Referral Code"
      });

      // Trigger haptic feedback on success
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error sharing referral code:", error);
      Alert.alert("Error", "Failed to share referral code.");
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <User size={20} color="#1976D2" />;
      case 'user_deletion':
        return <Trash2 size={20} color="#E53935" />;
      case 'transaction':
        return <IndianRupee size={20} color="#F3B62B" />;
      case 'system':
        return <Settings size={20} color="#43A047" />;
      case 'alert':
        return <AlertTriangle size={20} color="#E53935" />;
      case 'referral':
        return <Gift size={20} color="#F3B62B" />;
      case 'contact_request':
        return <User size={20} color="#1976D2" />;
      case 'role_change':
        return <UserCheck size={20} color="#5C6BC0" />;
      case 'payment_success':
        return <CheckCircle size={20} color="#43A047" />;
      default:
        return <Bell size={20} color="#333333" />;
    }
  };

  // Toggle notifications
  const toggleNotifications = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setShowNotifications(!showNotifications);
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    markAllNotificationsAsRead();
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            logout();
            router.replace("/auth/login");
          },
          style: "destructive"
        }
      ]
    );
  };

  // Open drawer
  const openDrawer = () => {
    router.push("/drawer");
  };

  // Handle image picker
  const handleImagePick = async (type: 'camera' | 'gallery') => {
    try {
      let result;
      
      if (type === 'camera') {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Media library permission is required to select photos.');
          return;
        }
        
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // For now, just use the URI directly
        // In a real app, you would upload this to a server and get a URL back
        setBrandImage(result.assets[0].uri);
        setShowImagePickerModal(false);
        
        // Update user profile with new brand image
        handleUpdateProfile();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle update profile
  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    
    setIsUpdatingProfile(true);
    
    try {
      // In a real app, you would upload the image to a server here
      // and get a URL back to store in the user profile
      
      const updatedUser = {
        ...currentUser,
        brandName: brandName || currentUser.brandName,
        brandImage: brandImage || currentUser.brandImage,
        updatedAt: new Date().getTime()
      };
      
      const result = await updateUser(updatedUser);
      
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully.');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Get contacted seller details
  const getContactedSellerDetails = () => {
    // This is a placeholder - in your actual app, implement this function
    // to return the contacted seller details from your auth store
    return [];
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Menu size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <NotificationBell 
          count={unreadNotificationsCount} 
          onPress={toggleNotifications} 
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <View>
              <Text style={styles.welcomeText}>
                Welcome, {currentUser?.name || currentUser?.fullName || 'Seller'}!
              </Text>
              <Text style={styles.roleText}>
                Seller Dashboard
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push("/(app)/profile")}
            >
              {currentUser?.profileImage ? (
                <Image 
                  source={{ uri: currentUser.profileImage }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <User size={24} color="#F3B62B" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Brand Banner */}
        <View style={styles.brandBanner}>
          <LinearGradient
            colors={['#F3B62B', '#E09900']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.brandBannerGradient}
          >
            <View style={styles.brandBannerContent}>
              <View>
                <Text style={styles.brandBannerLabel}>Your Brand</Text>
                <Text style={styles.brandBannerName}>
                  {currentUser?.brandName || 'Set up your brand name'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.brandBannerButton}
                onPress={() => router.push("/(app)/profile")}
              >
                <Text style={styles.brandBannerButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        
        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Brand</Text>
            <TouchableOpacity onPress={() => router.push("/(app)/profile")}>
              <Text style={styles.seeAllText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.brandCard}>
            <View style={styles.brandImageContainer}>
              <TouchableOpacity 
                style={styles.brandImageWrapper}
                onPress={() => setShowImagePickerModal(true)}
              >
                {brandImage ? (
                  <Image 
                    source={{ uri: brandImage }} 
                    style={styles.brandImage} 
                  />
                ) : (
                  <View style={styles.brandImagePlaceholder}>
                    <ShoppingBag size={40} color="#F3B62B" />
                    <Text style={styles.addImageText}>Add Logo</Text>
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  <Camera size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.brandDetails}>
              <Text style={styles.brandNameLabel}>Brand Name</Text>
              <Text style={styles.brandName}>
                {currentUser?.brandName || 'Set your brand name'}
              </Text>
              <TouchableOpacity 
                style={styles.editBrandButton}
                onPress={() => router.push("/(app)/profile")}
              >
                <Text style={styles.editBrandText}>Edit Brand Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <ShoppingBag size={24} color="#F3B62B" />
              </View>
              <Text style={styles.statValue}>{inventory.length}</Text>
              <Text style={styles.statLabel}>Inventory Items</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Users size={24} color="#F3B62B" />
              </View>
              <Text style={styles.statValue}>{customerCount}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Bell size={24} color="#F3B62B" />
              </View>
              <Text style={styles.statValue}>{buyRequests.filter(req => req.status === 'pending').length}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <CheckCircle size={24} color="#F3B62B" />
              </View>
              <Text style={styles.statValue}>{buyRequests.filter(req => req.status === 'accepted').length}</Text>
              <Text style={styles.statLabel}>Accepted Requests</Text>
            </View>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push("/(app)/(tabs)/inventory")}
            >
              <View style={styles.quickActionIconContainer}>
                <ShoppingBag size={24} color="#F3B62B" />
              </View>
              <Text style={styles.quickActionText}>Manage Inventory</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push("/(app)/(tabs)/customers")}
            >
              <View style={styles.quickActionIconContainer}>
                <Users size={24} color="#F3B62B" />
              </View>
              <Text style={styles.quickActionText}>View Customers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push("/(app)/(tabs)/rates")}
            >
              <View style={styles.quickActionIconContainer}>
                <TrendingUp size={24} color="#F3B62B" />
              </View>
              <Text style={styles.quickActionText}>Check Rates</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push("/(app)/profile")}
            >
              <View style={styles.quickActionIconContainer}>
                <User size={24} color="#F3B62B" />
              </View>
              <Text style={styles.quickActionText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recent Buy Requests */}
        <View style={styles.buyRequestsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Buy Requests</Text>
            {buyRequests.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/(app)/buy-requests")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {buyRequests.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <ShoppingBag size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No buy requests yet</Text>
              <Text style={styles.emptyStateSubtext}>
                When customers request to buy your products, they'll appear here.
              </Text>
            </View>
          ) : (
            // Limit to 2 requests to prevent scrolling issues
            buyRequests.slice(0, 2).map((request) => {
              const details = requestDetails[request.id] || { product: null, customer: null };
              
              return (
                <View key={request.id} style={styles.buyRequestCard}>
                  <View style={styles.buyRequestHeader}>
                    <View style={styles.buyRequestUser}>
                      {details.customer?.profileImage ? (
                        <Image 
                          source={{ uri: details.customer.profileImage }} 
                          style={styles.customerAvatar} 
                        />
                      ) : (
                        <View style={styles.customerAvatarPlaceholder}>
                          <User size={16} color="#F3B62B" />
                        </View>
                      )}
                      <Text style={styles.customerName} numberOfLines={1}>
                        {details.customer?.name || details.customer?.fullName || 'Unknown Customer'}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.statusBadge,
                      request.status === 'accepted' ? styles.acceptedBadge :
                      request.status === 'declined' ? styles.declinedBadge :
                      styles.pendingBadge
                    ]}>
                      <Text style={[
                        styles.statusText,
                        request.status === 'accepted' ? styles.acceptedText :
                        request.status === 'declined' ? styles.declinedText :
                        styles.pendingText
                      ]}>
                        {request.status === 'accepted' ? 'Accepted' :
                         request.status === 'declined' ? 'Declined' :
                         'Pending'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.buyRequestDetails}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {details.product?.name || 'Unknown Product'}
                    </Text>
                    <Text style={styles.requestTime}>
                      {formatTimestamp(request.createdAt)}
                    </Text>
                  </View>
                  
                  {request.status === 'pending' && (
                    <View style={styles.buyRequestActions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.declineButton]}
                        onPress={() => handleDeclineBuyRequest(request.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#E53935" />
                        ) : (
                          <>
                            <ThumbsDown size={16} color="#E53935" />
                            <Text style={styles.declineButtonText}>Decline</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAcceptBuyRequest(request.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <ThumbsUp size={16} color="#fff" />
                            <Text style={styles.acceptButtonText}>Accept</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
        
        {/* Referral Section */}
        <View style={styles.referralSection}>
          <Text style={styles.sectionTitle}>Referral Program</Text>
          
          <View style={styles.referralCard}>
            <View style={styles.referralHeader}>
              <View style={styles.referralIconContainer}>
                <Gift size={24} color="#F3B62B" />
              </View>
              <Text style={styles.referralTitle}>Share Your Referral Code</Text>
            </View>
            
            <Text style={styles.referralDescription}>
              Invite customers to connect with you on Bhav app using your unique referral code.
            </Text>
            
            {referralCode ? (
              <View style={styles.referralCodeContainer}>
                <Text style={styles.referralCode}>{referralCode}</Text>
                <View style={styles.referralActions}>
                  <TouchableOpacity 
                    style={styles.referralAction}
                    onPress={handleCopyReferralCode}
                  >
                    {codeCopied ? (
                      <Check size={20} color="#43A047" />
                    ) : (
                      <Copy size={20} color="#666" />
                    )}
                    <Text style={styles.referralActionText}>
                      {codeCopied ? 'Copied!' : 'Copy'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.referralAction}
                    onPress={handleShareReferralCode}
                  >
                    <Share2 size={20} color="#666" />
                    <Text style={styles.referralActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.generateCodeButton}
                onPress={handleGenerateReferralCode}
                disabled={isGeneratingCode}
              >
                {isGeneratingCode ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.generateCodeText}>Generate Referral Code</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.notificationsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {sellerNotifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Bell size={48} color="#ccc" />
                <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.markAllReadButton}
                  onPress={handleMarkAllAsRead}
                >
                  <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
                
                <ScrollView style={styles.notificationsList}>
                  {sellerNotifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        !notification.read && styles.unreadNotification
                      ]}
                      onPress={() => handleNotificationPress(notification.id)}
                    >
                      <View style={styles.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatTimestamp(notification.timestamp)}
                        </Text>
                      </View>
                      {!notification.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.imagePickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Brand Logo</Text>
              <TouchableOpacity onPress={() => setShowImagePickerModal(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imagePickerOptions}>
              <TouchableOpacity 
                style={styles.imagePickerOption}
                onPress={() => handleImagePick('camera')}
              >
                <View style={styles.imagePickerIconContainer}>
                  <Camera size={32} color="#F3B62B" />
                </View>
                <Text style={styles.imagePickerText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imagePickerOption}
                onPress={() => handleImagePick('gallery')}
              >
                <View style={styles.imagePickerIconContainer}>
                  <ImageIcon size={32} color="#F3B62B" />
                </View>
                <Text style={styles.imagePickerText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 90,
    marginBottom: 60,
  },
  brandBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandBannerGradient: {
    padding: 16,
  },
  brandBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBannerLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  brandBannerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  brandBannerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  brandBannerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  welcomeSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: "#666",
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  brandSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#F3B62B",
    fontWeight: "500",
  },
  brandCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandImageContainer: {
    marginRight: 16,
  },
  brandImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  brandImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  brandImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#F3B62B",
    borderRadius: 12,
    padding: 4,
  },
  brandDetails: {
    flex: 1,
  },
  brandNameLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  editBrandButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  editBrandText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  statsSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    backgroundColor: "rgba(243, 182, 43, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  quickActionsSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  quickActionCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  quickActionIconContainer: {
    backgroundColor: "rgba(243, 182, 43, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  buyRequestsSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateContainer: {
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  buyRequestCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  buyRequestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  buyRequestUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  customerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingBadge: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  acceptedBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  declinedBadge: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  pendingText: {
    color: "#2196F3",
  },
  acceptedText: {
    color: "#4CAF50",
  },
  declinedText: {
    color: "#F44336",
  },
  buyRequestDetails: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 12,
    color: "#999",
  },
  buyRequestActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  declineButton: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#E53935",
  },
  acceptButton: {
    backgroundColor: "#F3B62B",
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#E53935",
    marginLeft: 4,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginLeft: 4,
  },
  referralSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  referralCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  referralHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  referralIconContainer: {
    backgroundColor: "rgba(243, 182, 43, 0.1)",
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  referralDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  referralCodeContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  referralCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F3B62B",
    textAlign: "center",
    marginBottom: 12,
  },
  referralActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  referralAction: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  referralActionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  generateCodeButton: {
    backgroundColor: "#F3B62B",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  generateCodeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationsModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  emptyNotifications: {
    alignItems: "center",
    padding: 24,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  markAllReadButton: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  markAllReadText: {
    fontSize: 14,
    color: "#F3B62B",
    fontWeight: "500",
  },
  notificationsList: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  unreadNotification: {
    backgroundColor: "rgba(243, 182, 43, 0.05)",
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F3B62B",
    marginLeft: 8,
  },
  imagePickerModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    padding: 16,
  },
  imagePickerOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 24,
  },
  imagePickerOption: {
    alignItems: "center",
  },
  imagePickerIconContainer: {
    backgroundColor: "rgba(243, 182, 43, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 14,
    color: "#333",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});