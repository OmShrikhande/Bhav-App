import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/auth-store";
import { useFirebaseAuthStore } from "@/store/firebase-auth-store";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  getDocs, 
  getFirestore, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  Users as UsersIcon,
  TrendingUp,
  Settings,
  BarChart2,
  Menu,
  Bell,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  X,
  Check,
  User,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Gift,
  Award,
  ShoppingBag,
  UserCheck,
  RefreshCw,
  PlusCircle,
  Edit,
  FileText,
  Calendar
} from "lucide-react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40; // Full width for single card

export default function AdminDashboardScreen() {
  const { user: legacyUser, logout, notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } = useAuthStore();
  const { firebaseAuth } = useAuth();
  const firebaseUser = firebaseAuth.user;
  const router = useRouter();
  const db = getFirestore();
  
  // State variables
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [sellerCount, setSellerCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSellers: 0,
    totalCustomers: 0,
    pendingApprovals: 0,
    totalTransactions: 0
  });
  
  // Use the current user from Firebase or legacy store
  const currentUser = firebaseUser || legacyUser;
  
  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedUsers = [];
      let sellers = 0;
      let customers = 0;
      let pending = 0;
      
      querySnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        fetchedUsers.push(userData);
        
        // Count user types
        if (userData.role === 'seller') {
          sellers++;
        } else if (userData.role === 'customer' || userData.role === 'buyer') {
          customers++;
        }
        
        if (userData.role === 'seller_pending') {
          pending++;
        }
      });
      
      setUsers(fetchedUsers);
      setSellerCount(sellers);
      setCustomerCount(customers);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalUsers: fetchedUsers.length,
        activeUsers: fetchedUsers.filter(u => u.isActive).length,
        totalSellers: sellers,
        totalCustomers: customers,
        pendingApprovals: pending
      }));
      
      return fetchedUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };
  
  // Fetch notifications from Firestore
  const fetchNotifications = async () => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      
      const fetchedNotifications = [];
      querySnapshot.forEach((doc) => {
        fetchedNotifications.push({ id: doc.id, ...doc.data() });
      });
      
      setAdminNotifications(fetchedNotifications);
      return fetchedNotifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  };
  
  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'seller_pending'));
      const querySnapshot = await getDocs(q);
      
      const pendingSellers = [];
      querySnapshot.forEach((doc) => {
        pendingSellers.push({ id: doc.id, ...doc.data() });
      });
      
      setPendingApprovals(pendingSellers);
      return pendingSellers;
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      return [];
    }
  };
  
  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, orderBy('timestamp', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      
      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      setRecentTransactions(transactions);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalTransactions: transactions.length
      }));
      
      return transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };
  
  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchNotifications(),
        fetchPendingApprovals(),
        fetchRecentTransactions()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // Load data when component mounts
  useEffect(() => {
    loadAllData();
  }, []);
  
  const openDrawer = () => {
    router.push("/drawer");
  };

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
          onPress: async () => {
            try {
              // Set logout flag
              await AsyncStorage.setItem('logout-in-progress', 'true');
              // Clear admin user from storage
              await AsyncStorage.removeItem('admin-user');
              // Perform logout
              await firebaseAuth.logOut();
              logout();
              // Navigate to login
              router.replace("/auth/login");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  
  // Function to approve a seller
  const approveSeller = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: 'seller',
        sellerVerified: true,
        updatedAt: Timestamp.now()
      });
      
      // Add notification
      const notificationRef = collection(db, 'notifications');
      await addDoc(notificationRef, {
        userId: userId,
        title: 'Seller Approved',
        message: 'Your seller account has been approved. You can now list products.',
        type: 'role_change',
        read: false,
        timestamp: Date.now()
      });
      
      // Refresh data
      await loadAllData();
      
      Alert.alert("Success", "Seller has been approved successfully.");
    } catch (error) {
      console.error("Error approving seller:", error);
      Alert.alert("Error", "Failed to approve seller. Please try again.");
    }
  };
  
  // Function to reject a seller
  const rejectSeller = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: 'customer',
        sellerVerified: false,
        updatedAt: Timestamp.now()
      });
      
      // Add notification
      const notificationRef = collection(db, 'notifications');
      await addDoc(notificationRef, {
        userId: userId,
        title: 'Seller Application Rejected',
        message: 'Your seller application has been rejected. Please contact support for more information.',
        type: 'role_change',
        read: false,
        timestamp: Date.now()
      });
      
      // Refresh data
      await loadAllData();
      
      Alert.alert("Success", "Seller has been rejected.");
    } catch (error) {
      console.error("Error rejecting seller:", error);
      Alert.alert("Error", "Failed to reject seller. Please try again.");
    }
  };

  const toggleNotifications = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setShowNotifications(!showNotifications);
  };

  const handleNotificationPress = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    markAllNotificationsAsRead();
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

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <User size={20} color="#1976D2" />;
      case 'user_deletion':
        return <Trash2 size={20} color="#E53935" />;
      case 'transaction':
        return <DollarSign size={20} color="#F3B62B" />;
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.menuButton}
        >
          <Menu size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={toggleNotifications}
        >
          <Bell size={24} color="#333333" />
          {adminNotifications.filter(n => !n.read).length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {adminNotifications.filter(n => !n.read).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#1976D2"]}
            tintColor="#1976D2"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F3B62B" />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        ) : (
          <>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome, Admin</Text>
              <Text style={styles.adminName}>{currentUser?.fullName || currentUser?.name}</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <LinearGradient
                colors={["#1976D2", "#64B5F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.singleStatCard}
              >
                <View style={styles.statIconContainer}>
                  <UsersIcon size={24} color="#ffffff" />
                </View>
                <Text style={styles.statValue}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
                <View style={styles.statTrend}>
                  <ArrowUpRight size={16} color="#ffffff" />
                  <Text style={styles.statTrendText}>Active</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Seller and Customer Stats */}
            <View style={styles.statsContainer}>
              <LinearGradient
                colors={["#F3B62B", "#F5D76E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.singleStatCard}
              >
                <View style={styles.statIconContainer}>
                  <ShoppingBag size={24} color="#ffffff" />
                </View>
                <Text style={styles.statValue}>{stats.totalSellers}</Text>
                <Text style={styles.statLabel}>Total Sellers</Text>
                <TouchableOpacity 
                  style={styles.statTrend}
                  onPress={() => router.push("/(admin)/users")}
                >
                  <ArrowUpRight size={16} color="#ffffff" />
                  <Text style={styles.statTrendText}>View All</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <View style={styles.statsContainer}>
              <LinearGradient
                colors={["#002810", "#43A047"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.singleStatCard}
              >
                <View style={styles.statIconContainer}>
                  <User size={24} color="#ffffff" />
                </View>
                <Text style={styles.statValue}>{stats.totalCustomers}</Text>
                <Text style={styles.statLabel}>Total Customers</Text>
                <TouchableOpacity 
                  style={styles.statTrend}
                  onPress={() => router.push("/(admin)/users")}
                >
                  <ArrowUpRight size={16} color="#ffffff" />
                  <Text style={styles.statTrendText}>View All</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Pending Approvals Section */}
            {pendingApprovals.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Pending Approvals ({pendingApprovals.length})</Text>
                <View style={styles.pendingApprovalsContainer}>
                  {pendingApprovals.map((seller) => (
                    <View style={styles.pendingApprovalItem} key={seller.id}>
                      <View style={styles.pendingApprovalHeader}>
                        <View style={styles.pendingApprovalUser}>
                          <View style={styles.pendingApprovalAvatar}>
                            <User size={20} color="#F3B62B" />
                          </View>
                          <View>
                            <Text style={styles.pendingApprovalName}>{seller.fullName || seller.name}</Text>
                            <Text style={styles.pendingApprovalEmail}>{seller.email}</Text>
                          </View>
                        </View>
                        <View style={styles.pendingApprovalBadge}>
                          <Text style={styles.pendingApprovalBadgeText}>Pending</Text>
                        </View>
                      </View>
                      
                      <View style={styles.pendingApprovalDetails}>
                        {seller.phone && (
                          <View style={styles.pendingApprovalDetail}>
                            <Phone size={16} color="#666666" />
                            <Text style={styles.pendingApprovalDetailText}>{seller.phone}</Text>
                          </View>
                        )}
                        
                        {seller.city && seller.state && (
                          <View style={styles.pendingApprovalDetail}>
                            <MapPin size={16} color="#666666" />
                            <Text style={styles.pendingApprovalDetailText}>{seller.city}, {seller.state}</Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.pendingApprovalActions}>
                        <TouchableOpacity 
                          style={[styles.pendingApprovalAction, styles.approveButton]}
                          onPress={() => approveSeller(seller.id)}
                        >
                          <CheckCircle size={16} color="#ffffff" />
                          <Text style={styles.pendingApprovalActionText}>Approve</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.pendingApprovalAction, styles.rejectButton]}
                          onPress={() => rejectSeller(seller.id)}
                        >
                          <XCircle size={16} color="#ffffff" />
                          <Text style={styles.pendingApprovalActionText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.push("/(admin)/users")}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}>
                    <UsersIcon size={24} color="#1976D2" />
                  </View>
                  <Text style={styles.quickActionText}>Manage Users</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.push("/(admin)/analytics")}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: "#FFF8E1" }]}>
                    <BarChart2 size={24} color="#F3B62B" />
                  </View>
                  <Text style={styles.quickActionText}>View Analytics</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.push("/(app)/live-rates")}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}>
                    <TrendingUp size={24} color="#43A047" />
                  </View>
                  <Text style={styles.quickActionText}>Live Rates</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.push("/(app)/share")}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}>
                    <Gift size={24} color="#FF9800" />
                  </View>
                  <Text style={styles.quickActionText}>Referral Program</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Transactions Section */}
            {recentTransactions.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <View style={styles.transactionsContainer}>
                  {recentTransactions.map((transaction) => (
                    <View style={styles.transactionItem} key={transaction.id}>
                      <View style={styles.transactionHeader}>
                        <View style={[styles.transactionIcon, { 
                          backgroundColor: transaction.status === 'completed' ? '#E8F5E9' : 
                                          transaction.status === 'pending' ? '#FFF8E1' : 
                                          transaction.status === 'failed' ? '#FFEBEE' : '#f5f5f5'
                        }]}>
                          <DollarSign size={20} color={
                            transaction.status === 'completed' ? '#43A047' : 
                            transaction.status === 'pending' ? '#F3B62B' : 
                            transaction.status === 'failed' ? '#E53935' : '#333333'
                          } />
                        </View>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionTitle}>{transaction.type || 'Transaction'}</Text>
                          <Text style={styles.transactionAmount}>₹{transaction.amount?.toFixed(2) || '0.00'}</Text>
                        </View>
                        <View style={[styles.transactionStatus, {
                          backgroundColor: transaction.status === 'completed' ? '#E8F5E9' : 
                                          transaction.status === 'pending' ? '#FFF8E1' : 
                                          transaction.status === 'failed' ? '#FFEBEE' : '#f5f5f5'
                        }]}>
                          <Text style={[styles.transactionStatusText, {
                            color: transaction.status === 'completed' ? '#43A047' : 
                                  transaction.status === 'pending' ? '#F3B62B' : 
                                  transaction.status === 'failed' ? '#E53935' : '#333333'
                          }]}>
                            {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'Unknown'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transactionDetails}>
                        <View style={styles.transactionDetail}>
                          <User size={14} color="#666666" />
                          <Text style={styles.transactionDetailText}>
                            {transaction.userName || 'Unknown User'}
                          </Text>
                        </View>
                        <View style={styles.transactionDetail}>
                          <Calendar size={14} color="#666666" />
                          <Text style={styles.transactionDetailText}>
                            {formatTimestamp(transaction.timestamp)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <View style={styles.activitiesContainer}>
                {/* Recent Activities from Notifications */}
                {adminNotifications.slice(0, 5).map((notification, index) => (
                  <View style={styles.activityItem} key={notification.id || `activity-${index}`}>
                    <View style={[styles.activityIcon, {
                      backgroundColor: notification.type === 'user_signup' ? "#E3F2FD" :
                        notification.type === 'transaction' ? "#FFF8E1" :
                          notification.type === 'system' ? "#E8F5E9" :
                            notification.type === 'alert' ? "#FFEBEE" :
                              notification.type === 'contact_request' ? "#E8F5E9" :
                                notification.type === 'role_change' ? "#E8F5E9" :
                                  notification.type === 'payment_success' ? "#E8F5E9" :
                                    notification.type === 'referral' ? "#FFF8E1" :
                                      "#f5f5f5"
                    }]}>
                      {getNotificationIcon(notification.type)}
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{notification.title}</Text>
                      <Text style={styles.activityDescription}>{notification.message}</Text>
                      <View style={styles.activityMeta}>
                        <Clock size={14} color="#9e9e9e" />
                        <Text style={styles.activityTime}>{formatTimestamp(notification.timestamp)}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {adminNotifications.length === 0 && (
                  <View style={styles.emptyActivities}>
                    <Text style={styles.emptyActivitiesText}>No recent activities</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <LogOut size={20} color="#ffffff" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationContainer}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationHeaderTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {adminNotifications.length > 0 ? (
              <>
                <View style={styles.notificationActions}>
                  <TouchableOpacity
                    style={styles.markAllReadButton}
                    onPress={handleMarkAllAsRead}
                  >
                    <Check size={16} color="#1976D2" />
                    <Text style={styles.markAllReadText}>Mark all as read</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={adminNotifications}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.notificationItem,
                        !item.read && styles.notificationItemUnread
                      ]}
                      onPress={() => handleNotificationPress(item.id)}
                    >
                      {item.type === 'contact_request' ? (
                        <View style={styles.contactRequestNotification}>
                          <View style={styles.contactRequestHeader}>
                            <User size={24} color="#1976D2" style={styles.contactRequestIcon} />
                            <View style={styles.contactRequestTitleContainer}>
                              <Text style={styles.contactRequestTitle}>{item.title}</Text>
                              <Text style={styles.contactRequestTime}>{formatTimestamp(item.timestamp)}</Text>
                            </View>
                            {!item.read && <View style={styles.unreadIndicator} />}
                          </View>

                          <Text style={styles.contactRequestMessage}>{item.message}</Text>

                          {item.data?.customer && item.data?.dealer && (
                            <View style={styles.contactDetailsContainer}>
                              <View style={styles.contactDetailSection}>
                                <Text style={styles.contactDetailSectionTitle}>Customer:</Text>
                                <View style={styles.contactDetailRow}>
                                  <User size={16} color="#666666" style={styles.contactDetailIcon} />
                                  <Text style={styles.contactDetailText}>{item.data.customer.name}</Text>
                                </View>
                                <View style={styles.contactDetailRow}>
                                  <Mail size={16} color="#666666" style={styles.contactDetailIcon} />
                                  <Text style={styles.contactDetailText}>{item.data.customer.email}</Text>
                                </View>
                                {item.data.customer.phone && (
                                  <View style={styles.contactDetailRow}>
                                    <Phone size={16} color="#666666" style={styles.contactDetailIcon} />
                                    <Text style={styles.contactDetailText}>{item.data.customer.phone}</Text>
                                  </View>
                                )}
                              </View>

                              <View style={styles.contactDetailDivider} />

                              <View style={styles.contactDetailSection}>
                                <Text style={styles.contactDetailSectionTitle}>Dealer:</Text>
                                <View style={styles.contactDetailRow}>
                                  <User size={16} color="#666666" style={styles.contactDetailIcon} />
                                  <Text style={styles.contactDetailText}>{item.data.dealer.name}</Text>
                                </View>
                                <View style={styles.contactDetailRow}>
                                  <Mail size={16} color="#666666" style={styles.contactDetailIcon} />
                                  <Text style={styles.contactDetailText}>{item.data.dealer.email}</Text>
                                </View>
                                {item.data.dealer.phone && (
                                  <View style={styles.contactDetailRow}>
                                    <Phone size={16} color="#666666" style={styles.contactDetailIcon} />
                                    <Text style={styles.contactDetailText}>{item.data.dealer.phone}</Text>
                                  </View>
                                )}
                                {item.data.dealer.brandName && (
                                  <View style={styles.contactDetailRow}>
                                    <Award size={16} color="#F3B62B" style={styles.contactDetailIcon} />
                                    <Text style={styles.contactDetailText}>{item.data.dealer.brandName}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                      ) : item.type === 'role_change' ? (
                        <View style={styles.roleChangeNotification}>
                          <View style={styles.notificationIconContainer}>
                            <UserCheck size={20} color="#5C6BC0" />
                          </View>
                          <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>{item.title}</Text>
                            <Text style={styles.notificationMessage}>{item.message}</Text>

                            {item.data?.user && (
                              <View style={styles.userDetailsContainer}>
                                <View style={styles.userDetailRow}>
                                  <User size={14} color="#666666" style={styles.userDetailIcon} />
                                  <Text style={styles.userDetailText}>{item.data.user.name}</Text>
                                </View>
                                <View style={styles.userDetailRow}>
                                  <Mail size={14} color="#666666" style={styles.userDetailIcon} />
                                  <Text style={styles.userDetailText}>{item.data.user.email}</Text>
                                </View>
                                {item.data.user.phone && (
                                  <View style={styles.userDetailRow}>
                                    <Phone size={14} color="#666666" style={styles.userDetailIcon} />
                                    <Text style={styles.userDetailText}>{item.data.user.phone}</Text>
                                  </View>
                                )}
                                {item.data.user.city && (
                                  <View style={styles.userDetailRow}>
                                    <MapPin size={14} color="#666666" style={styles.userDetailIcon} />
                                    <Text style={styles.userDetailText}>
                                      {item.data.user.city}
                                      {item.data.user.state ? `, ${item.data.user.state}` : ""}
                                    </Text>
                                  </View>
                                )}
                                {item.data.user.brandName && (
                                  <View style={styles.userDetailRow}>
                                    <ShoppingBag size={14} color="#F3B62B" style={styles.userDetailIcon} />
                                    <Text style={styles.userDetailText}>{item.data.user.brandName}</Text>
                                  </View>
                                )}
                              </View>
                            )}

                            <Text style={styles.notificationTime}>
                              {formatTimestamp(item.timestamp)}
                            </Text>
                          </View>
                          {!item.read && <View style={styles.unreadIndicator} />}
                        </View>
                      ) : item.type === 'payment_success' ? (
                        <View style={styles.paymentSuccessNotification}>
                          <View style={styles.notificationIconContainer}>
                            <CheckCircle size={20} color="#43A047" />
                          </View>
                          <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>{item.title}</Text>
                            <Text style={styles.notificationMessage}>{item.message}</Text>

                            {item.data?.user && (
                              <View style={styles.userDetailsContainer}>
                                <View style={styles.userDetailRow}>
                                  <User size={14} color="#666666" style={styles.userDetailIcon} />
                                  <Text style={styles.userDetailText}>{item.data.user.name}</Text>
                                </View>
                                <View style={styles.userDetailRow}>
                                  <Mail size={14} color="#666666" style={styles.userDetailIcon} />
                                  <Text style={styles.userDetailText}>{item.data.user.email}</Text>
                                </View>
                                {item.data.user.phone && (
                                  <View style={styles.userDetailRow}>
                                    <Phone size={14} color="#666666" style={styles.userDetailIcon} />
                                    <Text style={styles.userDetailText}>{item.data.user.phone}</Text>
                                  </View>
                                )}
                                {item.data.plan && (
                                  <View style={styles.userDetailRow}>
                                    <DollarSign size={14} color="#F3B62B" style={styles.userDetailIcon} />
                                    <Text style={styles.userDetailText}>
                                      {item.data.plan.title} Plan - {item.data.plan.price}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            )}

                            <Text style={styles.notificationTime}>
                              {formatTimestamp(item.timestamp)}
                            </Text>
                          </View>
                          {!item.read && <View style={styles.unreadIndicator} />}
                        </View>
                      ) : (
                        <>
                          <View style={styles.notificationIconContainer}>
                            {getNotificationIcon(item.type)}
                          </View>
                          <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>{item.title}</Text>
                            <Text style={styles.notificationMessage}>{item.message}</Text>

                            {/* Show user details for user_signup notifications */}
                            {item.type === 'user_signup' && item.data?.user && (
                              <View style={styles.userDetailsContainer}>
                                <View style={styles.userDetailRow}>
                                  <Mail size={14} color="#666666" style={styles.userDetailIcon} />
                                  <Text style={styles.userDetailText}>{item.data.user.email}</Text>
                                </View>
                                {item.data.user.phone && (
                                  <View style={styles.userDetailRow}>
                                    <Phone size={14} color="#666666" style={styles.userDetailIcon} />
                                    <Text style={styles.userDetailText}>{item.data.user.phone}</Text>
                                  </View>
                                )}
                                {item.data.user.city && item.data.user.state && (
                                  <View style={styles.userDetailRow}>
                                    <MapPin size={14} color="#666666" style={styles.userDetailIcon} />
                                    <Text style={styles.userDetailText}>{item.data.user.city}, {item.data.user.state}</Text>
                                  </View>
                                )}
                                {item.data.user.role && (
                                  <View style={styles.userDetailRow}>
                                    <UserCheck size={14} color="#5C6BC0" style={styles.userDetailIcon} />
                                    <Text style={styles.userDetailText}>
                                      Role: {item.data.user.role.charAt(0).toUpperCase() + item.data.user.role.slice(1)}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            )}

                            {/* Show referral details for referral notifications */}
                            {item.type === 'referral' && item.data && (
                              <View style={styles.referralDetailsContainer}>
                                <View style={styles.referralDetailRow}>
                                  <User size={14} color="#666666" style={styles.referralDetailIcon} />
                                  <Text style={styles.referralDetailText}>
                                    {item.data.user.name} ({item.data.user.email})
                                  </Text>
                                </View>
                                <View style={styles.referralDetailRow}>
                                  <Gift size={14} color="#F3B62B" style={styles.referralDetailIcon} />
                                  <Text style={styles.referralDetailText}>
                                    Code: <Text style={styles.referralCode}>{item.data.referralCode}</Text>
                                  </Text>
                                </View>
                                <View style={styles.referralDetailRow}>
                                  <Award size={14} color="#F3B62B" style={styles.referralDetailIcon} />
                                  <Text style={styles.referralDetailText}>
                                    Premium access granted
                                  </Text>
                                </View>
                              </View>
                            )}

                            <Text style={styles.notificationTime}>
                              {formatTimestamp(item.timestamp)}
                            </Text>
                          </View>
                          {!item.read && <View style={styles.unreadIndicator} />}
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.notificationsList}
                />
              </>
            ) : (
              <View style={styles.emptyNotifications}>
                <Bell size={48} color="#e0e0e0" />
                <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1976D2",
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666666",
  },
  adminName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976D2",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16, // Add gap between the two cards
  },
  singleStatCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
  },
  statTrend: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statTrendText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 2,
  },
  viewAllButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  activitiesContainer: {
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityTime: {
    fontSize: 12,
    color: "#9e9e9e",
    marginLeft: 4,
  },
  emptyActivities: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActivitiesText: {
    fontSize: 16,
    color: "#9e9e9e",
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: "#E53935",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  // Notification Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  notificationContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingBottom: 20,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  closeButton: {
    padding: 8,
  },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  markAllReadText: {
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 4,
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: "relative",
  },
  notificationItemUnread: {
    backgroundColor: "#f0f7ff",
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9e9e9e",
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1976D2",
    position: "absolute",
    top: 16,
    right: 16,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: "#9e9e9e",
    marginTop: 16,
  },
  userDetailsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  userDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  userDetailIcon: {
    marginRight: 8,
  },
  userDetailText: {
    fontSize: 13,
    color: "#666666",
  },
  premiumUserText: {
    color: "#F3B62B",
    fontWeight: "500",
  },
  referralDetailsContainer: {
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  referralDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  referralDetailIcon: {
    marginRight: 8,
  },
  referralDetailText: {
    fontSize: 13,
    color: "#666666",
  },
  referralCode: {
    fontWeight: "bold",
    color: "#F3B62B",
  },
  // Contact Request Notification Styles
  contactRequestNotification: {
    flex: 1,
  },
  contactRequestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  contactRequestIcon: {
    marginRight: 12,
  },
  contactRequestTitleContainer: {
    flex: 1,
  },
  contactRequestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  contactRequestTime: {
    fontSize: 12,
    color: "#9e9e9e",
    marginTop: 2,
  },
  contactRequestMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  contactDetailsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contactDetailSection: {
    marginBottom: 8,
  },
  contactDetailSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 6,
  },
  contactDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingLeft: 8,
  },
  contactDetailIcon: {
    marginRight: 8,
  },
  contactDetailText: {
    fontSize: 14,
    color: "#666666",
  },
  contactDetailDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  // Role Change Notification Styles
  roleChangeNotification: {
    flexDirection: "row",
    flex: 1,
  },
  // Payment Success Notification Styles
  paymentSuccessNotification: {
    flexDirection: "row",
    flex: 1,
  },
  
  // Loading Container
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 15,
    textAlign: "center",
  },
  
  // Pending Approvals Styles
  pendingApprovalsContainer: {
    marginTop: 10,
  },
  pendingApprovalItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  pendingApprovalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  pendingApprovalUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingApprovalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  pendingApprovalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  pendingApprovalEmail: {
    fontSize: 14,
    color: "#666666",
  },
  pendingApprovalBadge: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  pendingApprovalBadgeText: {
    color: "#F3B62B",
    fontSize: 12,
    fontWeight: "bold",
  },
  pendingApprovalDetails: {
    marginBottom: 15,
  },
  pendingApprovalDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  pendingApprovalDetailText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 10,
  },
  pendingApprovalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pendingApprovalAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
  },
  approveButton: {
    backgroundColor: "#43A047",
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: "#E53935",
  },
  pendingApprovalActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  
  // Transaction Styles
  transactionsContainer: {
    marginTop: 10,
  },
  transactionItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  transactionAmount: {
    fontSize: 14,
    color: "#666666",
  },
  transactionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  transactionStatusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  transactionDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  transactionDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  transactionDetailText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 5,
  },
});