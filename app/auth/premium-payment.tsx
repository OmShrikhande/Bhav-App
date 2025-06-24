import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ArrowLeft, CreditCard, Calendar, Lock, CheckCircle, User, QrCode, Copy, Smartphone } from "lucide-react-native";
import { useAuthStore } from "@/store/auth-store";
import * as Clipboard from 'expo-clipboard';

export default function PremiumPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, planId, planTitle, planPrice, planPeriod } = params;
  const { updateUser, addNotification, getUserById } = useAuthStore();

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');

  // Card payment states
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // UPI payment states
  const [upiId, setUpiId] = useState("");
  const [upiCopied, setUpiCopied] = useState(false);

  // Common states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Animation values
  const successScale = React.useRef(new Animated.Value(0)).current;
  const successOpacity = React.useRef(new Animated.Value(0)).current;

  // UPI details
  const merchantUpiId = "vpbullion@ybl";
  // Fix for TypeScript error - ensure userId and planId are strings before using substring
  const userIdStr = typeof userId === 'string' ? userId : Array.isArray(userId) ? userId[0] : '';
  const planIdStr = typeof planId === 'string' ? planId : Array.isArray(planId) ? planId[0] : '';
  const upiReference = `VP${userIdStr.substring(0, 4)}${planIdStr.substring(0, 2)}${Date.now().toString().substring(8, 13)}`;

  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryDateChange = (text: string) => {
    setExpiryDate(formatExpiryDate(text));
  };

  const copyToClipboard = async (text: string) => {
    if (Platform.OS !== "web") {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await navigator.clipboard.writeText(text);
    }
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
  };

  const validateCardPayment = () => {
    // Basic validation for card payment
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setError("Please fill in all payment details");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return false;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Please enter a valid 16-digit card number");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return false;
    }

    if (expiryDate.length !== 5) {
      setError("Please enter a valid expiry date (MM/YY)");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return false;
    }

    if (cvv.length !== 3) {
      setError("Please enter a valid 3-digit CVV");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return false;
    }

    return true;
  };

  const validateUpiPayment = () => {
    // Basic validation for UPI payment
    if (!upiId) {
      setError("Please enter your UPI ID for verification");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return false;
    }

    // Simple UPI ID validation (basic format check)
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(upiId)) {
      setError("Please enter a valid UPI ID (e.g., name@upi)");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    // Validate based on payment method
    let isValid = false;

    if (paymentMethod === 'card') {
      isValid = validateCardPayment();
    } else {
      isValid = validateUpiPayment();
    }

    if (!isValid) return;

    setError("");
    setIsLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get user details for notification
      const user = await getUserById(userIdStr);

      // Update user with premium subscription details
      await updateUser({
        id: userIdStr,
        isPremium: true,
        premiumPlan: planIdStr,
      });

      // Send payment success notification to admin
      addNotification({
        title: "Premium Subscription Payment",
        message: `${user?.fullName || user?.name} has completed payment for ${planTitle} premium plan using ${paymentMethod.toUpperCase()}.`,
        type: "payment_success",
        data: {
          user: {
            id: userIdStr,
            name: user?.fullName || user?.name,
            email: user?.email,
            phone: user?.phone
          },
          plan: {
            id: planIdStr,
            title: typeof planTitle === 'string' ? planTitle : Array.isArray(planTitle) ? planTitle[0] : '',
            price: typeof planPrice === 'string' ? planPrice : Array.isArray(planPrice) ? planPrice[0] : '',
            period: typeof planPeriod === 'string' ? planPeriod : Array.isArray(planPeriod) ? planPeriod[0] : ''
          },
          paymentMethod: paymentMethod
        }
      });

      // Show success animation
      setIsSuccess(true);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Animate success message
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Redirect to home after a short delay
      setTimeout(() => {
        router.replace("/(app)/(tabs)/home");
      }, 2000);

    } catch (error) {
      console.error("Payment error:", error);
      setError("Payment processing failed. Please try again.");
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {!isSuccess && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
            )}

            {isSuccess ? (
              <Animated.View
                style={[
                  styles.successContainer,
                  {
                    opacity: successOpacity,
                    transform: [{ scale: successScale }]
                  }
                ]}
              >
                <CheckCircle size={80} color="#43A047" />
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successMessage}>
                  Your premium subscription has been activated. You will be redirected to the home page.
                </Text>
              </Animated.View>
            ) : (
              <>
                <Text style={styles.title}>Payment Details</Text>
                <Text style={styles.subtitle}>
                  Complete your premium subscription payment
                </Text>

                <View style={styles.planSummary}>
                  <Text style={styles.planSummaryTitle}>Order Summary</Text>
                  <View style={styles.planDetails}>
                    <Text style={styles.planName}>{planTitle} Premium Plan</Text>
                    <Text style={styles.planPrice}>{planPrice}</Text>
                  </View>
                  <Text style={styles.planPeriod}>{planPeriod}</Text>
                </View>

                {/* Payment Method Selector */}
                <View style={styles.paymentMethodContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodTab,
                      paymentMethod === 'card' && styles.paymentMethodTabActive
                    ]}
                    onPress={() => {
                      setPaymentMethod('card');
                      setError("");
                      if (Platform.OS !== "web") {
                        Haptics.selectionAsync();
                      }
                    }}
                  >
                    <CreditCard
                      size={20}
                      color={paymentMethod === 'card' ? "#5C6BC0" : "#9e9e9e"}
                      style={styles.paymentMethodIcon}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === 'card' && styles.paymentMethodTextActive
                      ]}
                    >
                      Card
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentMethodTab,
                      paymentMethod === 'upi' && styles.paymentMethodTabActive
                    ]}
                    onPress={() => {
                      setPaymentMethod('upi');
                      setError("");
                      if (Platform.OS !== "web") {
                        Haptics.selectionAsync();
                      }
                    }}
                  >
                    <Smartphone
                      size={20}
                      color={paymentMethod === 'upi' ? "#5C6BC0" : "#9e9e9e"}
                      style={styles.paymentMethodIcon}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === 'upi' && styles.paymentMethodTextActive
                      ]}
                    >
                      UPI
                    </Text>
                  </TouchableOpacity>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {paymentMethod === 'card' ? (
                  // Card Payment UI
                  <>
                    <View style={styles.cardContainer}>
                      <LinearGradient
                        colors={["#5C6BC0", "#7986CB"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardBackground}
                      >
                        <View style={styles.cardChip} />
                        <Text style={styles.cardNumberPreview}>
                          {cardNumber || "•••• •••• •••• ••••"}
                        </Text>
                        <View style={styles.cardDetails}>
                          <View>
                            <Text style={styles.cardDetailLabel}>CARD HOLDER</Text>
                            <Text style={styles.cardDetailValue}>
                              {cardName || "Your Name"}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.cardDetailLabel}>EXPIRES</Text>
                            <Text style={styles.cardDetailValue}>
                              {expiryDate || "MM/YY"}
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>

                    <View style={styles.formContainer}>
                      <View style={styles.inputContainer}>
                        <CreditCard size={20} color="#5C6BC0" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Card Number"
                          placeholderTextColor="#9e9e9e"
                          value={cardNumber}
                          onChangeText={handleCardNumberChange}
                          keyboardType="numeric"
                          maxLength={19}
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <User size={20} color="#5C6BC0" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Cardholder Name"
                          placeholderTextColor="#9e9e9e"
                          value={cardName}
                          onChangeText={setCardName}
                        />
                      </View>

                      <View style={styles.rowInputs}>
                        <View style={[styles.inputContainer, styles.halfInput]}>
                          <Calendar size={20} color="#5C6BC0" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="MM/YY"
                            placeholderTextColor="#9e9e9e"
                            value={expiryDate}
                            onChangeText={handleExpiryDateChange}
                            keyboardType="numeric"
                            maxLength={5}
                          />
                        </View>

                        <View style={[styles.inputContainer, styles.halfInput]}>
                          <Lock size={20} color="#5C6BC0" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="CVV"
                            placeholderTextColor="#9e9e9e"
                            value={cvv}
                            onChangeText={setCvv}
                            keyboardType="numeric"
                            maxLength={3}
                            secureTextEntry
                          />
                        </View>
                      </View>
                    </View>
                  </>
                ) : (
                  // UPI Payment UI
                  <View style={styles.upiContainer}>
                    <View style={styles.upiQrContainer}>
                      <QrCode size={24} color="#333" style={styles.upiQrIcon} />
                      <Text style={styles.upiQrText}>Scan QR Code to Pay</Text>

                      <View style={styles.qrCodeBox}>
                        <Image
                          source={{ uri: "https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?q=80&w=1000&auto=format&fit=crop" }}
                          style={styles.qrCodeImage}
                          resizeMode="contain"
                        />
                      </View>

                      <View style={styles.upiDetailsContainer}>
                        <View style={styles.upiDetailRow}>
                          <Text style={styles.upiDetailLabel}>UPI ID:</Text>
                          <View style={styles.upiIdContainer}>
                            <Text style={styles.upiDetailValue}>{merchantUpiId}</Text>
                            <TouchableOpacity
                              onPress={() => copyToClipboard(merchantUpiId)}
                              style={styles.copyButton}
                            >
                              <Copy size={16} color="#5C6BC0" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.upiDetailRow}>
                          <Text style={styles.upiDetailLabel}>Amount:</Text>
                          <Text style={styles.upiDetailValue}>{planPrice}</Text>
                        </View>

                        <View style={styles.upiDetailRow}>
                          <Text style={styles.upiDetailLabel}>Reference:</Text>
                          <View style={styles.upiIdContainer}>
                            <Text style={styles.upiDetailValue}>{upiReference}</Text>
                            <TouchableOpacity
                              onPress={() => copyToClipboard(upiReference)}
                              style={styles.copyButton}
                            >
                              <Copy size={16} color="#5C6BC0" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {upiCopied && (
                        <View style={styles.copiedBadge}>
                          <Text style={styles.copiedText}>Copied to clipboard!</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.upiVerificationContainer}>
                      <Text style={styles.upiVerificationTitle}>Verify Your Payment</Text>
                      <Text style={styles.upiVerificationSubtitle}>
                        After making the payment, enter your UPI ID below for verification
                      </Text>

                      <View style={styles.inputContainer}>
                        <Smartphone size={20} color="#5C6BC0" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Your UPI ID (e.g., name@upi)"
                          placeholderTextColor="#9e9e9e"
                          value={upiId}
                          onChangeText={setUpiId}
                        />
                      </View>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handlePayment}
                  disabled={isLoading}
                  style={[
                    styles.buttonContainer,
                    isLoading && styles.buttonDisabled
                  ]}
                >
                  <LinearGradient
                    colors={["#5C6BC0", "#7986CB"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {paymentMethod === 'card' ? `Pay ${planPrice}` : 'Verify & Complete Payment'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>


                {/* add razorpay icon */}
                <Text style={styles.secureText}>
                  <Lock size={12} color="#666666" /> Secure payment processing
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
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
  planSummary: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  planSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  planDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  planName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5C6BC0",
  },
  planPeriod: {
    fontSize: 14,
    color: "#666666",
  },
  paymentMethodContainer: {
    flexDirection: "row",
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  paymentMethodTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
  },
  paymentMethodTabActive: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 2,
    borderBottomColor: "#5C6BC0",
  },
  paymentMethodIcon: {
    marginRight: 8,
  },
  paymentMethodText: {
    fontSize: 16,
    color: "#9e9e9e",
  },
  paymentMethodTextActive: {
    color: "#333333",
    fontWeight: "600",
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 16,
    fontSize: 14,
  },
  cardContainer: {
    height: 200,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardBackground: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: "#FFD700",
    borderRadius: 6,
    marginBottom: 20,
  },
  cardNumberPreview: {
    fontSize: 22,
    color: "#ffffff",
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardDetailLabel: {
    fontSize: 10,
    color: "#B0BEC5",
    marginBottom: 4,
  },
  cardDetailValue: {
    fontSize: 16,
    color: "#ffffff",
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: "#333333",
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 0.48,
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#5C6BC0",
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
  secureText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 24,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  // UPI Payment Styles
  upiContainer: {
    marginBottom: 24,
  },
  upiQrContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  upiQrIcon: {
    marginBottom: 8,
  },
  upiQrText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  qrCodeImage: {
    width: 180,
    height: 180,
  },
  upiDetailsContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  upiDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  upiDetailLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  upiDetailValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
  upiIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  copiedBadge: {
    position: "absolute",
    bottom: 8,
    backgroundColor: "rgba(67, 160, 71, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  copiedText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  upiVerificationContainer: {
    backgroundColor: "#E8EAF6",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#7986CB",
  },
  upiVerificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  upiVerificationSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
  },
});