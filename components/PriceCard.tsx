import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { TrendingUp, TrendingDown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { images } from "@/constants/images";

interface PriceCardProps {
  title?: string;
  metal?: string; // Added for backward compatibility
  subtitle?: string;
  price: string;
  change: string;
  isUp?: boolean;
  isPositive?: boolean; // Added for backward compatibility
  loading?: boolean;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  title,
  metal,
  subtitle,
  price,
  change,
  isUp,
  isPositive,
  loading = false,
}) => {
  // Use metal prop if title is not provided (for backward compatibility)
  const displayTitle = title || metal || "Gold";
  const displaySubtitle = subtitle || "24K";
  const isValuePositive = isUp !== undefined ? isUp : isPositive;

  // Select an appropriate image based on the title
  const getImage = () => {
    const lowerTitle = displayTitle.toLowerCase();
    if (lowerTitle.includes("gold")) {
      return images.goldCoins;
    } else if (lowerTitle.includes("silver")) {
      return images.silverBar;
    }
    // return images.goldBar;
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["#FFF8E1", "#FFF3CD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.title}>{displayTitle}</Text>
            <Text style={styles.subtitle}>{displaySubtitle}</Text>
          </View>

          <Text style={styles.price}>{price}</Text>

          {loading ? (
            <ActivityIndicator size="small" color="#F3B62B" style={styles.loader} />
          ) : (
            <>

              <View style={styles.changeContainer}>
                {isValuePositive ? (
                  <TrendingUp size={16} color="#4CAF50" />
                ) : (
                  <TrendingDown size={16} color="#F44336" />
                )}
                <Text
                  style={[
                    styles.changeText,
                    { color: isValuePositive ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {change}
                </Text>
              </View>


              <Image source={getImage()} style={styles.image} contentFit="contain" />
            </>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 12,
  },
  cardGradient: {
    padding: 16,
    paddingVertical: 35,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    alignSelf: "center",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "center",
  },
  changeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  loader: {
    // marginTop: 16,
  },
});