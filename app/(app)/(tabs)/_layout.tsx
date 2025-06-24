import React from "react";
import { Tabs } from "expo-router";
import { Platform, View, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Home, TrendingUp, Calculator, Phone, CreditCard, Menu, Users, Newspaper, User, Bell, ShoppingBag } from "lucide-react-native";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";

export default function TabsLayout() {
  const { user, firebaseAuth } = useAuth();
  const router = useRouter();
  
  // Get user from either auth store
  const currentUser = firebaseAuth.user || user;
  
  // Add debugging and authentication check
  React.useEffect(() => {
    console.log("TabsLayout mounted");
    console.log("Current user in tabs:", currentUser);
    console.log("User role:", currentUser?.role);
    console.log("Firebase user in tabs:", firebaseAuth.user);
    console.log("Legacy user in tabs:", user);
    
    // If no user is found, redirect to login
    if (!currentUser) {
      console.log("No user found in tabs, redirecting to login");
      // Use a timeout to avoid navigation during render
      setTimeout(() => {
        router.replace("/auth/login");
      }, 100);
    }
    
    // If user is a seller, redirect to seller dashboard
    if (currentUser?.role === "seller") {
      console.log("Seller user detected, redirecting to seller dashboard");
      // Use a timeout to avoid navigation during render
      setTimeout(() => {
        if (router.pathname === "/(app)/(tabs)/dashboard") {
          router.replace("/(app)/(tabs)/seller-dashboard");
        }
      }, 100);
    }
  }, [currentUser, firebaseAuth.user, user, router.pathname]);
  
  const isSeller = currentUser?.role === "seller";
  const isCustomer = currentUser?.role === "customer";
  const isAdmin = currentUser?.role === "admin";

  const openDrawer = () => {
    router.push("/drawer");
  };

  return (

    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#F3B62B",
        tabBarInactiveTintColor: "#9e9e9e",
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          // height: 60,
          backgroundColor: Platform.OS === "ios" ? "transparent" : "#ffffff",
          position: "absolute",
        },
        tabBarBackground: () => (
          Platform.OS === "ios" ? (
            <BlurView
              tint="light"
              intensity={80}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#ffffff" }]} />
          )
        ),
        tabBarLabelStyle: {
          fontWeight: "500",
          fontSize: 12,
        },
        headerShown: false,
        headerStyle: {
          backgroundColor: "#ffffff",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        },
        headerTintColor: "#333333",
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={openDrawer}
            style={{
              padding: 12,
              marginLeft: 8,
            }}
          >
            <Menu size={24} color="#333333" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          // headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <Home size={22} color={color} />
            </View>
          ),
          href: isSeller ? null : "/(app)/(tabs)/dashboard",
        }}
      />
      
      <Tabs.Screen
        name="seller-dashboard"
        options={{
          title: "Seller Dashboard",
          // headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <ShoppingBag size={22} color={color} />
            </View>
          ),
          href: isSeller ? "/(app)/(tabs)/seller-dashboard" : null,
        }}
      />



      <Tabs.Screen
        name="rates"
        options={{
          title: "Live Rates",
          // headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <TrendingUp size={22} color={color} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          // headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <ShoppingBag size={22} color={color} />
            </View>
          ),
          href: isSeller ? "/(app)/(tabs)/inventory" : null,
        }}
      />
      
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          // headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <Users size={22} color={color} />
            </View>
          ),
          href: isSeller ? "/(app)/(tabs)/customers" : null,
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          title: "Notifications",
          // headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <Bell size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* {(isCustomer && !isSeller && !isAdmin) && (
        <Tabs.Screen
          name="dealers"
          options={{
            title: "Dealers",
            // headerShown: true,
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIconContainer : null}>
                <Users size={22} color={color} />
              </View>
            ),
          }}
        />
      )} */}

      {/* <Tabs.Screen
        name="transaction"
        options={{
          title: "Transaction",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <CreditCard size={22} color={color} />
            </View>
          ),
        }}
      /> */}



      {/* <Tabs.Screen
        name="calculator"
        options={{
          title: "Calculator",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <Calculator size={22} color={color} />
            </View>
          ),
        }}
      /> */}

      {/* <Tabs.Screen
        name="contact"
        options={{
          title: "Contact",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <Phone size={22} color={color} />
            </View>
          ),
        }}
      /> */}


    </Tabs>

  );
}

const styles = StyleSheet.create({

  activeIconContainer: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderRadius: 8,
    padding: 6,
  },
});