import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  ChevronRight,
  CheckCircle,
  XCircle,
  ArrowRight,
  DollarSign,
  IndianRupee,
  Shield,
  AlertCircle,
  Clock,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

// Payment method types
type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

// Transaction types
type TransactionType = "buy" | "sell";

// Payment method option component
interface PaymentOptionProps {
  title: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({
  title,
  icon,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.paymentOptionIcon}>{icon}</View>
      <Text style={styles.paymentOptionText}>{title}</Text>
      <View style={styles.paymentOptionCheck}>
        {isSelected && <View style={styles.paymentOptionCheckInner} />}
      </View>
    </TouchableOpacity>
  );
};

// Bank option component for net banking
interface BankOptionProps {
  name: string;
  logo: string;
  onSelect: () => void;
}

const BankOption: React.FC<BankOptionProps> = ({ name, logo, onSelect }) => {
  return (
    <TouchableOpacity style={styles.bankOption} onPress={onSelect} activeOpacity={0.7}>
      <Image source={{ uri: logo }} style={styles.bankLogo} contentFit="contain" />
      <Text style={styles.bankName}>{name}</Text>
      <ChevronRight size={16} color="#999" />
    </TouchableOpacity>
  );
};

// Wallet option component
interface WalletOptionProps {
  name: string;
  logo: string;
  onSelect: () => void;
}

const WalletOption: React.FC<WalletOptionProps> = ({ name, logo, onSelect }) => {
  return (
    <TouchableOpacity style={styles.walletOption} onPress={onSelect} activeOpacity={0.7}>
      <Image source={{ uri: logo }} style={styles.walletLogo} contentFit="contain" />
      <Text style={styles.walletName}>{name}</Text>
      <ChevronRight size={16} color="#999" />
    </TouchableOpacity>
  );
};

// Transaction type selector component
interface TransactionTypeProps {
  type: TransactionType;
  selectedType: TransactionType;
  onSelect: () => void;
}

const TransactionTypeSelector: React.FC<TransactionTypeProps> = ({
  type,
  selectedType,
  onSelect,
}) => {
  const isSelected = type === selectedType;

  return (
    <TouchableOpacity
      style={[
        styles.transactionTypeButton,
        isSelected && styles.transactionTypeButtonSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.transactionTypeText,
          isSelected && styles.transactionTypeTextSelected,
        ]}
      >
        {type === "buy" ? "Buy Bullion" : "Sell Bullion"}
      </Text>
    </TouchableOpacity>
  );
};

// Recent transaction component
interface RecentTransactionProps {
  type: "buy" | "sell";
  amount: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

const RecentTransaction: React.FC<RecentTransactionProps> = ({
  type,
  amount,
  date,
  status,
}) => {
  return (
    <View style={styles.recentTransaction}>
      <View style={styles.recentTransactionIcon}>
        {status === "completed" ? (
          <CheckCircle size={20} color="#4CAF50" />
        ) : status === "pending" ? (
          <Clock size={20} color="#FFC107" />
        ) : (
          <AlertCircle size={20} color="#F44336" />
        )}
      </View>
      <View style={styles.recentTransactionDetails}>
        <Text style={styles.recentTransactionTitle}>
          {type === "buy" ? "Bought Gold" : "Sold Silver"}
        </Text>
        <Text style={styles.recentTransactionDate}>{date}</Text>
      </View>
      <View style={styles.recentTransactionAmount}>
        <Text
          style={[
            styles.recentTransactionAmountText,
            { color: type === "buy" ? "#F44336" : "#4CAF50" },
          ]}
        >
          {type === "buy" ? "-" : "+"}₹{amount}
        </Text>
        <View
          style={[
            styles.recentTransactionStatus,
            {
              backgroundColor:
                status === "completed"
                  ? "#E8F5E9"
                  : status === "pending"
                    ? "#FFF8E1"
                    : "#FFEBEE",
            },
          ]}
        >
          <Text
            style={[
              styles.recentTransactionStatusText,
              {
                color:
                  status === "completed"
                    ? "#4CAF50"
                    : status === "pending"
                      ? "#FFC107"
                      : "#F44336",
              },
            ]}
          >
            {status === "completed"
              ? "Completed"
              : status === "pending"
                ? "Pending"
                : "Failed"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function TransactionScreen() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [transactionType, setTransactionType] = useState<TransactionType>("buy");
  const [amount, setAmount] = useState("10000");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<"success" | "failure" | null>(null);
  const [showRecentTransactions, setShowRecentTransactions] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setPaymentMethod(method);
  };

  // Handle transaction type selection
  const handleTransactionTypeSelect = (type: TransactionType) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setTransactionType(type);
  };

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
  };

