import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function ContactRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the contact tab
    router.replace("/(app)/contact");
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F3B62B" />
      <Text style={styles.text}>Redirecting to Contact Us...</Text>
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