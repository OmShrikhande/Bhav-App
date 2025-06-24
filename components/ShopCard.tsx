import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle, XCircle, Phone, Mail, Navigation, Clock, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    ownerName: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
    verified: boolean;
    type: string;
    distance: string;
    rating: number;
  };
  isSelected: boolean;
  expanded?: boolean;
  onSelect: (shop: any) => void;
  onCall: (phone: string) => void;
  onEmail: (email: string) => void;
  onDirections: (shop: any) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  isSelected,
  expanded = false,
  onSelect,
  onCall,
  onEmail,
  onDirections,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        expanded && styles.containerExpanded,
      ]}
      onPress={() => onSelect(shop)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={shop.verified ? ["#FFF8E1", "#FFFFFF"] : ["#FFF5F5", "#FFFFFF"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.name}>{shop.name}</Text>
          <View style={styles.verification}>
            {shop.verified ? (
              <>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={[styles.verificationText, { color: "#4CAF50" }]}>Verified</Text>
              </>
            ) : (
              <>
                <XCircle size={16} color="#F44336" />
                <Text style={[styles.verificationText, { color: "#F44336" }]}>Unverified</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.type}>{shop.type}</Text>
          <View style={styles.distanceContainer}>
            <Text style={styles.distance}>{shop.distance}</Text>
          </View>
        </View>

        <View style={styles.ownerRow}>
          <User size={14} color="#666" />
          <Text style={styles.ownerName}>{shop.ownerName}</Text>
        </View>

        <Text style={styles.address} numberOfLines={expanded ? 0 : 2}>
          {shop.address}
        </Text>

        {expanded && (
          <View style={styles.expandedInfo}>
            <View style={styles.hoursContainer}>
              <Clock size={14} color="#666" />
              <Text style={styles.hours}>{shop.hours}</Text>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating:</Text>
              <Text style={styles.rating}>{shop.rating.toFixed(1)}</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <View
                    key={star}
                    style={[
                      styles.ratingStar,
                      star <= Math.floor(shop.rating) && styles.ratingStarFilled,
                      star === Math.ceil(shop.rating) && shop.rating % 1 !== 0 && styles.ratingStarHalf,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onCall(shop.phone)}
          >
            <Phone size={16} color="#F3B62B" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEmail(shop.email)}
          >
            <Mail size={16} color="#F3B62B" />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDirections(shop)}
          >
            <Navigation size={16} color="#F3B62B" />
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerSelected: {
    borderWidth: 2,
    borderColor: "#F3B62B",
  },
  containerExpanded: {
    width: "100%",
    marginRight: 0,
  },
  gradient: {
    padding: 16,
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  verification: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  verificationText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  type: {
    fontSize: 14,
    color: "#666",
  },
  distanceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  distance: {
    fontSize: 12,
    color: "#333",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ownerName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginLeft: 6,
  },
  address: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  expandedInfo: {
    marginBottom: 12,
  },
  hoursContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  hours: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  ratingStars: {
    flexDirection: "row",
  },
  ratingStar: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
    marginRight: 2,
  },
  ratingStarFilled: {
    backgroundColor: "#F3B62B",
  },
  ratingStarHalf: {
    backgroundColor: "#F5D76E",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  actionText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
  },
});