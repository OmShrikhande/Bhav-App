import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function LiveRatesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the rates tab
    router.replace("/(app)/(tabs)/rates");
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F3B62B" />
      <Text style={styles.text}>Redirecting to Live Rates...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
});