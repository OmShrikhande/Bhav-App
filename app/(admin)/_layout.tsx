import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore, ADMIN_USERNAME } from "@/store/auth-store";
import { useFirebaseAuthStore } from "@/store/firebase-auth-store";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Menu, Shield } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminLayout() {
  const { user: legacyUser } = useAuthStore();
  const { firebaseAuth } = useAuth();
  const firebaseUser = firebaseAuth.user;
  const router = useRouter();
  
  // Move the redirect logic to useEffect to avoid setState during render
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Clear any navigation flags
        await AsyncStorage.removeItem('navigation-in-progress');
        
        // Log both user objects for debugging
        console.log("Admin layout - Legacy user:", legacyUser ? JSON.stringify({
          id: legacyUser.id,
          email: legacyUser.email,
          role: legacyUser.role,
          username: legacyUser.username
        }) : "No legacy user");
        
        console.log("Admin layout - Firebase user:", firebaseUser ? JSON.stringify({
          id: firebaseUser.id,
          email: firebaseUser.email,
          role: firebaseUser.role,
          username: firebaseUser.username
        }) : "No Firebase user");
        
        // Try to get admin user from AsyncStorage as a fallback
        let adminUserFromStorage = null;
        try {
          const storedUser = await AsyncStorage.getItem('admin-user');
          if (storedUser) {
            adminUserFromStorage = JSON.parse(storedUser);
            console.log("Admin layout - User from AsyncStorage:", JSON.stringify({
              id: adminUserFromStorage.id,
              email: adminUserFromStorage.email,
              role: adminUserFromStorage.role,
              username: adminUserFromStorage.username
            }));
          }
        } catch (storageError) {
          console.error("Error reading admin user from AsyncStorage:", storageError);
        }
        
        // Use Firebase user as the primary source of truth, with fallbacks
        const currentUser = firebaseUser || legacyUser || adminUserFromStorage;
        
        // Redirect non-admin users
        if (!currentUser) {
          console.log("No user found, redirecting to login");
          router.replace("/auth/login");
        } else if (currentUser.role !== "admin" && currentUser.username !== ADMIN_USERNAME) {
          console.log("User is not admin, redirecting to login");
          router.replace("/auth/login");
        } else {
          console.log("Admin access confirmed for:", currentUser.email);
        }
      } catch (error) {
        console.error("Error in admin layout:", error);
        router.replace("/auth/login");
      }
    };
    
    checkAdminAccess();
  }, [legacyUser, firebaseUser, router]);

  const openDrawer = () => {
    router.push("/drawer");
  };

  // We'll use a state to track the admin user from all sources
  const [adminUser, setAdminUser] = React.useState(null);
  
  // Effect to check for admin user in AsyncStorage
  React.useEffect(() => {
    const getAdminUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('admin-user');
        if (storedUser) {
          setAdminUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error reading admin user from storage:", error);
      }
    };
    
    if (!firebaseUser && !legacyUser) {
      getAdminUserFromStorage();
    }
  }, [firebaseUser, legacyUser]);
  
  // Use Firebase user as the primary source of truth, with fallbacks
  const currentUser = firebaseUser || legacyUser || adminUser;

  // If user is not admin, render a loading state instead of redirecting during render
  if (!currentUser || (currentUser.role !== "admin" && currentUser.username !== ADMIN_USERNAME)) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#F3B62B" />
          <Text style={styles.loadingText}>Checking admin permissions...</Text>
        </View>
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
  loadingContent: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
    textAlign: 'center',
  },
});