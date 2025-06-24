import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { useMetalPrices } from "@/hooks/useMetalPrices";
import { Phone, X } from "lucide-react-native";
import React, { useState, useEffect } from "react";

export default function ModalScreen() {
  const { itemId } = useLocalSearchParams();
  const { prices } = useMetalPrices();
  const { getAllInventoryItems, updateInventoryItem, user } = useAuthStore();

  const isSeller = user?.role === "seller";
  const isCustomer = user?.role === "customer";
  const isAdmin = user?.role === "admin";

  const [item, setItem] = useState<any>(null);
  const [editBuyPremium, setEditBuyPremium] = useState('');
  const [editSellPremium, setEditSellPremium] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      const items = getAllInventoryItems();
      const found = items.find((i: any) => i.id === itemId);
      setItem(found);
      if (found) {
        setEditBuyPremium(found.buyPremium.toString());
        setEditSellPremium(found.sellPremium.toString());
        setIsVisible(found.isVisible);
      }
    };
    fetchItem();
  }, [itemId, getAllInventoryItems]);

  const handleUpdateProduct = async () => {
    if (!item) return;
    try {
      await updateInventoryItem({
        ...item,
        buyPremium: Number(editBuyPremium),
        sellPremium: Number(editSellPremium),
        isVisible,
      });
      Alert.alert("Success", "Product updated!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update product");
    }
  };

  // Add function to handle calling the seller
  const handleCallSeller = async () => {
    if (!item?.sellerId) {
      Alert.alert("Error", "Seller information not available.");
      return;
    }

    try {
      // Get seller information
      const { getUserById } = useAuthStore.getState();
      const seller = getUserById(item.sellerId);

      if (!seller || !seller.phone) {
        Alert.alert("Error", "Seller's phone number is not available.");
        return;
      }

      // Create phone URL
      const phoneUrl = `tel:${seller.phone}`;

      // Check if device can handle the phone URL
      const canOpen = await Linking.canOpenURL(phoneUrl);

      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert("Error", "Unable to make phone calls on this device.");
      }
    } catch (error) {
      console.error("Error calling seller:", error);
      Alert.alert("Error", "Failed to initiate call. Please try again.");
    }
  };

  if (!item) {
    return (
      <>
        <Text>Loading...</Text>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </>
    );
  }

  return (
    <>
      {isSeller && (
        <View style={styles.container}>
          {/* Only the modal content (no outer container or StatusBar) */}
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{item.productName}</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.productDetails}>
              <Text style={styles.detailLabel}>Product Type:</Text>
              <Text style={styles.detailValue}>{item.productType}</Text>
              <Text style={styles.detailLabel}>Today's Buy:</Text>
              <Text style={styles.highRate}>
                {item.productType === "Gold"
                  ? prices.gold?.buy
                  : item.productType === "Silver"
                    ? prices.silver?.buy
                    : "Loading..."}
              </Text>
              <Text style={styles.detailLabel}>Today's Sell:</Text>
              <Text style={styles.lowRate}>
                {item.productType === "Gold"
                  ? prices.gold?.sell
                  : item.productType === "Silver"
                    ? prices.silver?.sell
                    : "Loading..."}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Buy Premium (₹)</Text>
              <TextInput
                style={styles.input}
                value={editBuyPremium}
                onChangeText={setEditBuyPremium}
                keyboardType="numeric"
                placeholder="Enter buy premium"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Sell Premium (₹)</Text>
              <TextInput
                style={styles.input}
                value={editSellPremium}
                onChangeText={setEditSellPremium}
                keyboardType="numeric"
                placeholder="Enter sell premium"
              />
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.hideButton]}
                onPress={async () => {
                  if (!item) return;
                  try {
                    await updateInventoryItem({
                      ...item,
                      buyPremium: Number(editBuyPremium),
                      sellPremium: Number(editSellPremium),
                      isVisible: !isVisible,
                    });
                    setIsVisible(!isVisible);
                    setItem({ ...item, isVisible: !isVisible });
                    Alert.alert(
                      isVisible ? "Product hidden!" : "Product visible!",
                      isVisible
                        ? "This product is now hidden from all inventories."
                        : "This product is now visible in all inventories."
                    );
                  } catch (error) {
                    Alert.alert("Error", "Failed to update product visibility.");
                  }
                }}
              >
                <Text style={styles.buttonText}>{isVisible ? "Hide" : "Unhide"}</Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdateProduct}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}


      {
        (isCustomer || isAdmin) && (
          <View style={styles.container}>
            {/* Only the modal content (no outer container or StatusBar) */}
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{item.productName}</Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.phoneButton}
                    onPress={handleCallSeller}
                  >
                    <Phone color="#333" size={22} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.phoneButton} onPress={() => router.back()}>
                    <X size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.detailLabel}>Product Type:</Text>
                <Text style={styles.detailValue}>{item.productType}</Text>
                <Text style={styles.detailLabel}>Today's Buy:</Text>
                <Text style={styles.highRate}>
                  {item.productType === "Gold"
                    ? prices.gold?.buy
                    : item.productType === "Silver"
                      ? prices.silver?.buy
                      : "Loading..."}
                </Text>
                <Text style={styles.detailLabel}>Today's Sell:</Text>
                <Text style={styles.lowRate}>
                  {item.productType === "Gold"
                    ? prices.gold?.sell
                    : item.productType === "Silver"
                      ? prices.silver?.sell
                      : "Loading..."}
                </Text>
                <Text style={styles.inputLabel}>Buy Premium (₹): <Text style={{ fontWeight: "bold" }}>{item.buyPremium}</Text></Text>
                <Text style={styles.inputLabel}>Sell Premium (₹): <Text style={{ fontWeight: "bold" }}>{item.sellPremium}</Text></Text>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buyButton]}
                  onPress={async () => {
                    if (!item || !user) return;
                    const result = await useAuthStore.getState().createBuyRequest(item.id, user.id, item.sellerId);
                    if (result.success) {
                      Alert.alert("Buy", "Buy request sent! Seller will be notified.");
                    } else {
                      Alert.alert("Error", result.error || "Failed to send buy request.");
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Buy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.contactButton]}
                  onPress={() => {
                    if (!item || !user) return;
                    useAuthStore.getState().contactDealer(item.sellerId);
                    Alert.alert("Contact", "Seller will be notified that you want to contact them.");
                  }}
                >
                  <Text style={styles.buttonText}>Sell</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      }
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  productDetails: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 12,
  },
  highRate: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
    marginBottom: 8,
  },
  lowRate: {
    fontSize: 16,
    color: "#F44336",
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  hideButton: {
    backgroundColor: "#1976D2",
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  contactButton: {
    backgroundColor: "#1976D2",
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  phoneButton: {
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
});