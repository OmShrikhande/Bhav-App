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
  Modal,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { ShoppingBag, Plus, Edit, Trash2, Menu, Search, X, Check, ArrowLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function InventoryScreen() {
  const { user, firebaseAuth } = useAuth();
  const router = useRouter();
  
  // Get user from either auth store
  const currentUser = firebaseAuth.user || user;
  
  // Get inventory functions from auth store
  const { 
    getInventoryItemsForSeller, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem 
  } = useAuthStore();
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Form state
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load inventory items
  useEffect(() => {
    if (currentUser) {
      loadInventory();
    } else {
      // Redirect to login if no user
      router.replace("/auth/login");
    }
  }, [currentUser]);
  
  // Load inventory items
  const loadInventory = () => {
    setLoading(true);
    try {
      const items = getInventoryItemsForSeller(currentUser?.id || "");
      setInventory(items);
    } catch (error) {
      console.error("Error loading inventory:", error);
      Alert.alert("Error", "Failed to load inventory items.");
    } finally {
      setLoading(false);
    }
  };
  
  // Filter inventory items by search query
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle add item
  const handleAddItem = async () => {
    if (!itemName || !itemPrice) {
      Alert.alert("Error", "Name and price are required.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const newItem = {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        quantity: parseInt(itemQuantity) || 0,
        category: itemCategory,
        image: itemImage,
        sellerId: currentUser?.id || "",
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const result = await addInventoryItem(newItem);
      
      if (result.success) {
        // Trigger haptic feedback on success
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Reset form and close modal
        resetForm();
        setShowAddModal(false);
        
        // Reload inventory
        loadInventory();
        
        Alert.alert("Success", "Item added successfully.");
      } else {
        Alert.alert("Error", result.error || "Failed to add item.");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle edit item
  const handleEditItem = async () => {
    if (!currentItem || !itemName || !itemPrice) {
      Alert.alert("Error", "Name and price are required.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const updatedItem = {
        ...currentItem,
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        quantity: parseInt(itemQuantity) || 0,
        category: itemCategory,
        image: itemImage,
        updatedAt: Date.now()
      };
      
      const result = await updateInventoryItem(updatedItem);
      
      if (result.success) {
        // Trigger haptic feedback on success
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Reset form and close modal
        resetForm();
        setShowEditModal(false);
        
        // Reload inventory
        loadInventory();
        
        Alert.alert("Success", "Item updated successfully.");
      } else {
        Alert.alert("Error", result.error || "Failed to update item.");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle delete item
  const handleDeleteItem = (item: any) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const result = await deleteInventoryItem(item.id);
              
              if (result.success) {
                // Trigger haptic feedback on success
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                
                // Reload inventory
                loadInventory();
                
                Alert.alert("Success", "Item deleted successfully.");
              } else {
                Alert.alert("Error", result.error || "Failed to delete item.");
              }
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert("Error", "An unexpected error occurred. Please try again.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  
  // Reset form
  const resetForm = () => {
    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemQuantity("");
    setItemCategory("");
    setItemImage("");
    setCurrentItem(null);
  };
  
  // Open edit modal
  const openEditModal = (item: any) => {
    setCurrentItem(item);
    setItemName(item.name);
    setItemDescription(item.description || "");
    setItemPrice(item.price.toString());
    setItemQuantity(item.quantity ? item.quantity.toString() : "0");
    setItemCategory(item.category || "");
    setItemImage(item.image || "");
    setShowEditModal(true);
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/drawer")} style={styles.menuButton}>
          <Menu size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <View style={styles.addButton}>
            <Plus size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory..."
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
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          {filteredInventory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ShoppingBag size={64} color="#ccc" />
              <Text style={styles.emptyText}>No inventory items found</Text>
              <TouchableOpacity 
                style={styles.addItemButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addItemButtonText}>Add New Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredInventory.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity 
                      onPress={() => openEditModal(item)}
                      style={styles.actionButton}
                    >
                      <Edit size={18} color="#F3B62B" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteItem(item)}
                      style={styles.actionButton}
                    >
                      <Trash2 size={18} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.itemDetails}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  ) : (
                    <View style={styles.noImage}>
                      <ShoppingBag size={32} color="#ccc" />
                    </View>
                  )}
                  
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description || "No description"}
                    </Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemCategory}>
                        {item.category || "Uncategorized"}
                      </Text>
                      <Text style={styles.itemQuantity}>
                        Qty: {item.quantity || 0}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      
      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Item</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Item name"
                  value={itemName}
                  onChangeText={setItemName}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Item description"
                  value={itemDescription}
                  onChangeText={setItemDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Price (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={itemQuantity}
                    onChangeText={setItemQuantity}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Item category"
                  value={itemCategory}
                  onChangeText={setItemCategory}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  value={itemImage}
                  onChangeText={setItemImage}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddItem}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Edit Item Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Item</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Item name"
                  value={itemName}
                  onChangeText={setItemName}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Item description"
                  value={itemDescription}
                  onChangeText={setItemDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Price (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={itemQuantity}
                    onChangeText={setItemQuantity}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Item category"
                  value={itemCategory}
                  onChangeText={setItemCategory}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  value={itemImage}
                  onChangeText={setItemImage}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  resetForm();
                  setShowEditModal(false);
                }}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditItem}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Item</Text>
                )}
              </TouchableOpacity>
            </View>
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
  addButton: {
    backgroundColor: "#F3B62B",
    borderRadius: 50,
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
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  addItemButton: {
    marginTop: 24,
    backgroundColor: "#F3B62B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addItemButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  itemActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  itemDetails: {
    flexDirection: "row",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  noImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F3B62B",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemCategory: {
    fontSize: 12,
    color: "#888",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  modalScrollView: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#F3B62B",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});