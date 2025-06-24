import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogoutScreen() {
  const { logout, firebaseAuth } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Add a small delay to show the loading indicator
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Logout from Firebase first
        const firebaseResult = await firebaseAuth.logOut();
        if (!firebaseResult.success) {
          console.error("Firebase logout error:", firebaseResult.error);
        }
        
        // Then logout from the legacy system
        logout();
        
        // Clear any persisted auth data
        try {
          await AsyncStorage.removeItem('firebase-auth-storage');
        } catch (storageError) {
          console.error('Error clearing auth storage:', storageError);
        }
        
        // Navigate to login screen
        router.replace("/auth/login");
      } catch (err: any) {
        console.error("Logout error:", err);
        setError(err.message || "Failed to log out. Please try again.");
        // Still redirect to login after a delay even if there's an error
        setTimeout(() => router.replace("/auth/login"), 2000);
      }
    };

    performLogout();
  }, [logout, router, firebaseAuth]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F3B62B" />
      <Text style={styles.text}>{error || "Logging out..."}</Text>
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