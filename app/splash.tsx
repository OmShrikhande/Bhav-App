import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, Easing, Platform, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuthStore, ADMIN_USERNAME } from "@/store/auth-store";
import { useFirebaseAuthStore } from "@/store/firebase-auth-store";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; user: any } | null>(null);

  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // Get auth state in useEffect to avoid render-time state access
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // First, check if we're in a logout state or have a stale logout flag
        let isLoggingOut = false;
        let forceLogout = false;
        
        try {
          const logoutState = await AsyncStorage.getItem('logout-in-progress');
          isLoggingOut = logoutState === 'true';
          console.log("Splash: Logout in progress:", isLoggingOut);
          
          // Check for inconsistent auth state (one store has user, other doesn't)
          const firebaseState = useFirebaseAuthStore.getState();
          const legacyState = useAuthStore.getState();
          
          if ((firebaseState.isAuthenticated && !legacyState.isAuthenticated) || 
              (!firebaseState.isAuthenticated && legacyState.isAuthenticated)) {
            console.log("Splash: Inconsistent auth state detected, forcing logout");
            forceLogout = true;
          }
          
          // If we find a stale logout flag or inconsistent state, clear everything
          if (isLoggingOut || forceLogout) {
            console.log("Splash: Found stale logout flag or inconsistent state, clearing auth state");
            
            // Clear the logout flag
            await AsyncStorage.removeItem('logout-in-progress');
            
            // Clear all auth storage
            const keys = [
              'firebase-auth-storage',
              'auth-storage',
              'zustand-auth-storage',
              'auth-state'
            ];
            
            for (const key of keys) {
              await AsyncStorage.removeItem(key);
            }
            
            // Try to clear all storage as a last resort
            try {
              const allKeys = await AsyncStorage.getAllKeys();
              const authKeys = allKeys.filter(key => 
                key.includes('auth') || 
                key.includes('firebase') || 
                key.includes('user') ||
                key.includes('zustand')
              );
              
              if (authKeys.length > 0) {
                console.log("Splash: Clearing all auth-related keys:", authKeys);
                await AsyncStorage.multiRemove(authKeys);
              }
            } catch (clearError) {
              console.error("Splash: Error clearing all auth keys:", clearError);
            }
            
            // Force reset of auth stores
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
            
            // Set as not authenticated
            setAuthState({
              isAuthenticated: false,
              user: null
            });
            return;
          }
        } catch (error) {
          console.error("Splash: Error checking logout state:", error);
        }
        
        // Check Firebase auth state first
        const firebaseState = useFirebaseAuthStore.getState();
        console.log("Splash: Firebase auth state:", 
          firebaseState.isAuthenticated ? "Authenticated" : "Not authenticated",
          "User:", firebaseState.user?.id);
        
        if (firebaseState.isAuthenticated && firebaseState.user) {
          setAuthState({
            isAuthenticated: true,
            user: firebaseState.user
          });
          return;
        }
        
        // If not authenticated in Firebase, check legacy auth
        const legacyState = useAuthStore.getState();
        console.log("Splash: Legacy auth state:", 
          legacyState.isAuthenticated ? "Authenticated" : "Not authenticated",
          "User:", legacyState.user?.id);
        
        if (legacyState.isAuthenticated && legacyState.user) {
          setAuthState({
            isAuthenticated: true,
            user: legacyState.user
          });
          return;
        }
        
        // If not authenticated in either, set as not authenticated
        console.log("Splash: No authenticated user found");
        setAuthState({
          isAuthenticated: false,
          user: null
        });
      } catch (error) {
        console.error('Splash: Error checking auth state:', error);
        // Default to not authenticated if there's an error
        setAuthState({
          isAuthenticated: false,
          user: null
        });
      }
    };
    
    checkAuthState();
    
    // Set up subscriptions to both stores
    const unsubscribeFirebase = useFirebaseAuthStore.subscribe((state) => {
      if (state.isAuthenticated && state.user) {
        setAuthState({
          isAuthenticated: true,
          user: state.user
        });
      }
    });
    
    const unsubscribeLegacy = useAuthStore.subscribe((state) => {
      if (state.isAuthenticated && state.user && !useFirebaseAuthStore.getState().isAuthenticated) {
        setAuthState({
          isAuthenticated: true,
          user: state.user
        });
      }
    });
    
    return () => {
      unsubscribeFirebase();
      unsubscribeLegacy();
    };
  }, []);

  useEffect(() => {
    if (authState === null) return; // Wait for auth state to be loaded

    // Animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]),
      Animated.delay(1000),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start(() => {
      try {
        console.log("Navigation state:", authState.isAuthenticated ? "Authenticated" : "Not authenticated");
        
        // Navigate based on authentication status
        if (authState.isAuthenticated) {
          console.log("User is authenticated, navigating to dashboard");
          
          // Use a more robust approach to prevent navigation loops
          const navigateBasedOnRole = async () => {
            try {
              // Check if navigation is already in progress
              const inProgress = await AsyncStorage.getItem('navigation-in-progress');
              if (inProgress === 'true') {
                console.log("Navigation already in progress, skipping");
                return;
              }
              
              // Set navigation in progress flag
              await AsyncStorage.setItem('navigation-in-progress', 'true');
              
              // Log the current user for debugging
              console.log("Splash - Current user:", authState.user ? JSON.stringify({
                id: authState.user.id,
                email: authState.user.email,
                role: authState.user.role,
                username: authState.user.username
              }) : "No user");
              
              // Navigate based on user role
              if (authState.user?.role === 'seller') {
                console.log("Splash: User is a seller, navigating to seller dashboard");
                router.replace("/(app)/(tabs)/seller-dashboard");
              } else if (authState.user?.role === 'admin' || authState.user?.username === 'vipin_bullion') {
                console.log("Splash: User is an admin, navigating to admin dashboard");
                // For admin users, use a different approach to avoid loops
                // First store the admin user in AsyncStorage to ensure it's available in the admin layout
                await AsyncStorage.setItem('admin-user', JSON.stringify(authState.user));
                // Use replace instead of push to avoid back navigation issues
                router.replace("/(admin)/dashboard");
              } else {
                console.log("Splash: User is a customer, navigating to customer dashboard");
                router.replace("/(app)/(tabs)/dashboard");
              }
              
              // Clear the navigation flag after a delay
              setTimeout(async () => {
                await AsyncStorage.removeItem('navigation-in-progress');
              }, 2000);
            } catch (error) {
              console.error("Navigation error:", error);
              // Clear the flag in case of error
              await AsyncStorage.removeItem('navigation-in-progress');
            }
          };
          
          // Execute the navigation function
          navigateBasedOnRole();
        } else {
          console.log("User is not authenticated, navigating to login");
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback to login if there's an error
        router.replace("/auth/login");
      }
    });
  }, [authState, router, opacityAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={["#ffffff", "#fff9e6", "#fff5d6"]}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Use Text instead of Image to avoid build errors */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>BHAV App</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#F3B62B",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
}); 