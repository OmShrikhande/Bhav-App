import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
  Image,
  ColorValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ArrowLeft, Check, Star, Shield, Zap, Users, Phone } from "lucide-react-native";
import { useAuthStore } from "@/store/auth-store";

// Premium subscription plans
const PREMIUM_PLANS = [
  {
    id: "monthly",
    title: "Monthly",
    price: "₹199",
    period: "per month",
    features: [
      "Contact unlimited dealers",
      "Priority customer support",
      "Early access to new listings",
      "Save favorite listings"
    ],
    color: ["#4CAF50", "#81C784"] as readonly string[],
    icon: Star
  },
  {
    id: "yearly",
    title: "Yearly",
    price: "₹1,999",
    period: "per year",
    features: [
      "Contact unlimited dealers",
      "Priority customer support",
      "Early access to new listings",
      "Save favorite listings",
      "Price alerts",
      "Market insights"
    ],
    color: ["#F3B62B", "#F5D76E"] as readonly string[],
    icon: Shield,
    recommended: true,
    savings: "Save ₹389"
  },
  {
    id: "lifetime",
    title: "Lifetime",
    price: "₹4,999",
    period: "one-time payment",
    features: [
      "Contact unlimited dealers",
      "VIP customer support",
      "Early access to new listings",
      "Save unlimited favorites",
      "Price alerts",
      "Market insights",
      "Exclusive market reports",
      "Lifetime access"
    ],
    color: ["#1976D2", "#64B5F6"] as readonly string[],
    icon: Zap
  }
];

export default function PremiumSubscriptionScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values for plan cards
  const scaleAnims = PREMIUM_PLANS.map(() => React.useRef(new Animated.Value(1)).current);

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

    setIsLoading(true);

    try {
      // Find the selected plan details
      const plan = PREMIUM_PLANS.find(p => p.id === selectedPlan);

      if (plan && user) {
        // Navigate to payment page with plan details
        router.push({
          pathname: "/auth/premium-payment",
          params: {
            userId: user.id,
            planId: plan.id,
            planTitle: plan.title,
            planPrice: plan.price,
            planPeriod: plan.period
          }
        });
      }
    } catch (error) {
      console.error("Error processing premium subscription:", error);
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

        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Get unlimited dealer contacts and exclusive benefits
        </Text>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Users size={20} color="#F3B62B" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Contact unlimited dealers</Text>
          </View>
          <View style={styles.benefitItem}>
            <Phone size={20} color="#F3B62B" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Get priority customer support</Text>
          </View>
          <View style={styles.benefitItem}>
            <Star size={20} color="#F3B62B" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Access exclusive features</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.plansContainer}
          showsVerticalScrollIndicator={false}
        >
          {PREMIUM_PLANS.map((plan, index) => (
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
                    <Text style={styles.recommendedText}>Best Value</Text>
                  </View>
                )}

                <LinearGradient
                  colors={plan.color as readonly [string, string]}
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
                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}
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

          <View style={styles.guaranteeContainer}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80" }}
              style={styles.guaranteeImage}
              resizeMode="contain"
            />
            <Text style={styles.guaranteeTitle}>100% Satisfaction Guarantee</Text>
            <Text style={styles.guaranteeText}>
              If you're not satisfied with your premium experience within the first 7 days, we'll provide a full refund.
            </Text>
          </View>
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
            colors={["#F3B62B", "#F5D76E"] as readonly [string, string]}
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
  benefitsContainer: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitIcon: {
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
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
  savingsBadge: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  savingsText: {
    fontSize: 12,
    color: "#F3B62B",
    fontWeight: "600",
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
  guaranteeContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  guaranteeImage: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  guaranteeText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
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