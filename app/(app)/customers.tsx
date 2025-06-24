import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore, ContactedSeller } from "@/store/auth-store";
import { Search, Filter, Phone, Mail, MapPin, User, Clock, ChevronDown, ChevronUp, Menu } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";

export default function CustomersScreen() {
  const router = useRouter();
  const { user, getCustomersForSeller } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<ContactedSeller[]>([]);

  // Fetch customers for the current seller
  useEffect(() => {
    if (user) {
      const fetchedCustomers = getCustomersForSeller(user.id);
      setCustomers(fetchedCustomers);
      setIsLoading(false);
    }
  }, [user]);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      searchQuery === "" ||
      customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.customerCity && customer.customerCity.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.customerState && customer.customerState.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === "newest") {
      return b.timestamp - a.timestamp;
    } else if (sortBy === "oldest") {
      return a.timestamp - b.timestamp;
    } else if (sortBy === "name") {
      return a.customerName.localeCompare(b.customerName);
    }
    return 0;
  });

  // Handle call customer
  const handleCallCustomer = (phone?: string) => {
    if (!phone) {
      Alert.alert("Error", "No phone number available.");
      return;
    }

    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Open phone app
    Linking.openURL(`tel:${phone}`);
  };

  // Handle email customer
  const handleEmailCustomer = (email: string) => {
    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Open email app
    Linking.openURL(`mailto:${email}`);
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const openDrawer = () => {
    router.push("/drawer");
  };

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
          <Text style={styles.headerTitle}>My Customers</Text>
        </View>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortOptions(!showSortOptions)}
          >
            <Text style={styles.sortButtonText}>
              Sort: {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Name"}
            </Text>
            {showSortOptions ? (
              <ChevronUp size={16} color="#666666" />
            ) : (
              <ChevronDown size={16} color="#666666" />
            )}
          </TouchableOpacity>

          {showSortOptions && (
            <View style={styles.sortOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortBy === "newest" && styles.sortOptionSelected
                ]}
                onPress={() => {
                  setSortBy("newest");
                  setShowSortOptions(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === "newest" && styles.sortOptionTextSelected
                ]}>Newest First</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortBy === "oldest" && styles.sortOptionSelected
                ]}
                onPress={() => {
                  setSortBy("oldest");
                  setShowSortOptions(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === "oldest" && styles.sortOptionTextSelected
                ]}>Oldest First</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortBy === "name" && styles.sortOptionSelected
                ]}
                onPress={() => {
                  setSortBy("name");
                  setShowSortOptions(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === "name" && styles.sortOptionTextSelected
                ]}>Name (A-Z)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9e9e9e" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers by name or location"
            placeholderTextColor="#9e9e9e"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingText}>Loading customers...</Text>
          </View>
        ) : sortedCustomers.length > 0 ? (
          <View style={styles.customersContainer}>
            {sortedCustomers.map((customer, index) => (
              <View key={index} style={styles.customerCard}>
                <View style={styles.customerHeader}>
                  <View style={styles.customerIconContainer}>
                    <User size={20} color="#1976D2" />
                  </View>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{customer.customerName}</Text>
                    <View style={styles.contactTimeContainer}>
                      <Clock size={12} color="#9e9e9e" style={styles.contactTimeIcon} />
                      <Text style={styles.contactTimeText}>
                        Contacted on {formatDate(customer.timestamp)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.customerDetailsContainer}>
                  <View style={styles.customerDetailRow}>
                    <Mail size={16} color="#666666" style={styles.customerDetailIcon} />
                    <Text style={styles.customerDetailText}>{customer.customerEmail}</Text>
                  </View>

                  {customer.customerPhone && (
                    <View style={styles.customerDetailRow}>
                      <Phone size={16} color="#666666" style={styles.customerDetailIcon} />
                      <Text style={styles.customerDetailText}>{customer.customerPhone}</Text>
                    </View>
                  )}

                  {customer.customerCity && (
                    <View style={styles.customerDetailRow}>
                      <MapPin size={16} color="#666666" style={styles.customerDetailIcon} />
                      <Text style={styles.customerDetailText}>
                        {customer.customerCity}
                        {customer.customerState ? `, ${customer.customerState}` : ""}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.customerActionsContainer}>
                  <TouchableOpacity
                    style={[styles.customerActionButton, styles.callButton]}
                    onPress={() => handleCallCustomer(customer.customerPhone)}
                    disabled={!customer.customerPhone}
                  >
                    <Phone size={16} color="#ffffff" />
                    <Text style={styles.customerActionButtonText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.customerActionButton, styles.emailButton]}
                    onPress={() => handleEmailCustomer(customer.customerEmail)}
                  >
                    <Mail size={16} color="#ffffff" />
                    <Text style={styles.customerActionButtonText}>Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <User size={48} color="#e0e0e0" />
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptyText}>
              When customers contact you, they will appear here
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  sortContainer: {
    position: "relative",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#666666",
    marginRight: 4,
  },
  sortOptionsContainer: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 150,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sortOptionSelected: {
    backgroundColor: "#E3F2FD",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#666666",
  },
  sortOptionTextSelected: {
    color: "#1976D2",
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#333333",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 12,
  },
  customersContainer: {
    padding: 20,
  },
  customerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  customerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  contactTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactTimeIcon: {
    marginRight: 4,
  },
  contactTimeText: {
    fontSize: 12,
    color: "#9e9e9e",
  },
  customerDetailsContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  customerDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  customerDetailIcon: {
    marginRight: 8,
  },
  customerDetailText: {
    fontSize: 14,
    color: "#666666",
  },
  customerActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  customerActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  callButton: {
    backgroundColor: "#4CAF50",
  },
  emailButton: {
    backgroundColor: "#1976D2",
  },
  customerActionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
});