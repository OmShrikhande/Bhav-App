import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Clock } from "lucide-react-native";
import { images } from "@/constants/images";

interface MarketUpdateProps {
  title: string;
  time: string;
  source?: string; // Made source optional
  index?: number;
}

export const MarketUpdate: React.FC<MarketUpdateProps> = ({
  title,
  time,
  source = "VP Bullion", // Default value for source
  index = 0,
}) => {
  // Rotate through different images based on index
  const getImage = () => {
    const imageKeys = [
      images.marketUpdate1,
      images.marketUpdate2,
      images.marketUpdate3,
    ];
    return imageKeys[index % imageKeys.length];
  };

  return (
    <TouchableOpacity style={styles.container}>
      <Image source={getImage()} style={styles.image} contentFit="cover" />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#999999" />
            <Text style={styles.time}>{time}</Text>
          </View>
          <Text style={styles.source}>{source}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    width: 280,
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#999999",
    marginLeft: 4,
  },
  source: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
  },
});