import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Search,
  Filter,
  User,
  ChevronDown,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  RefreshCw,
  Award,
  Store,
  Check,
  Menu
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth-store";

export default function UsersScreen() {
  const router = useRouter();
  const { users, deleteUser, unreadNotificationsCount,
    markAllNotificationsAsRead, } = useAuthStore() as {
      users: Array<{
        id: string;
        fullName?: string;
        name: string;
        email: string;
        role: "admin" | "seller" | "customer" | "buyer" | "seller_pending";
        city?: string;
        state?: string;
        isEmailVerified: boolean;
        phone?: string;
        username?: string;
        sellerTier?: number;
        sellerVerified?: boolean;
      }>;
      deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
      unreadNotificationsCount: number;
      markAllNotificationsAsRead: () => void;
    };
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Convert users from auth store to the format needed for display
  useEffect(() => {
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.fullName || user.name,
      email: user.email,
      role: user.role,
      status: user.role === 'seller_pending' ? 'pending' : 'active', // Set status based on role
      location: user.city && user.state ? `${user.city}, ${user.state}` : "Unknown",
      verified: user.isEmailVerified,
      joinDate: new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      phone: user.phone,
      username: user.username,
      sellerTier: user.sellerTier,
      sellerVerified: user.sellerVerified
    }));

    setUsersList(formattedUsers);
  }, [users]);

  // Filter users based on search query and filters
  const filteredUsers = usersList.filter(user => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()));

    // Role filter
    const matchesRole =
      roleFilter === null ||
      (roleFilter === 'seller' && (user.role === 'seller' || user.role === 'seller_pending')) ||
      (roleFilter !== 'seller' && user.role === roleFilter);

    // Status filter
    const matchesStatus =
      statusFilter === null ||
      user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const clearFilters = () => {
    setRoleFilter(null);
    setStatusFilter(null);
    setFilterVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);

    // Simulate refresh by waiting a bit
    setTimeout(() => {
      // Re-fetch users from auth store
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.fullName || user.name,
        email: user.email,
        role: user.role,
        status: user.role === 'seller_pending' ? 'pending' : 'active',
        location: user.city && user.state ? `${user.city}, ${user.state}` : "Unknown",
        verified: user.isEmailVerified,
        joinDate: new Date().toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        phone: user.phone,
        username: user.username,
        sellerTier: user.sellerTier,
        sellerVerified: user.sellerVerified
      }));

      setUsersList(formattedUsers);
      setRefreshing(false);
    }, 500);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${userName}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            setIsDeleting(true);
            setDeletingUserId(userId);

            try {
              const result = await deleteUser(userId);

              if (result.success) {
                // User deleted successfully
                // Remove the user from the local usersList state
                setUsersList(prevUsers => prevUsers.filter(user => user.id !== userId));
                Alert.alert("Success", "User deleted successfully");
              } else {
                // Error deleting user
                Alert.alert("Error", result.error || "Failed to delete user");
              }
            } catch (error) {
              Alert.alert("Error", "An unexpected error occurred");
              console.error(error);
            } finally {
              setIsDeleting(false);
              setDeletingUserId(null);
            }
          },
          style: "destructive"
        }
      ]
    );
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
          style={styles.menuButton}
        >
          <Menu size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>User Management</Text>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#9e9e9e" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#9e9e9e"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterVisible(!filterVisible)}
          >
            <Filter size={20} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {filterVisible && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filters</Text>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Role</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    roleFilter === "admin" && styles.filterOptionSelected
                  ]}
                  onPress={() => setRoleFilter(roleFilter === "admin" ? null : "admin")}
                >
                  <Text style={[
                    styles.filterOptionText,
                    roleFilter === "admin" && styles.filterOptionTextSelected
                  ]}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    roleFilter === "seller" && styles.filterOptionSelected
                  ]}
                  onPress={() => setRoleFilter(roleFilter === "seller" ? null : "seller")}
                >
                  <Text style={[
                    styles.filterOptionText,
                    roleFilter === "seller" && styles.filterOptionTextSelected
                  ]}>Seller</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    roleFilter === "customer" && styles.filterOptionSelected
                  ]}
                  onPress={() => setRoleFilter(roleFilter === "customer" ? null : "customer")}
                >
                  <Text style={[
                    styles.filterOptionText,
                    roleFilter === "customer" && styles.filterOptionTextSelected
                  ]}>Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    roleFilter === "buyer" && styles.filterOptionSelected
                  ]}
                  onPress={() => setRoleFilter(roleFilter === "buyer" ? null : "buyer")}
                >
                  <Text style={[
                    styles.filterOptionText,
                    roleFilter === "buyer" && styles.filterOptionTextSelected
                  ]}>Buyer</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    statusFilter === "active" && styles.filterOptionSelected
                  ]}
                  onPress={() => setStatusFilter(statusFilter === "active" ? null : "active")}
                >
                  <Text style={[
                    styles.filterOptionText,
                    statusFilter === "active" && styles.filterOptionTextSelected
                  ]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    statusFilter === "inactive" && styles.filterOptionSelected
                  ]}
                  onPress={() => setStatusFilter(statusFilter === "inactive" ? null : "inactive")}
                >
                  <Text style={[
                    styles.filterOptionText,
                    statusFilter === "inactive" && styles.filterOptionTextSelected
                  ]}>Inactive</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    statusFilter === "pending" && styles.filterOptionSelected
                  ]}
                  onPress={() => setStatusFilter(statusFilter === "pending" ? null : "pending")}
                >
                  <Text style={[
                    styles.filterOptionText,
                    statusFilter === "pending" && styles.filterOptionTextSelected
                  ]}>Pending</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.usersListHeader}>
          <Text style={styles.usersCount}>{filteredUsers.length} Users</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <RefreshCw size={16} color="#1976D2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortButtonText}>Sort by</Text>
              <ChevronDown size={16} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.usersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1976D2"]}
              tintColor="#1976D2"
            />
          }
        >
          {filteredUsers.map(user => (
            <View key={user.id} style={[
              styles.userCard,
              user.role === 'seller_pending' && styles.pendingSellerCard
            ]}>
              <View style={styles.userCardHeader}>
                <View style={styles.userIconContainer}>
                  {user.role === "admin" ? (
                    <Shield size={20} color="#1976D2" />
                  ) : user.role === "seller" || user.role === "seller_pending" ? (
                    <Store size={20} color={user.role === "seller" ? "#43A047" : "#FFA000"} />
                  ) : (
                    <User size={20} color="#333333" />
                  )}
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameContainer}>
                    <Text style={styles.userName}>{user.name}</Text>
                    {/* {user.sellerTier === 2 && (
                      <View style={styles.premiumBadge}>
                        <Award size={12} color="#F3B62B" />
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )} */}
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={styles.userActions}>
                  <TouchableOpacity style={styles.userActionButton}>
                    <Edit size={18} color="#1976D2" />
                  </TouchableOpacity>
                  {user.role !== "admin" && (
                    <TouchableOpacity
                      style={styles.userActionButton}
                      onPress={() => handleDeleteUser(user.id, user.name)}
                      disabled={isDeleting}
                    >
                      {isDeleting && deletingUserId === user.id ? (
                        <ActivityIndicator size="small" color="#E53935" />
                      ) : (
                        <Trash2 size={18} color="#E53935" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.userCardDetails}>
                <View style={styles.userDetailItem}>
                  <Text style={styles.userDetailLabel}>Role:</Text>
                  <View style={[
                    styles.userDetailBadge,
                    user.role === "admin" && styles.adminBadge,
                    user.role === "seller" && styles.sellerBadge,
                    user.role === "seller_pending" && styles.pendingSellerBadge,
                    (user.role === "customer" || user.role === "buyer") && styles.customerBadge,
                  ]}>
                    <Text style={[
                      styles.userDetailBadgeText,
                      user.role === "admin" && styles.adminBadgeText,
                      user.role === "seller" && styles.sellerBadgeText,
                      user.role === "seller_pending" && styles.pendingSellerBadgeText,
                      (user.role === "customer" || user.role === "buyer") && styles.customerBadgeText,
                    ]}>
                      {user.role === "seller_pending" ? "Pending Seller" :
                        user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.userDetailItem}>
                  <Text style={styles.userDetailLabel}>Status:</Text>
                  <View style={[
                    styles.userDetailBadge,
                    user.status === "active" && styles.activeBadge,
                    user.status === "inactive" && styles.inactiveBadge,
                    user.status === "pending" && styles.pendingBadge,
                  ]}>
                    <Text style={[
                      styles.userDetailBadgeText,
                      user.status === "active" && styles.activeBadgeText,
                      user.status === "inactive" && styles.inactiveBadgeText,
                      user.status === "pending" && styles.pendingBadgeText,
                    ]}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.userDetailItem}>
                  <Text style={styles.userDetailLabel}>Verified:</Text>
                  {user.verified ? (
                    <CheckCircle size={18} color="#43A047" />
                  ) : (
                    <XCircle size={18} color="#E53935" />
                  )}
                </View>
              </View>

              {/* Seller Tier Info */}
              {/* {(user.role === 'seller' || user.role === 'seller_pending') && (
                <View style={styles.sellerInfoContainer}>
                  <View style={styles.sellerInfoHeader}>
                    <Store size={16} color={user.role === 'seller' ? "#43A047" : "#FFA000"} />
                    <Text style={[
                      styles.sellerInfoTitle,
                      user.role === 'seller_pending' && styles.pendingSellerInfoTitle
                    ]}>
                      {user.role === 'seller' ?
                        (user.sellerTier === 2 ? "Premium Seller" : "Basic Seller") :
                        "Pending Seller Verification"}
                    </Text>
                  </View>
                  <Text style={styles.sellerInfoText}>
                    {user.role === 'seller' ?
                      `This user is a verified ${user.sellerTier === 2 ? "premium" : "basic"} seller` :
                      "This user has applied to become a seller but hasn't completed verification"}
                  </Text>
                </View>
              )} */}

              {user.phone && (
                <View style={styles.userContactInfo}>
                  <Text style={styles.userContactLabel}>Phone:</Text>
                  <Text style={styles.userContactValue}>{user.phone}</Text>
                </View>
              )}

              <View style={styles.userCardFooter}>
                <Text style={styles.userLocation}>{user.location} {user.city} {user.state}</Text>
                <Text style={styles.userJoinDate}>Joined: {user.joinDate}</Text>
              </View>

              {/* Delete button for non-admin users */}
              {user.role !== "admin" && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(user.id, user.name)}
                  disabled={isDeleting}
                >
                  {isDeleting && deletingUserId === user.id ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Trash2 size={16} color="#ffffff" />
                      <Text style={styles.deleteButtonText}>Delete User</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))}

          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <User size={48} color="#e0e0e0" />
              <Text style={styles.emptyStateText}>No users found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#333333",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  filtersContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: "#E3F2FD",
  },
  filterOptionText: {
    fontSize: 12,
    color: "#666666",
  },
  filterOptionTextSelected: {
    color: "#1976D2",
    fontWeight: "500",
  },
  clearFiltersButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },
  usersListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  usersCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#1976D2",
    marginRight: 4,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pendingSellerCard: {
    borderWidth: 1,
    borderColor: "#FFA000",
    backgroundColor: "#FFF8E1",
  },
  userCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginRight: 8,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F5D76E",
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#F3B62B",
    marginLeft: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666666",
  },
  userActions: {
    flexDirection: "row",
  },
  userActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  userCardDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  userDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  userDetailLabel: {
    fontSize: 14,
    color: "#666666",
    marginRight: 4,
  },
  userDetailBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  userDetailBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  adminBadge: {
    backgroundColor: "#E3F2FD",
  },
  adminBadgeText: {
    color: "#1976D2",
  },
  sellerBadge: {
    backgroundColor: "#E8F5E9",
  },
  sellerBadgeText: {
    color: "#43A047",
  },
  pendingSellerBadge: {
    backgroundColor: "#FFF8E1",
  },
  pendingSellerBadgeText: {
    color: "#FFA000",
  },
  customerBadge: {
    backgroundColor: "#E8F5E9",
  },
  customerBadgeText: {
    color: "#43A047",
  },
  activeBadge: {
    backgroundColor: "#E8F5E9",
  },
  activeBadgeText: {
    color: "#43A047",
  },
  inactiveBadge: {
    backgroundColor: "#FFEBEE",
  },
  inactiveBadgeText: {
    color: "#E53935",
  },
  pendingBadge: {
    backgroundColor: "#FFF8E1",
  },
  pendingBadgeText: {
    color: "#FFA000",
  },
  sellerInfoContainer: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pendingSellerInfoContainer: {
    backgroundColor: "#FFF8E1",
  },
  sellerInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sellerInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#43A047",
    marginLeft: 8,
  },
  pendingSellerInfoTitle: {
    color: "#FFA000",
  },
  sellerInfoText: {
    fontSize: 13,
    color: "#333333",
  },
  userContactInfo: {
    flexDirection: "row",
    marginBottom: 5,
    paddingBottom: 12,
    borderBottomColor: "#f0f0f0",
  },
  userContactLabel: {
    fontSize: 14,
    color: "#666666",
    marginRight: 4,
  },
  userContactValue: {
    fontSize: 14,
    color: "#333333",
  },
  userCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  userLocation: {
    fontSize: 12,
    color: "#666666",
  },
  userJoinDate: {
    fontSize: 12,
    color: "#9e9e9e",
  },
  deleteButton: {
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9e9e9e",
    marginTop: 8,
  },


  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuButton: {
    // padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
    marginLeft: -20,
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
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },
});