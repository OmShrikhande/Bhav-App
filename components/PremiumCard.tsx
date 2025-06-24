import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Image } from "expo-image";
import { Edit, Trash2, Save, DollarSign, IndianRupee, Award } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { images } from "@/constants/images";

export interface PremiumCardProps {
  id?: string;
  name: string;
  basePrice?: string;
  premium?: string;
  type?: string;
  isEditing?: boolean;
  onStartEditing?: (id: string) => void;
  onStopEditing?: () => void;
  onUpdatePremium?: (id: string, premium: string) => void;
  onRemove?: (id: string) => void;
  calculateFinalPrice?: (basePrice: string, premium: string) => string;
  weight?: string;
  price?: string;
  discount?: string;
  seller?: string;
  isVerified?: boolean;
  isPremium?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  id,
  name,
  basePrice,
  premium,
  isEditing,
  onStartEditing,
  onStopEditing,
  onUpdatePremium,
  onRemove,
  calculateFinalPrice,
  weight,
  price,
  discount,
  type = "gold", // Default to "gold" if type is not provided
  seller,
  isVerified,
  isPremium = false,
}) => {
  // Determine if this is a seller dashboard card or a marketplace card
  const isSellerCard = !!id && !!onStartEditing && !!onStopEditing && !!onUpdatePremium && !!onRemove;

  // Get the appropriate icon based on the type
  const getIcon = () => {
    if (type === "gold") {
      return <IndianRupee size={16} color="#F3B62B" />;
    } else if (type === "silver") {
      return <IndianRupee size={16} color="#A9A9A9" />;
    }
    return <IndianRupee size={16} color="#F3B62B" />;
  };

  // Get the appropriate image based on the type
  const getImage = () => {
    if (type === "gold") {
      return images.goldCoins;
    }
    else if (type === "silver") {
      return images.silverBar;
    }
    // return images.silverCoin;
  };

  // Format price with commas
  const formatPrice = (price: string) => {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Safely capitalize the first letter of type
  const capitalizedType = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Gold";

  // Render seller dashboard card
  if (isSellerCard && id) {
    return (
      <View style={[styles.container, isPremium && styles.premiumContainer]}>
        <LinearGradient
          colors={isPremium
            ? ["#FFF8E1", "#FFE0B2"]
            : (type === "gold" ? ["#FFF8E1", "#FFF3CD"] : ["#F5F5F5", "#E0E0E0"])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Image source={getImage()} style={styles.image} contentFit="cover" />
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{name}</Text>
                {isPremium && (
                  <View style={styles.premiumBadge}>
                    <Award size={12} color="#F3B62B" />
                    <Text style={styles.premiumBadgeText}>Premium</Text>
                  </View>
                )}
              </View>
              <Text style={styles.type}>{capitalizedType}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(id)}
            >
              <Trash2 size={16} color="#E53935" />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Base Price:</Text>
            <Text style={styles.price}>₹{formatPrice(basePrice || "0")}</Text>
          </View>

          <View style={styles.premiumInputContainer}>
            <Text style={styles.premiumLabel}>Premium:</Text>
            {isEditing ? (
              <TextInput
                style={styles.premiumInput}
                value={premium}
                onChangeText={(text) => onUpdatePremium(id, text)}
                keyboardType="numeric"
                autoFocus
              />
            ) : (<Text style={styles.premium}>₹{premium}</Text>)
            }
          </View>

          <View style={styles.finalPriceContainer}>
            <Text style={styles.finalPriceLabel}>Final Price:</Text>
            <Text style={styles.finalPrice}>
              ₹{formatPrice(calculateFinalPrice ? calculateFinalPrice(basePrice || "0", premium || "0") : "0")}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={isEditing ? onStopEditing : () => onStartEditing(id)}
          >
            {isEditing ? (
              <>
                <Save size={16} color="#4CAF50" />
                <Text style={[styles.actionButtonText, { color: "#4CAF50" }]}>Save</Text>
              </>
            ) : (
              <>
                <Edit size={16} color="#2196F3" />
                <Text style={styles.actionButtonText}>Edit Premium</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // Render marketplace card
  return (
    <View style={[styles.marketplaceContainer, isPremium && styles.premiumMarketplaceContainer]}>
      <LinearGradient
        colors={isPremium
          ? ["#FFF8E1", "#FFE0B2"]
          : ["#FFFFFF", "#F9F9F9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.marketplaceGradient}
      >
        {isPremium && (
          <View style={styles.premiumTag}>
            <Award size={12} color="#FFFFFF" />
            <Text style={styles.premiumTagText}>Premium</Text>
          </View>
        )}

        <Image
          source={type === "gold" ? images.goldCoin : type === "silver" ? images.silverCoin : undefined}

          style={styles.marketplaceImage}
          contentFit="cover"
        />

        <View style={styles.marketplaceContent}>
          <Text style={styles.marketplaceTitle}>{name}</Text>

          <View style={styles.marketplaceDetail}>
            <Text style={styles.marketplaceDetailLabel}>Weight:</Text>
            <Text style={styles.marketplaceDetailValue}>{weight}</Text>
          </View>

          <View style={styles.marketplaceDetail}>
            <Text style={styles.marketplaceDetailLabel}>Price:</Text>
            <Text style={styles.marketplaceDetailValue}>{price}</Text>
          </View>

          {discount && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountLabel}>Discount:</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountValue}>{discount}</Text>
              </View>
            </View>
          )}

          <View style={styles.sellerContainer}>
            <Text style={styles.sellerLabel}>Seller:</Text>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{seller}</Text>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>

          {/* <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity> */}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  // Seller Dashboard Card Styles
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  premiumContainer: {
    borderWidth: 1,
    borderColor: "#F5D76E",
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginRight: 8,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
  type: {
    fontSize: 12,
    color: "#666666",
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(229, 57, 53, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
  },
  price: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  premiumInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  premiumLabel: {
    fontSize: 14,
    color: "#666666",
  },
  premium: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  premiumInput: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: 100,
    textAlign: "right",
    fontSize: 14,
  },
  finalPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  finalPriceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2196F3",
    marginLeft: 4,
  },

  // Marketplace Card Styles
  marketplaceContainer: {
    width: 220,
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    // marginBottom: 100,
  },
  premiumMarketplaceContainer: {
    borderColor: "#F5D76E",
  },
  marketplaceGradient: {
    padding: 0,
    height: "100%",
  },
  premiumTag: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3B62B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  premiumTagText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  marketplaceImage: {
    width: "100%",
    height: 120,
    borderRadius: 16,
  },
  marketplaceContent: {
    padding: 12,
  },
  marketplaceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  marketplaceDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  marketplaceDetailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  marketplaceDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  discountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  discountLabel: {
    fontSize: 14,
    color: "#666666",
  },
  discountBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  discountValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  sellerContainer: {
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
  },
  sellerLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  verifiedBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#1976D2",
  },
  buyButton: {
    backgroundColor: "#F3B62B",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});