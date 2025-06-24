import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Animated
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { firestoreService } from "@/services/firestore";
import { Home, TrendingUp, TrendingDown, Bell, User, Settings, Package, Users, Menu } from "lucide-react-native";
import { useMetalPrices } from "@/hooks/useMetalPrices";

export default function DashboardScreen() {
  const { user, firebaseAuth } = useAuth();
  const router = useRouter();
  
  // Get user from either auth store
  const currentUser = firebaseAuth.user || user;
  
  // Add debugging
  useEffect(() => {
    console.log("Dashboard mounted");
    console.log("Current user:", currentUser);
    console.log("Firebase user:", firebaseAuth.user);
    console.log("Legacy user:", user);
    
    // If no user is found, redirect to login
    if (!currentUser) {
      console.log("No user found in dashboard, redirecting to login");
      // Use a timeout to avoid navigation during render
      setTimeout(() => {
        router.replace("/auth/login");
      }, 100);
    }
  }, [currentUser]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rates, setRates] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Get real-time metal prices
  const { prices, refreshPrices } = useMetalPrices();
  
  // Animation values for price changes
  const goldPriceAnim = useRef(new Animated.Value(1)).current;
  const silverPriceAnim = useRef(new Animated.Value(1)).current;
  
  // Previous prices for comparison
  const prevGoldPrice = useRef<string | null>(null);
  const prevSilverPrice = useRef<string | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch latest rates from Firestore for historical data
      console.log("Fetching latest rates...");
      const latestRates = await firestoreService.getLatestRates();
      console.log("Latest rates received:", latestRates);
      
      // Create a combined rates object using real-time prices and Firestore data
      const combinedRates = {
        gold24k: prices.gold?.buy ? parseFloat(prices.gold.buy) : (latestRates?.gold24k || 6500),
        gold22k: prices.gold?.sell ? parseFloat(prices.gold.sell) : (latestRates?.gold22k || 6000),
        silver: prices.silver?.buy ? parseFloat(prices.silver.buy) : (latestRates?.silver || 85),
        timestamp: new Date(),
        gold: {
          buy: prices.gold?.buy ? parseFloat(prices.gold.buy) : (latestRates?.gold?.buy || 6500),
          sell: prices.gold?.sell ? parseFloat(prices.gold.sell) : (latestRates?.gold?.sell || 6000)
        },
        silver: {
          buy: prices.silver?.buy ? parseFloat(prices.silver.buy) : (latestRates?.silver?.buy || 85),
          sell: prices.silver?.sell ? parseFloat(prices.silver.sell) : (latestRates?.silver?.sell || 80)
        },
        lastUpdated: prices.lastUpdated || formatDate(latestRates?.timestamp)
      };
      
      setRates(combinedRates);
      
      // Fetch notifications for the current user
      if (currentUser?.id) {
        const userNotifications = await firestoreService.getNotificationsForUser(currentUser.id);
        setNotifications(userNotifications);
      }
      
      // If user is a seller, fetch their customers
      if (currentUser?.role === 'seller' && currentUser?.id) {
        const sellerCustomers = await firestoreService.getCustomersForSeller(currentUser.id);
        setCustomers(sellerCustomers);
      }
      
      // If user is a customer, fetch sellers
      if (currentUser?.role === 'customer') {
        const allSellers = await firestoreService.getSellers();
        setSellers(allSellers);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Set fallback rates if there's an error, still using real-time prices if available
      console.log("Error fetching rates, using fallback rates");
      const fallbackRates = {
        gold24k: prices.gold?.buy ? parseFloat(prices.gold.buy) : 6500,
        gold22k: prices.gold?.sell ? parseFloat(prices.gold.sell) : 6000,
        silver: prices.silver?.buy ? parseFloat(prices.silver.buy) : 85,
        timestamp: new Date(),
        gold: {
          buy: prices.gold?.buy ? parseFloat(prices.gold.buy) : 6500,
          sell: prices.gold?.sell ? parseFloat(prices.gold.sell) : 6000
        },
        silver: {
          buy: prices.silver?.buy ? parseFloat(prices.silver.buy) : 85,
          sell: prices.silver?.sell ? parseFloat(prices.silver.sell) : 80
        },
        lastUpdated: prices.lastUpdated || new Date().toLocaleString()
      };
      setRates(fallbackRates);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [currentUser?.id]);
  
  // Update rates whenever real-time prices change
  useEffect(() => {
    if (prices.gold?.buy && prices.silver?.buy) {
      // Create a combined rates object using real-time prices
      const realtimeRates = {
        gold24k: prices.gold?.buy ? parseFloat(prices.gold.buy) : (rates?.gold24k || 6500),
        gold22k: prices.gold?.sell ? parseFloat(prices.gold.sell) : (rates?.gold22k || 6000),
        silver: prices.silver?.buy ? parseFloat(prices.silver.buy) : (rates?.silver || 85),
        timestamp: new Date(),
        gold: {
          buy: prices.gold?.buy ? parseFloat(prices.gold.buy) : (rates?.gold?.buy || 6500),
          sell: prices.gold?.sell ? parseFloat(prices.gold.sell) : (rates?.gold?.sell || 6000),
          isUp: prices.gold?.isUp
        },
        silver: {
          buy: prices.silver?.buy ? parseFloat(prices.silver.buy) : (rates?.silver?.buy || 85),
          sell: prices.silver?.sell ? parseFloat(prices.silver.sell) : (rates?.silver?.sell || 80),
          isUp: prices.silver?.isUp
        },
        lastUpdated: prices.lastUpdated || formatDate(rates?.timestamp)
      };
      
      // Check if gold price has changed
      if (prevGoldPrice.current !== prices.gold.buy) {
        // Animate gold price change
        Animated.sequence([
          Animated.timing(goldPriceAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(goldPriceAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          })
        ]).start();
        
        prevGoldPrice.current = prices.gold.buy;
      }
      
      // Check if silver price has changed
      if (prevSilverPrice.current !== prices.silver.buy) {
        // Animate silver price change
        Animated.sequence([
          Animated.timing(silverPriceAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(silverPriceAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          })
        ]).start();
        
        prevSilverPrice.current = prices.silver.buy;
      }
      
      setRates(realtimeRates);
    }
  }, [prices]);
  
  const onRefresh = () => {
    setRefreshing(true);
    refreshPrices(); // Refresh real-time prices
    fetchData();
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#F3B62B" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/drawer")} style={styles.menuButton}>
          <Menu size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => router.push(currentUser ? "/(app)/profile" : "/auth/login")}>
          <View style={styles.profileIcon}>
            {currentUser?.profileImage ? (
              <Image 
                source={{ uri: currentUser.profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <User size={24} color="#333" />
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        {currentUser ? (
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome, {currentUser.name || currentUser.fullName || 'User'}!
            </Text>
            <Text style={styles.roleText}>
              {currentUser.role === 'admin' ? 'Administrator' : 
               currentUser.role === 'seller' ? 'Seller' : 'Customer'}
            </Text>
          </View>
        ) : (
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.roleText}>Please log in to continue</Text>
          </View>
        )}
        
        {/* Live Rates Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#F3B62B" />
            <Text style={styles.sectionTitle}>Live Rates</Text>
          </View>
          
          <View style={styles.ratesContainer}>
            {rates ? (
              <>
                <View style={styles.rateItem}>
                  <Text style={styles.rateLabel}>Gold (24K)</Text>
                  <View style={styles.rateValueContainer}>
                    <Animated.Text 
                      style={[
                        styles.rateValue, 
                        rates.gold?.isUp ? styles.rateUp : rates.gold?.isUp === false ? styles.rateDown : null,
                        { transform: [{ scale: goldPriceAnim }] }
                      ]}
                    >
                      ₹ {rates.gold24k || (rates.gold && rates.gold.buy) || 6500}
                    </Animated.Text>
                    {rates.gold?.isUp !== undefined && (
                      <View style={styles.rateIndicator}>
                        {rates.gold.isUp ? 
                          <TrendingUp size={14} color="#4CAF50" /> : 
                          <TrendingDown size={14} color="#F44336" />
                        }
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.rateItem}>
                  <Text style={styles.rateLabel}>Gold (22K)</Text>
                  <Text style={styles.rateValue}>₹ {rates.gold22k || (rates.gold && rates.gold.sell) || 6000}</Text>
                </View>
                <View style={styles.rateItem}>
                  <Text style={styles.rateLabel}>Silver</Text>
                  <View style={styles.rateValueContainer}>
                    <Animated.Text 
                      style={[
                        styles.rateValue, 
                        rates.silver?.isUp ? styles.rateUp : rates.silver?.isUp === false ? styles.rateDown : null,
                        { transform: [{ scale: silverPriceAnim }] }
                      ]}
                    >
                      ₹ {(typeof rates.silver === 'number' ? rates.silver : (rates.silver && rates.silver.buy)) || 85}
                    </Animated.Text>
                    {rates.silver?.isUp !== undefined && (
                      <View style={styles.rateIndicator}>
                        {rates.silver.isUp ? 
                          <TrendingUp size={14} color="#4CAF50" /> : 
                          <TrendingDown size={14} color="#F44336" />
                        }
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.rateTimestamp}>
                  Last updated: {rates.lastUpdated || formatDate(rates.timestamp)}
                </Text>
              </>
            ) : (
              <Text style={styles.noDataText}>No rate data available</Text>
            )}
            
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => router.push("/(app)/(tabs)/rates")}
            >
              <Text style={styles.viewMoreButtonText}>View More</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notifications Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#F3B62B" />
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
          </View>
          
          <View style={styles.notificationsContainer}>
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notification, index) => (
                <View key={notification.id || index} style={styles.notificationItem}>
                  <View style={[
                    styles.notificationDot, 
                    !notification.read && styles.unreadDot
                  ]} />
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{formatDate(notification.timestamp)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No notifications</Text>
            )}
            
            {notifications.length > 0 && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => router.push("/(app)/(tabs)/home")}
              >
                <Text style={styles.viewMoreButtonText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Role-specific sections */}
        {currentUser?.role === 'seller' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Users size={20} color="#F3B62B" />
              <Text style={styles.sectionTitle}>My Customers</Text>
            </View>
            
            <View style={styles.customersContainer}>
              {customers.length > 0 ? (
                customers.slice(0, 5).map((customer, index) => (
                  <TouchableOpacity 
                    key={customer.id || index} 
                    style={styles.customerItem}
                    onPress={() => router.push(`/(app)/customer/${customer.id}`)}
                  >
                    <View style={styles.customerIcon}>
                      {customer.profileImage ? (
                        <Image 
                          source={{ uri: customer.profileImage }} 
                          style={styles.customerImage} 
                        />
                      ) : (
                        <User size={20} color="#555" />
                      )}
                    </View>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>{customer.name || 'Customer'}</Text>
                      <Text style={styles.customerLocation}>
                        {customer.city ? `${customer.city}${customer.state ? `, ${customer.state}` : ''}` : 'Location not available'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDataText}>No customers yet</Text>
              )}
              
              {customers.length > 0 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => router.push("/(app)/customers")}
                >
                  <Text style={styles.viewMoreButtonText}>View All Customers</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {currentUser?.role === 'customer' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Package size={20} color="#F3B62B" />
              <Text style={styles.sectionTitle}>Available Sellers</Text>
            </View>
            
            <View style={styles.sellersContainer}>
              {sellers.length > 0 ? (
                sellers.slice(0, 5).map((seller, index) => (
                  <TouchableOpacity 
                    key={seller.id || index} 
                    style={styles.sellerItem}
                    onPress={() => router.push(`/(app)/seller-profile/${seller.id}`)}
                  >
                    <View style={styles.sellerIcon}>
                      {seller.profileImage ? (
                        <Image 
                          source={{ uri: seller.profileImage }} 
                          style={styles.sellerImage} 
                        />
                      ) : (
                        <User size={20} color="#555" />
                      )}
                    </View>
                    <View style={styles.sellerInfo}>
                      <Text style={styles.sellerName}>{seller.brandName || seller.name || 'Seller'}</Text>
                      <Text style={styles.sellerLocation}>
                        {seller.city ? `${seller.city}${seller.state ? `, ${seller.state}` : ''}` : 'Location not available'}
                      </Text>
                    </View>
                    {seller.sellerVerified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDataText}>No sellers available</Text>
              )}
              
              {sellers.length > 0 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => router.push("/(app)/seller-data")}
                >
                  <Text style={styles.viewMoreButtonText}>View All Sellers</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateIndicator: {
    marginLeft: 6,
  },
  rateUp: {
    color: '#4CAF50',
  },
  rateDown: {
    color: '#F44336',
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10, // Ensure header is above other elements
  },
  menuButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Increased padding at the bottom to ensure content is fully scrollable
    flexGrow: 1, // This ensures the content can grow beyond the screen height
  },
  welcomeSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  ratesContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rateLabel: {
    fontSize: 16,
    color: '#555',
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  rateTimestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  notificationsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginTop: 5,
    marginRight: 10,
  },
  unreadDot: {
    backgroundColor: '#F3B62B',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  customersContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  customerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  customerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  customerLocation: {
    fontSize: 14,
    color: '#666',
  },
  sellersContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  sellerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sellerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  sellerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sellerLocation: {
    fontSize: 14,
    color: '#666',
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  viewMoreButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3B62B',
    borderRadius: 4,
  },
  viewMoreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    paddingVertical: 16,
  },
});