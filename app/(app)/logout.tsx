import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@/config/firebaseConfig';

export default function LogoutScreen() {
  const { logout, firebaseAuth } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Add a small delay to show the loading indicator
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log("Starting logout process...");
        
        // Use the enhanced logout function which handles everything
        console.log("Using enhanced logout function...");
        await logout();
        
        console.log("Logout complete, navigating to login screen...");
        
        // Force clear any remaining auth state
        try {
          console.log("Force clearing any remaining auth state");
          
          // Force reset of auth stores directly
          const { useFirebaseAuthStore } = await import('@/store/firebase-auth-store');
          const { useAuthStore } = await import('@/store/auth-store');
          
          useFirebaseAuthStore.setState({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            token: null,
            isPremiumUser: false,
            contactedDealers: [],
            contactedSellerDetails: []
          });
        } catch (resetError) {
          console.error("Error resetting auth stores:", resetError);
        }
        
        // Navigate to login screen with a delay to ensure all logout processes complete
        setTimeout(async () => {
          // Clear the logout in progress flag
          try {
            await AsyncStorage.removeItem('logout-in-progress');
            console.log("Cleared logout in progress flag");
          } catch (error) {
            console.error("Error clearing logout flag:", error);
          }
          
          // Force navigation to login and clear navigation history
          router.replace("/auth/login");
        }, 1000);
      } catch (err: any) {
        console.error("Logout error:", err);
        setError(err.message || "Failed to log out. Please try again.");
        // Still try to force clear auth state even in error case
        try {
          console.log("Force clearing any remaining auth state (error case)");
          
          // Force reset of auth stores directly
          const { useFirebaseAuthStore } = await import('@/store/firebase-auth-store');
          const { useAuthStore } = await import('@/store/auth-store');
          
          useFirebaseAuthStore.setState({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            token: null,
            isPremiumUser: false,
            contactedDealers: [],
            contactedSellerDetails: []
          });
        } catch (resetError) {
          console.error("Error resetting auth stores (error case):", resetError);
        }
        
        // Still redirect to login after a delay even if there's an error
        setTimeout(async () => {
          // Clear the logout in progress flag
          try {
            await AsyncStorage.removeItem('logout-in-progress');
            console.log("Cleared logout in progress flag (error case)");
          } catch (flagError) {
            console.error("Error clearing logout flag:", flagError);
          }
          
          // Force navigation to login and clear navigation history
          router.replace("/auth/login");
        }, 2000);
      }
    };

    performLogout();
  }, []);

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