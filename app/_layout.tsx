import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const unstable_settings = {
  initialRouteName: "splash",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    // Use system fonts instead of custom fonts to avoid build errors
  });
  
  // Add state to handle initialization
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Add a small delay to avoid the useInsertionEffect warning
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  // Log when the layout is ready to render
  useEffect(() => {
    if (isReady) {
      console.log("RootLayout is ready to render");
    }
  }, [isReady]);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  // Add state to handle initialization
  const [isNavReady, setIsNavReady] = useState(false);
  
  // Use effect to delay rendering the Stack
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isNavReady) {
    return <View style={{ flex: 1 }} />;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" options={{ animation: "fade" }} />
      <Stack.Screen name="auth" options={{ animation: "fade" }} />
      <Stack.Screen name="(app)" options={{ animation: "fade" }} />
      <Stack.Screen name="(admin)" options={{ animation: "fade" }} />
      <Stack.Screen name="drawer" options={{ animation: "slide_from_left" }} />
      <Stack.Screen name="modal" options={{ animation: "fade_from_bottom" }} />
    </Stack>
  );
}