  // Format card expiry date (MM/YY)
  const formatCardExpiry = (text: string) => {
    const cleaned = text.replace(/[^0-9]/gi, "");
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Toggle recent transactions
  const toggleRecentTransactions = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    if (showRecentTransactions) {
      // Hide recent transactions with animation
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowRecentTransactions(false);
      });
    } else {
      // Show recent transactions with animation
      setShowRecentTransactions(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Process payment
  const processPayment = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Randomly determine success or failure (80% success rate)
      const isSuccess = Math.random() < 0.8;
      setTransactionStatus(isSuccess ? "success" : "failure");
      setIsProcessing(false);

      // Trigger appropriate haptic feedback
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          isSuccess
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Error
        );
      }

      // Animate the result
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset after 5 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setTransactionStatus(null);
          fadeAnim.setValue(0);
          scaleAnim.setValue(0.8);
        });
      }, 5000);
    }, 2000);
  };

  // Reset transaction
  const resetTransaction = () => {
    setTransactionStatus(null);
    setUpiId("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
  };

  // Render payment form based on selected method
  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case "upi":
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formLabel}>Enter UPI ID</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="username@upi"
                placeholderTextColor="#999"
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
              />
            </View>
            <Text style={styles.formHint}>
              Enter your UPI ID (e.g., username@okaxis, phone@paytm)
            </Text>

            <View style={styles.upiOptionsContainer}>
              <Text style={styles.upiOptionsTitle}>Popular UPI Apps</Text>
              <View style={styles.upiOptions}>
                <TouchableOpacity style={styles.upiApp}>
                  <View style={styles.upiAppIcon}>
                    <Image
                      source={{ uri: "https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop" }}
                      style={styles.upiAppImage}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={styles.upiAppName}>GPay</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.upiApp}>
                  <View style={styles.upiAppIcon}>
                    <Image
                      source={{ uri: "https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop" }}
                      style={styles.upiAppImage}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={styles.upiAppName}>PhonePe</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.upiApp}>
                  <View style={styles.upiAppIcon}>
                    <Image
                      source={{ uri: "https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop" }}
                      style={styles.upiAppImage}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={styles.upiAppName}>Paytm</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.upiApp}>
                  <View style={styles.upiAppIcon}>
                    <Image
                      source={{ uri: "https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop" }}
                      style={styles.upiAppImage}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={styles.upiAppName}>BHIM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case "card":
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formLabel}>Card Number</Text>
            <View style={styles.inputContainer}>
              <CreditCard size={20} color="#F3B62B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#999"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <Text style={styles.formLabel}>Cardholder Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Name on card"
                placeholderTextColor="#999"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            <View style={styles.cardDetailsRow}>
              <View style={styles.cardExpiryContainer}>
                <Text style={styles.formLabel}>Expiry Date</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#999"
                    value={cardExpiry}
                    onChangeText={(text) => setCardExpiry(formatCardExpiry(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={styles.cardCvvContainer}>
                <Text style={styles.formLabel}>CVV</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#999"
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View style={styles.securePaymentInfo}>
              <Shield size={16} color="#4CAF50" />
              <Text style={styles.securePaymentText}>
                Your payment information is secure and encrypted
              </Text>
            </View>
          </View>
        );

      case "netbanking":
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formLabel}>Select Bank</Text>

            <ScrollView style={styles.bankList}>
              <BankOption
                name="HDFC Bank"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
              <BankOption
                name="ICICI Bank"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
              <BankOption
                name="State Bank of India"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
              <BankOption
                name="Axis Bank"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
              <BankOption
                name="Kotak Mahindra Bank"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
              <BankOption
                name="Yes Bank"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
            </ScrollView>
          </View>
        );

      case "wallet":
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formLabel}>Select Wallet</Text>

            <ScrollView style={styles.walletList}>
              <WalletOption
                name="Paytm"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
              <WalletOption
                name="Amazon Pay"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
              <WalletOption
                name="PhonePe"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
              <WalletOption
                name="MobiKwik"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
              <WalletOption
                name="Freecharge"
                logo="https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop"
                onSelect={() => { }}
              />
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  // Render transaction result
  const renderTransactionResult = () => {
    if (!transactionStatus) return null;

    return (
      <Animated.View
        style={[
          styles.transactionResultContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={
            transactionStatus === "success"
              ? ["#E8F5E9", "#C8E6C9"]
              : ["#FFEBEE", "#FFCDD2"]
          }
          style={styles.transactionResultGradient}
        >
          <View style={styles.transactionResultIcon}>
            {transactionStatus === "success" ? (
              <CheckCircle size={60} color="#4CAF50" />
            ) : (
              <XCircle size={60} color="#F44336" />
            )}
          </View>

          <Text style={styles.transactionResultTitle}>
            {transactionStatus === "success"
              ? "Payment Successful!"
              : "Payment Failed"}
          </Text>

          <Text style={styles.transactionResultMessage}>
            {transactionStatus === "success"
              ? "Your transaction has been processed successfully."
              : "There was an issue processing your payment. Please try again."}
          </Text>

          {transactionStatus === "success" && (
            <View style={styles.transactionDetails}>
              <View style={styles.transactionDetailRow}>
                <Text style={styles.transactionDetailLabel}>Amount</Text>
                <Text style={styles.transactionDetailValue}>₹{amount}</Text>
              </View>
              <View style={styles.transactionDetailRow}>
                <Text style={styles.transactionDetailLabel}>Transaction ID</Text>
                <Text style={styles.transactionDetailValue}>
                  VP{Math.floor(Math.random() * 1000000000)}
                </Text>
              </View>
              <View style={styles.transactionDetailRow}>
                <Text style={styles.transactionDetailLabel}>Date & Time</Text>
                <Text style={styles.transactionDetailValue}>
                  {new Date().toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.transactionResultButton,
              {
                backgroundColor:
                  transactionStatus === "success" ? "#4CAF50" : "#F44336",
              },
            ]}
            onPress={resetTransaction}
          >
            <Text style={styles.transactionResultButtonText}>
              {transactionStatus === "success" ? "Done" : "Try Again"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  // Render recent transactions panel
  const renderRecentTransactions = () => {
    if (!showRecentTransactions) return null;

    return (
      <Animated.View
        style={[
          styles.recentTransactionsContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.recentTransactionsHeader}>
          <Text style={styles.recentTransactionsTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={toggleRecentTransactions}>
            <Text style={styles.recentTransactionsClose}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.recentTransactionsList}>
          <RecentTransaction
            type="buy"
            amount="25,000"
            date="Today, 10:30 AM"
            status="completed"
          />
          <RecentTransaction
            type="sell"
            amount="15,000"
            date="Yesterday, 3:45 PM"
            status="completed"
          />
          <RecentTransaction
            type="buy"
            amount="50,000"
            date="May 10, 2023"
            status="pending"
          />
          <RecentTransaction
            type="buy"
            amount="10,000"
            date="May 5, 2023"
            status="failed"
          />
          <RecentTransaction
            type="sell"
            amount="30,000"
            date="April 28, 2023"
            status="completed"
          />
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={toggleRecentTransactions}
          >
            <Clock size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction Type Selector */}
          <View style={styles.transactionTypeContainer}>
            <TransactionTypeSelector
              type="buy"
              selectedType={transactionType}
              onSelect={() => handleTransactionTypeSelect("buy")}
            />
            <TransactionTypeSelector
              type="sell"
              selectedType={transactionType}
              onSelect={() => handleTransactionTypeSelect("sell")}
            />
          </View>

          {/* Amount Section */}
          <View style={styles.amountContainer}>
            <LinearGradient
              colors={["#FFF8E1", "#FFF3CD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.amountGradient}
            >
              <Text style={styles.amountLabel}>Amount</Text>
              <View style={styles.amountRow}>
                <IndianRupee size={24} color="#F3B62B" />
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                />
              </View>
              <Text style={styles.amountHint}>
                Enter the amount you wish to {transactionType === "buy" ? "pay" : "receive"}
              </Text>
            </LinearGradient>
          </View>

          {/* Payment Methods */}
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <View style={styles.paymentMethodsContainer}>
            <PaymentOption
              title="UPI"
              icon={<Smartphone size={24} color={paymentMethod === "upi" ? "#F3B62B" : "#666"} />}
              isSelected={paymentMethod === "upi"}
              onSelect={() => handlePaymentMethodSelect("upi")}
            />

            <PaymentOption
              title="Card"
              icon={<CreditCard size={24} color={paymentMethod === "card" ? "#F3B62B" : "#666"} />}
              isSelected={paymentMethod === "card"}
              onSelect={() => handlePaymentMethodSelect("card")}
            />

            <PaymentOption
              title="Net Banking"
              icon={<Landmark size={24} color={paymentMethod === "netbanking" ? "#F3B62B" : "#666"} />}
              isSelected={paymentMethod === "netbanking"}
              onSelect={() => handlePaymentMethodSelect("netbanking")}
            />

            <PaymentOption
              title="Wallet"
              icon={<Wallet size={24} color={paymentMethod === "wallet" ? "#F3B62B" : "#666"} />}
              isSelected={paymentMethod === "wallet"}
              onSelect={() => handlePaymentMethodSelect("wallet")}
            />
          </View>

          {/* Payment Form */}
          {renderPaymentForm()}

          {/* Pay Button */}
          <TouchableOpacity
            style={styles.payButtonContainer}
            onPress={processPayment}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={["#F3B62B", "#F5D76E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payButton}
            >
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.payButtonText}>
                    {transactionType === "buy" ? "Pay Now" : "Receive Payment"}
                  </Text>
                  <ArrowRight size={18} color="#ffffff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Secure Payment Info */}
          <View style={styles.securePaymentFooter}>
            <Text style={styles.securePaymentFooterText}>
              Secured by Razorpay Payment Gateway
            </Text>
            <View style={styles.paymentLogos}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1622637935474-42d797a7853c?q=80&w=100&auto=format&fit=crop" }}
                style={styles.paymentLogo}
                contentFit="contain"
              />
            </View>
          </View>
        </ScrollView>

        {/* Transaction Result Overlay */}
        {renderTransactionResult()}

        {/* Recent Transactions Panel */}
        {renderRecentTransactions()}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  transactionTypeContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    padding: 4,
  },
  transactionTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  transactionTypeButtonSelected: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  transactionTypeTextSelected: {
    color: "#F3B62B",
    fontWeight: "600",
  },
  amountContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 24,
  },
  amountGradient: {
    borderRadius: 16,
    padding: 20,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountInput: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 8,
    flex: 1,
  },
  amountHint: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  paymentOptionSelected: {
    borderColor: "#F3B62B",
    backgroundColor: "#FFF8E1",
  },
  paymentOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    flex: 1,
  },
  paymentOptionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F3B62B",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentOptionCheckInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F3B62B",
  },
  paymentForm: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: "#333333",
  },
  formHint: {
    fontSize: 12,
    color: "#999",
    marginBottom: 16,
  },
  upiOptionsContainer: {
    marginTop: 8,
  },
  upiOptionsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 12,
  },
  upiOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  upiApp: {
    alignItems: "center",
    width: (width - 40) / 4 - 8,
  },
  upiAppIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  upiAppImage: {
    width: 30,
    height: 30,
  },
  upiAppName: {
    fontSize: 12,
    color: "#666",
  },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardExpiryContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardCvvContainer: {
    flex: 1,
    marginLeft: 8,
  },
  securePaymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F1F8E9",
    borderRadius: 8,
  },
  securePaymentText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 8,
  },
  bankList: {
    maxHeight: 300,
  },
  bankOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bankLogo: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
  },
  bankName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  walletList: {
    maxHeight: 300,
  },
  walletOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  walletLogo: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
  },
  walletName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  payButtonContainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 24,
  },
  payButton: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  payButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  securePaymentFooter: {
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 24,
  },
  securePaymentFooterText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  paymentLogos: {
    flexDirection: "row",
    justifyContent: "center",
  },
  paymentLogo: {
    width: 60,
    height: 30,
    marginHorizontal: 4,
  },
  transactionResultContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  transactionResultGradient: {
    width: width - 40,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  transactionResultIcon: {
    marginBottom: 16,
  },
  transactionResultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  transactionResultMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  transactionDetails: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  transactionDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  transactionDetailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  transactionDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  transactionResultButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  transactionResultButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  recentTransactionsContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: width * 0.85,
    backgroundColor: "#ffffff",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  recentTransactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  recentTransactionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  recentTransactionsClose: {
    fontSize: 14,
    color: "#F3B62B",
    fontWeight: "500",
  },
  recentTransactionsList: {
    flex: 1,
  },
  recentTransaction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  recentTransactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentTransactionDetails: {
    flex: 1,
  },
  recentTransactionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  recentTransactionDate: {
    fontSize: 12,
    color: "#999999",
  },
  recentTransactionAmount: {
    alignItems: "flex-end",
  },
  recentTransactionAmountText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  recentTransactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentTransactionStatusText: {
    fontSize: 10,
    fontWeight: "500",
  },
});