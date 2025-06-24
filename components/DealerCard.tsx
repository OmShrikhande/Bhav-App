import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Define the dealer type based on User
interface Dealer {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  brandName?: string; // Added brand name field
  sellerVerified?: boolean;
}

interface DealerCardProps {
  dealer: Dealer;
  onContact: () => void;
  isContacted: boolean;
}

export const DealerCard: React.FC<DealerCardProps> = ({
  dealer,
  onContact,
  isContacted,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{dealer.fullName || dealer.name}</Text>
        {dealer.sellerVerified && <Text style={styles.verifiedBadge}>Verified</Text>}
      </View>
      <TouchableOpacity
        style={[
          styles.contactButtonContainer,
          isContacted && styles.contactedButtonContainer
        ]}
        onPress={onContact}
        disabled={isContacted}
      >
        <LinearGradient
          colors={
            isContacted
              ? ["#43A047", "#66BB6A"]
              : ["#F3B62B", "#F5D76E"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.contactButton}
        >
          {isContacted ? (
            <View style={styles.contactedContent}>
              <CheckCircle size={16} color="#ffffff" style={styles.contactedIcon} />
              <Text style={styles.contactButtonText}>Seller Selected</Text>
            </View>
          ) : (
            <Text style={styles.contactButtonText}>Select Seller</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginRight: 8,
  },
  verifiedBadge: {
    fontSize: 12,
    color: "#43A047",
  },
  contactButtonContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  contactedButtonContainer: {
    opacity: 0.9,
  },
  contactButton: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  contactButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  contactedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactedIcon: {
    marginRight: 8,
  },
});