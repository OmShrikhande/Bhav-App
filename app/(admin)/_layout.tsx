import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore, ADMIN_USERNAME } from "@/store/auth-store";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Menu } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminLayout() {
  const { user, users } = useAuthStore();
  const router = useRouter();

  // Move the redirect logic to useEffect to avoid setState during render
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Clear any navigation flags
        await AsyncStorage.removeItem('navigation-in-progress');
        
        // Log the current user for debugging
        console.log("Admin layout - Current user:", user ? JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username
        }) : "No user");
        
        // Redirect non-admin users
        if (!user) {
          console.log("No user found, redirecting to login");
          router.replace("/auth/login");
        } else if (user.role !== "admin" && user.username !== ADMIN_USERNAME) {
          console.log("User is not admin, redirecting to login");
          router.replace("/auth/login");
        } else {
          console.log("Admin access confirmed for:", user.email);
        }
      } catch (error) {
        console.error("Error in admin layout:", error);
        router.replace("/auth/login");
      }
    };
    
    checkAdminAccess();
  }, [user, router]);

  const openDrawer = () => {
    router.push("/drawer");
  };

  // If user is not admin, render a loading state instead of redirecting during render
  if (user?.role !== "admin" && user?.username !== ADMIN_USERNAME) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen
          name="dashboard"
          options={{
            headerTitle: "Admin Dashboard",
            headerShown: false,
            headerTintColor: "#1976D2",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        <Stack.Screen
          name="users"
          options={{
            headerTitle: "User Management",
            headerShown: false,
            headerTintColor: "#1976D2",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        <Stack.Screen
          name="analytics"
          options={{
            headerTitle: "Analytics",
            headerShown: false,
            headerTintColor: "#1976D2",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});