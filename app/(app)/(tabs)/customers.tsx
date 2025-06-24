import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { 
  Users, 
  Menu, 
  Search, 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  MessageCircle,
  Share2,
  Clock
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function CustomersScreen() {
  const { user, firebaseAuth } = useAuth();
  const router = useRouter();
  
  // Get user from either auth store
  const currentUser = firebaseAuth.user || user;
  
  // Get customer-related functions from auth store
  const { 
    getContactedSellerDetails,
    getNotificationsForUser,
    getUserById
  } = useAuthStore();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Load customer data
  useEffect(() => {
    if (currentUser) {
      loadCustomers();
    } else {
      // Redirect to login if no user
      router.replace("/auth/login");
    }
  }, [currentUser]);
  
  // Load customer data
  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Get contacted seller details (customers who contacted this seller)
      const contactedDetails = getContactedSellerDetails().filter(
        contact => contact.sellerId === currentUser?.id
      );
      
      // Get notifications for buy requests and rate interests
      const notifications = getNotificationsForUser(currentUser?.id || "").filter(
        n => n.type === 'buy_request' || n.type === 'rate_interest' || n.type === 'contact_request'
      );
      
      // Combine data to get unique customers
      const uniqueCustomerIds = new Set();
      const allCustomerData: any[] = [];
      
      // Add customers from contacted details
      for (const contact of contactedDetails) {
        if (!uniqueCustomerIds.has(contact.customerId)) {
          uniqueCustomerIds.add(contact.customerId);
          
          // Get full customer data
          const customerData = await getUserById(contact.customerId);
          if (customerData) {
            allCustomerData.push({
              ...customerData,
              lastContact: contact.timestamp,
              contactType: 'direct_contact'
            });
          }
        }
      }
      
      // Add customers from notifications
      for (const notification of notifications) {
        const customerId = notification.data?.customer?.id || 
                          notification.data?.user?.id ||
                          notification.senderId;
        
        if (customerId && !uniqueCustomerIds.has(customerId)) {
          uniqueCustomerIds.add(customerId);
          
          // Get full customer data
          const customerData = await getUserById(customerId);
          if (customerData) {
            allCustomerData.push({
              ...customerData,
              lastContact: notification.timestamp,
              contactType: notification.type
            });
          }
        }
      }
      
      // Sort by most recent contact
      const sortedCustomers = allCustomerData.sort((a, b) => b.lastContact - a.lastContact);
      setCustomers(sortedCustomers);
    } catch (error) {
      console.error("Error loading customers:", error);
      Alert.alert("Error", "Failed to load customer data.");
    } finally {
      setLoading(false);
    }
  };
  
  // Filter customers by search query
  const filteredCustomers = customers.filter(customer => 
    (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.state || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
  
  // Handle contact customer via phone
  const handlePhoneContact = (phone: string) => {
    if (!phone) {
      Alert.alert("No Phone Number", "This customer has not provided a phone number.");
      return;
    }
    
    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    
    Linking.openURL(`tel:${phone}`);
  };
  
  // Handle contact customer via email
  const handleEmailContact = (email: string) => {
    if (!email) {
      Alert.alert("No Email", "This customer has not provided an email address.");
      return;
    }
    
    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    
    Linking.openURL(`mailto:${email}`);
  };
  
  // Handle contact customer via WhatsApp
  const handleWhatsAppContact = (phone: string) => {
    if (!phone) {
      Alert.alert("No Phone Number", "This customer has not provided a phone number for WhatsApp.");
      return;
    }
    
    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    
    // Format phone number for WhatsApp (remove spaces, dashes, etc.)
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${formattedPhone}`);
  };
  
  // Get contact type label
  const getContactTypeLabel = (type: string) => {
    switch (type) {
      case 'direct_contact':
        return 'Direct Contact';
      case 'buy_request':
        return 'Buy Request';
      case 'rate_interest':
        return 'Rate Interest';
      case 'contact_request':
        return 'Contact Request';
      default:
        return 'Contact';
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/drawer")} style={styles.menuButton}>
          <Menu size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customers</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F3B62B" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          {filteredCustomers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users size={64} color="#ccc" />
              <Text style={styles.emptyText}>No customers found</Text>
              <Text style={styles.emptySubtext}>
                Customers who contact you or show interest in your products will appear here.
              </Text>
            </View>
          ) : (
            filteredCustomers.map((customer) => (
              <View key={customer.id} style={styles.customerCard}>
                <View style={styles.customerHeader}>
                  <View style={styles.customerInfo}>
                    {customer.profileImage ? (
                      <Image source={{ uri: customer.profileImage }} style={styles.customerAvatar} />
                    ) : (
                      <View style={styles.customerAvatarPlaceholder}>
                        <User size={24} color="#F3B62B" />
                      </View>
                    )}
                    
                    <View style={styles.customerDetails}>
                      <Text style={styles.customerName}>
                        {customer.fullName || customer.name || 'Unknown Customer'}
                      </Text>
                      <View style={styles.customerMeta}>
                        <View style={styles.contactTypeBadge}>
                          <Text style={styles.contactTypeText}>
                            {getContactTypeLabel(customer.contactType)}
                          </Text>
                        </View>
                        <View style={styles.lastContactContainer}>
                          <Clock size={12} color="#888" style={{ marginRight: 4 }} />
                          <Text style={styles.lastContactText}>
                            {formatTimestamp(customer.lastContact)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.customerBody}>
                  {(customer.email || customer.phone || customer.city) && (
                    <View style={styles.contactDetails}>
                      {customer.email && (
                        <View style={styles.contactItem}>
                          <Mail size={16} color="#666" style={styles.contactIcon} />
                          <Text style={styles.contactText}>{customer.email}</Text>
                        </View>
                      )}
                      
                      {customer.phone && (
                        <View style={styles.contactItem}>
                          <Phone size={16} color="#666" style={styles.contactIcon} />
                          <Text style={styles.contactText}>{customer.phone}</Text>
                        </View>
                      )}
                      
                      {(customer.city || customer.state) && (
                        <View style={styles.contactItem}>
                          <MapPin size={16} color="#666" style={styles.contactIcon} />
                          <Text style={styles.contactText}>
                            {[customer.city, customer.state].filter(Boolean).join(', ')}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  <View style={styles.actionButtons}>
                    {customer.phone && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handlePhoneContact(customer.phone)}
                      >
                        <Phone size={20} color="#F3B62B" />
                        <Text style={styles.actionButtonText}>Call</Text>
                      </TouchableOpacity>
                    )}
                    
                    {customer.email && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEmailContact(customer.email)}
                      >
                        <Mail size={20} color="#F3B62B" />
                        <Text style={styles.actionButtonText}>Email</Text>
                      </TouchableOpacity>
                    )}
                    
                    {customer.phone && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleWhatsAppContact(customer.phone)}
                      >
                        <MessageCircle size={20} color="#F3B62B" />
                        <Text style={styles.actionButtonText}>WhatsApp</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  customerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  customerMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  contactTypeBadge: {
    backgroundColor: "#F3B62B20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  contactTypeText: {
    fontSize: 12,
    color: "#F3B62B",
    fontWeight: "500",
  },
  lastContactContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastContactText: {
    fontSize: 12,
    color: "#888",
  },
  customerBody: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  contactDetails: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    alignItems: "center",
    padding: 8,
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
});