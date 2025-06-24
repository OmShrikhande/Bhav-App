import React from "react";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";


export default function AppLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="live-rates"
          options={{
            headerTitle: "Live Rates",
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        {/* <Stack.Screen
          name="transaction"
          options={{
            headerTitle: "Transaction",
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        /> */}
        {/* <Stack.Screen
          name="connections"
          options={{
            headerTitle: "Connections",
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        /> */}
        <Stack.Screen
          name="contact"
          options={{
            headerTitle: "Contact Us",
            headerShown: false,
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        <Stack.Screen
          name="kyc"
          options={{
            headerTitle: "KYC",
            headerShown: false,
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerTitle: "My Profile",
            headerShown: false,
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}

        />
        <Stack.Screen
          name="share"
          options={{
            headerTitle: "Share App",
            headerTintColor: "#333333",
            headerShown: false,
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        <Stack.Screen
          name="seller-dashboard"
          options={{
            headerTitle: "Seller Dashboard",
            headerShown: false,
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        <Stack.Screen
          name="customers"
          options={{
            headerTitle: "My Customers",
            headerShown: false,
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        <Stack.Screen
          name="inventory"
          options={{
            headerTitle: "Manage Inventory",
            headerShown: false,
            headerBackTitle: "Back",
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        <Stack.Screen
          name="seller-profile/[id]"
          options={{
            headerTitle: "Seller Profile",
            headerShown: false,
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
        <Stack.Screen
          name="seller-data"
          options={{
            headerTitle: "Seller Profile",
            headerShown: false,
            headerTintColor: "#333333",
            headerStyle: {
              backgroundColor: "#ffffff",
            },
          }}
        />
      </Stack>
    </>
  );
}