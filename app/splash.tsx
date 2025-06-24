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
        // Check Firebase auth state first
        const firebaseState = useFirebaseAuthStore.getState();
        
        if (firebaseState.isAuthenticated && firebaseState.user) {
          setAuthState({
            isAuthenticated: true,
            user: firebaseState.user
          });
          return;
        }
        
        // If not authenticated in Firebase, check legacy auth
        const legacyState = useAuthStore.getState();
        
        if (legacyState.isAuthenticated && legacyState.user) {
          setAuthState({
            isAuthenticated: true,
            user: legacyState.user
          });
          return;
        }
        
        // If not authenticated in either, set as not authenticated
        setAuthState({
          isAuthenticated: false,
          user: null
        });
      } catch (error) {
        console.error('Error checking auth state:', error);
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
          
          // Force a delay before navigation to ensure all components are ready
          setTimeout(() => {
            // Use push instead of replace for more reliable navigation
            router.push("/(app)/(tabs)/dashboard");
          }, 300);
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
          <Text style={styles.logoText}>Bhav App</Text>
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