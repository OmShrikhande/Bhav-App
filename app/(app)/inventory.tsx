import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore, InventoryItem } from "@/store/auth-store";
import * as Haptics from "expo-haptics";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Tag,
  ShoppingBag,
  Info,
  IndianRupee,
  ArrowLeft
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function InventoryScreen() {
  const { user, addInventoryItem, updateInventoryItem, deleteInventoryItem, toggleInventoryItemVisibility, getInventoryItemsForSeller } = useAuthStore();
  const router = useRouter();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form state
  const [productName, setProductName] = useState("");
  const [buyPremium, setBuyPremium] = useState("");
  const [sellPremium, setSellPremium] = useState("");
  const [isBuyPremiumEnabled, setIsBuyPremiumEnabled] = useState(true);
  const [isSellPremiumEnabled, setIsSellPremiumEnabled] = useState(true);
  const [productType, setProductType] = useState<"Gold" | "Silver" | "">("");

  // Animation values
  const formAnimation = useRef(new Animated.Value(0)).current;
  const formHeight = formAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 320]
  });

  // Fetch inventory items
  const fetchInventoryItems = () => {
    if (user) {
      const items = getInventoryItemsForSeller(user.id);
      setInventoryItems(items);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, [user]);

  // Handle form animation
  const animateForm = (show: boolean) => {
    Animated.timing(formAnimation, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  // Show add form
  const handleShowAddForm = () => {
    // Reset form state
    setProductName("");
    setBuyPremium("");
    setSellPremium("");
    setIsBuyPremiumEnabled(true);
    setIsSellPremiumEnabled(true);
    setEditingItemId(null);
    setProductType("");

    setShowAddForm(true);
    animateForm(true);

    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Hide add form
  const handleHideAddForm = () => {
    animateForm(false);
    setTimeout(() => {
      setShowAddForm(false);
    }, 300);
  };

  // Handle edit item
  const handleEditItem = (item: InventoryItem) => {
    setProductName(item.productName);
    setBuyPremium(item.buyPremium.toString());
    setSellPremium(item.sellPremium.toString());
    setIsBuyPremiumEnabled(Boolean(item.isBuyPremiumEnabled));
    setIsSellPremiumEnabled(Boolean(item.isSellPremiumEnabled));
    setEditingItemId(item.id);
    setProductType(
      item.productType === "Gold" || item.productType === "Silver" ? item.productType : ""
    );

    setShowAddForm(true);
    animateForm(true);

    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Add input validation function
  const validatePremiumInput = (value: string): boolean => {
    // Allow empty string, numbers, negative numbers, and decimal points
    const regex = /^-?\d*\.?\d*$/;
    return regex.test(value) || value === '' || value === '-';
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!productName) {
      Alert.alert("Error", "Please enter a product name.");
      return;
    }

    // Updated validation - allow negative values
    if (isBuyPremiumEnabled && (!buyPremium || isNaN(parseFloat(buyPremium)))) {
      Alert.alert("Error", "Please enter a valid buy premium (can be negative).");
      return;
    }

    if (isSellPremiumEnabled && (!sellPremium || isNaN(parseFloat(sellPremium)))) {
      Alert.alert("Error", "Please enter a valid sell premium (can be negative).");
      return;
    }

    if (!productType) {
      Alert.alert("Error", "Please select a product type.");
      return;
    }

    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsLoading(true);

    try {
      if (editingItemId) {
        // Update existing item
        const result = await updateInventoryItem({
          id: editingItemId,
          productName,
          buyPremium: isBuyPremiumEnabled ? parseFloat(buyPremium) : 0,
          sellPremium: isSellPremiumEnabled ? parseFloat(sellPremium) : 0,
          isBuyPremiumEnabled,
          isSellPremiumEnabled,
          isVisible: true // Keep visibility unchanged
        });

        if (result.success) {
          // Hide form
          handleHideAddForm();

          // Refresh inventory items
          fetchInventoryItems();

          Alert.alert(
            "Success",
            "Product updated successfully!",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert("Error", result.error || "Failed to update product.");
        }
      } else {
        // Add new item
        const result = addInventoryItem({
          sellerId: user?.id || "",
          productName,
          productType,
          buyPremium: isBuyPremiumEnabled ? parseFloat(buyPremium) : 0,
          sellPremium: isSellPremiumEnabled ? parseFloat(sellPremium) : 0,
          isBuyPremiumEnabled,
          isSellPremiumEnabled,
          isVisible: true,
          price: 0,
          quantity: 0,
          image: undefined
        });

        if ((await result).success) {
          // Hide form
          handleHideAddForm();

          // Refresh inventory items
          fetchInventoryItems();

          Alert.alert(
            "Success",
            "Product added successfully!",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert("Error", (await result).error || "Failed to add product.");
        }
      }
    } catch (error) {
      console.error("Error adding/updating product:", error);
      Alert.alert("Error", "Failed to add/update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);

            try {
              const result = await deleteInventoryItem(itemId);

              if (result.success) {
                // Trigger haptic feedback
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }

                // Refresh inventory items
                fetchInventoryItems();

                Alert.alert(
                  "Success",
                  "Product deleted successfully!",
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert("Error", result.error || "Failed to delete product.");
              }
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product. Please try again.");
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  // Handle toggle item visibility
  const handleToggleVisibility = async (itemId: string, currentVisibility: boolean) => {
    try {
      const result = await toggleInventoryItemVisibility(itemId);

      if (result.success) {
        // Trigger haptic feedback
        if (Platform.OS !== "web") {
          Haptics.selectionAsync();
        }

        // Refresh inventory items
        fetchInventoryItems();

        Alert.alert(
          "Success",
          `Product ${currentVisibility ? "hidden" : "visible"} successfully!`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to update product visibility.");
      }
    } catch (error) {
      console.error("Error toggling product visibility:", error);
      Alert.alert("Error", "Failed to update product visibility. Please try again.");
    }
  };

  const handleGoBack = () => {
    router.back();
  };



  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />


      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.menuButton}
            >
              <ArrowLeft size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage Inventory</Text>
            <Text style={styles.headerSubtitle}>
              Add and manage your product inventory
            </Text>
          </View>


          {/* Add Product Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleShowAddForm}
            disabled={showAddForm}
          >
            <Plus size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>Add New Product</Text>
          </TouchableOpacity>

          {/* Add/Edit Product Form */}
          {showAddForm && (
            <Animated.View style={[styles.formContainer]}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {editingItemId ? "Edit Product" : "Add New Product"}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleHideAddForm}
                >
                  <X size={20} color="#666666" />
                </TouchableOpacity>
              </View>

              {/* Product Name Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name</Text>
                <View style={styles.inputContainer}>
                  <Package size={20} color="#666666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter product name"
                    placeholderTextColor="#9e9e9e"
                    value={productName}
                    onChangeText={setProductName}
                  />
                </View>
              </View>

              {/* Product Type Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Type</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      productType === "Gold" && styles.typeButtonActive
                    ]}
                    onPress={() => setProductType("Gold")}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        productType === "Gold" && styles.typeButtonTextActive
                      ]}
                    >
                      Gold
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      productType === "Silver" && styles.typeButtonActive
                    ]}
                    onPress={() => setProductType("Silver")}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        productType === "Silver" && styles.typeButtonTextActive
                      ]}
                    >
                      Silver
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Buy Premium Input */}
              <View style={styles.formGroup}>
                <View style={styles.premiumHeader}>
                  <Text style={styles.label}>Buy Premium</Text>
                  <Switch
                    value={isBuyPremiumEnabled}
                    onValueChange={setIsBuyPremiumEnabled}
                    trackColor={{ false: "#e0e0e0", true: "#bbdefb" }}
                    thumbColor={isBuyPremiumEnabled ? "#1976D2" : "#f5f5f5"}
                  />
                </View>
                {isBuyPremiumEnabled && (
                  <View style={styles.inputContainer}>
                    <IndianRupee size={20} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter buy premium (can be negative)"
                      placeholderTextColor="#9e9e9e"
                      keyboardType="numeric"
                      value={buyPremium}
                      onChangeText={(text) => {
                        if (validatePremiumInput(text)) {
                          setBuyPremium(text);
                        }
                      }}
                    />
                  </View>
                )}
              </View>

              {/* Sell Premium Input */}
              <View style={styles.formGroup}>
                <View style={styles.premiumHeader}>
                  <Text style={styles.label}>Sell Premium</Text>
                  <Switch
                    value={isSellPremiumEnabled}
                    onValueChange={setIsSellPremiumEnabled}
                    trackColor={{ false: "#e0e0e0", true: "#bbdefb" }}
                    thumbColor={isSellPremiumEnabled ? "#1976D2" : "#f5f5f5"}
                  />
                </View>
                {isSellPremiumEnabled && (
                  <View style={styles.inputContainer}>
                    <Tag size={20} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter sell premium (can be negative)"
                      placeholderTextColor="#9e9e9e"
                      keyboardType="numeric"
                      value={sellPremium}
                      onChangeText={(text) => {
                        if (validatePremiumInput(text)) {
                          setSellPremium(text);
                        }
                      }}
                    />
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Save size={20} color="#ffffff" />
                    <Text style={styles.submitButtonText}>
                      {editingItemId ? "Update Product" : "Add Product"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Inventory Items */}
          <View style={styles.inventoryContainer}>
            <Text style={styles.sectionTitle}>Your Inventory</Text>

            {inventoryItems.length === 0 ? (
              <View style={styles.emptyInventoryContainer}>
                <ShoppingBag size={48} color="#e0e0e0" />
                <Text style={styles.emptyInventoryText}>
                  You haven't added any products yet
                </Text>
              </View>
            ) : (
              inventoryItems.map((item) => (
                <View key={item.id} style={styles.productCard}>
                  <View style={styles.productCardHeader}>
                    <View style={styles.productNameContainer}>
                      <Package size={20} color="#1976D2" style={styles.productIcon} />
                      <Text style={styles.productName}>{item.productName}</Text>
                    </View>
                    <View style={styles.visibilityBadge}>
                      {item.isVisible ? (
                        <Text style={styles.visibilityBadgeText}>Visible</Text>
                      ) : (
                        <Text style={[styles.visibilityBadgeText, styles.hiddenBadgeText]}>Hidden</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.premiumsContainer}>
                    {item.isBuyPremiumEnabled && (
                      <View style={styles.premiumItem}>
                        <Text style={styles.premiumLabel}>Buy Premium:</Text>
                        <Text style={[
                          styles.premiumValue,
                          item.buyPremium < 0 && styles.negativePremium,
                          item.buyPremium > 0 && styles.positivePremium
                        ]}>
                          ₹{item.buyPremium > 0 ? '+' : ''}{item.buyPremium}
                        </Text>
                      </View>
                    )}

                    {item.isSellPremiumEnabled && (
                      <View style={styles.premiumItem}>
                        <Text style={styles.premiumLabel}>Sell Premium:</Text>
                        <Text style={[
                          styles.premiumValue,
                          item.sellPremium < 0 && styles.negativePremium,
                          item.sellPremium > 0 && styles.positivePremium
                        ]}>
                          ₹{item.sellPremium > 0 ? '+' : ''}{item.sellPremium}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.visibilityButton]}
                      onPress={() => handleToggleVisibility(item.id, item.isVisible)}
                    >
                      {item.isVisible ? (
                        <>
                          <EyeOff size={16} color="#666666" />
                          <Text style={styles.actionButtonText}>Hide</Text>
                        </>
                      ) : (
                        <>
                          <Eye size={16} color="#1976D2" />
                          <Text style={[styles.actionButtonText, { color: "#1976D2" }]}>Show</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditItem(item)}
                    >
                      <Edit size={16} color="#4CAF50" />
                      <Text style={[styles.actionButtonText, { color: "#4CAF50" }]}>Update</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteItem(item.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#E53935" />
                      ) : (
                        <>
                          <Trash2 size={16} color="#E53935" />
                          <Text style={[styles.actionButtonText, { color: "#E53935" }]}>Delete</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Info Card */}
          <View style={styles.infoCardContainer}>
            <LinearGradient
              colors={["#E3F2FD", "#BBDEFB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoCard}
            >
              <View style={styles.infoCardHeader}>
                <Info size={24} color="#1976D2" />
                <Text style={styles.infoCardTitle}>How It Works</Text>
              </View>
              <Text style={styles.infoCardContent}>
                Products with Sell Premium enabled will be visible to customers on their home page.
                Premiums can be positive or negative values. Negative premiums indicate prices below
                spot rates. You can hide products temporarily without deleting them. Update your
                inventory regularly to keep your offerings current.
              </Text>
            </LinearGradient>
          </View>
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3B62B",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
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
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#333333",
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
  inventoryContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  emptyInventoryContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 32,
  },
  emptyInventoryText: {
    fontSize: 16,
    color: "#9e9e9e",
    marginTop: 16,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  productIcon: {
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  visibilityBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visibilityBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4CAF50",
  },
  hiddenBadgeText: {
    color: "#E53935",
  },
  premiumsContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  premiumItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  premiumLabel: {
    fontSize: 14,
    color: "#666666",
    width: 100,
  },
  premiumValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  visibilityButton: {
    backgroundColor: "#f5f5f5",
  },
  editButton: {
    backgroundColor: "#E8F5E9",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
    color: "#666666",
  },
  infoCardContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginLeft: 8,
  },
  infoCardContent: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 22,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },

  menuButton: {
    paddingVertical: 5,
    color: "#1976D2",
  },
  headerTitleContainer: {
    flex: 1,
  },

  // Add these new styles for negative/positive premiums
  negativePremium: {
    color: "#E53935", // Red color for negative premiums
  },
  positivePremium: {
    color: "#4CAF50", // Green color for positive premiums
  },
});