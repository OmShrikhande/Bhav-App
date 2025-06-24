import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ArrowLeft, Check, Crown, Calendar, Infinity, Store } from "lucide-react-native";
import { useAuthStore } from "@/store/auth-store";

// Define the type for subscription plan
type SubscriptionPlan = {
  id: string;
  title: string;
  price: string;
  period: string;
  features: string[];
  color: readonly [string, string]; // Fixed: Define as readonly tuple of strings
  icon: React.ComponentType<any>;
  recommended?: boolean;
};

// Subscription plans
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "monthly",
    title: "Monthly",
    price: "₹99",
    period: "per month",
    features: [
      "Basic seller dashboard",
      "List up to 10 products",
      "Standard customer support",
      "Basic analytics"
    ],
    color: ["#4CAF50", "#81C784"] as const, // Fixed: Use 'as const' to make it a readonly tuple
    icon: Calendar
  },
  {
    id: "yearly",
    title: "Yearly",
    price: "₹999",
    period: "per year",
    features: [
      "Advanced seller dashboard",
      "List unlimited products",
      "Priority customer support",
      "Detailed analytics",
      "Featured listings"
    ],
    color: ["#F3B62B", "#F5D76E"] as const, // Fixed: Use 'as const' to make it a readonly tuple
    icon: Crown,
    recommended: true
  },
  {
    id: "unlimited",
    title: "Unlimited",
    price: "₹4999",
    period: "one-time payment",
    features: [
      "Premium seller dashboard",
      "List unlimited products",
      "24/7 dedicated support",
      "Advanced analytics & reports",
      "Featured listings",
      "Lifetime access",
      "Early access to new features"
    ],
    color: ["#1976D2", "#64B5F6"] as const, // Fixed: Use 'as const' to make it a readonly tuple
    icon: Infinity
  }
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = params;
  const { updateUser, users, addNotification, getUserById } = useAuthStore();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brandName, setBrandName] = useState(""); // Added brand name state
  const [showBrandNameInput, setShowBrandNameInput] = useState(false);

  // Animation values for plan cards
  const scaleAnims = SUBSCRIPTION_PLANS.map(() => React.useRef(new Animated.Value(1)).current);

  // Check if user already has a brand name
  useEffect(() => {
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        if (user.brandName) {
          setBrandName(user.brandName);
          setShowBrandNameInput(false);
        } else {
          setShowBrandNameInput(true);
        }
      }
    }
  }, [userId, users]);

  const handlePlanSelect = (planId: string, index: number) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    setSelectedPlan(planId);

    // Animate the selected plan card
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    // If brand name input is shown and empty, show error
    if (showBrandNameInput && !brandName.trim()) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      alert("Please enter your brand name to continue");
      return;
    }

    setIsLoading(true);

    try {
      // Find the selected plan details
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);

      if (plan) {
        // If user is upgrading and needs to set a brand name, update it first
        if (showBrandNameInput && brandName.trim()) {
          await updateUser({
            id: userId as string,
            brandName: brandName.trim()
          });
        }

        // Get user details for notification
        const user = getUserById(userId as string);

        // Check if this is a role change from customer to seller
        if (user && (await user)?.role === 'customer') {
          // Send notification about role change
          addNotification({
            title: "Customer Upgrading to Seller",
            message: `${(await user)?.fullName || (await user)?.name} is upgrading from customer to seller with ${plan.title} plan.`,
            type: "role_change",
            data: {
              user: {
                id: (await user)?.id,
                name: (await user)?.fullName || (await user)?.name,
                email: (await user)?.email,
                phone: (await user)?.phone,
                city: (await user)?.city,
                state: (await user)?.state,
                brandName: brandName.trim()
              },
              plan: {
                id: plan.id,
                title: plan.title,
                price: plan.price,
                period: plan.period
              },
              previousRole: 'customer',
              newRole: 'seller'
            }
          });
        }

        // Navigate to payment page with plan details
        router.push({
          pathname: "/auth/payment",
          params: {
            userId: userId as string,
            planId: plan.id,
            planTitle: plan.title,
            planPrice: plan.price,
            planPeriod: plan.period,
            brandName: brandName.trim() // Pass brand name to payment page
          }
        });
      }
    } catch (error) {
      console.error("Error processing subscription:", error);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Choose Your Seller Plan</Text>
        <Text style={styles.subtitle}>
          Select a subscription plan to start selling on VP Bullion
        </Text>

        {/* Brand Name Input - Only shown if user doesn't have one */}
        {showBrandNameInput && (
          <View style={styles.brandNameContainer}>
            <Text style={styles.brandNameTitle}>Enter Your Brand Name</Text>
            <Text style={styles.brandNameSubtitle}>
              This will be displayed to customers when they view your listings
            </Text>
            <View style={styles.brandNameInputContainer}>
              <Store size={20} color="#F3B62B" style={styles.brandNameIcon} />
              <TextInput
                style={styles.brandNameInput}
                placeholder="Enter your business or brand name"
                placeholderTextColor="#9e9e9e"
                value={brandName}
                onChangeText={setBrandName}
              />
            </View>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.plansContainer}
          showsVerticalScrollIndicator={false}
        >
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <Animated.View
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlanCard,
                plan.recommended && styles.recommendedPlanCard,
                { transform: [{ scale: scaleAnims[index] }] }
              ]}
            >
              <TouchableOpacity
                style={styles.planCardInner}
                onPress={() => handlePlanSelect(plan.id, index)}
                activeOpacity={0.9}
              >
                {plan.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}

                <LinearGradient
                  colors={plan.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.planIconContainer}
                >
                  <plan.icon size={28} color="#ffffff" />
                </LinearGradient>

                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.map((feature, featureIndex) => (
                    <View key={featureIndex} style={styles.featureItem}>
                      <Check size={16} color="#43A047" style={styles.featureIcon} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.selectionIndicator}>
                  <View style={[
                    styles.radioOuter,
                    selectedPlan === plan.id && styles.radioOuterSelected
                  ]}>
                    {selectedPlan === plan.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.selectText,
                    selectedPlan === plan.id && styles.selectTextSelected
                  ]}>
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedPlan || isLoading}
          style={[
            styles.buttonContainer,
            (!selectedPlan || isLoading) && styles.buttonDisabled
          ]}
        >
          <LinearGradient
            colors={["#F3B62B", "#F5D76E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Continue to Payment</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#ffffff",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 60,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
  },
  brandNameContainer: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F5D76E",
  },
  brandNameTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  brandNameSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  brandNameInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#ffffff",
  },
  brandNameIcon: {
    marginRight: 12,
  },
  brandNameInput: {
    flex: 1,
    height: 56,
    color: "#333333",
  },
  plansContainer: {
    paddingBottom: 24,
  },
  planCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  selectedPlanCard: {
    borderColor: "#F3B62B",
    borderWidth: 2,
  },
  recommendedPlanCard: {
    borderColor: "#F3B62B",
    borderWidth: 2,
  },
  planCardInner: {
    padding: 20,
  },
  recommendedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#F3B62B",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  recommendedText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F3B62B",
  },
  planPeriod: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#333333",
  },
  selectionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9e9e9e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: "#F3B62B",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F3B62B",
  },
  selectText: {
    fontSize: 14,
    color: "#666666",
  },
  selectTextSelected: {
    color: "#F3B62B",
    fontWeight: "600",
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  button: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});