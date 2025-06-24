import React, { useState } from "react";
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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Phone, Mail, MapPin, Send, CheckCircle, User, Store, Clock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "@/store/auth-store";

export default function ContactScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { user, users, contactedDealers, getContactedSellerDetails, getUserById } = useAuthStore();

  interface DealerData {
    id?: string | number;
    fullName?: string;
    name?: string;
    brandName?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
  }

  // Get contacted dealers with full details
  const contactedSellerDetails = getContactedSellerDetails();
  const contactedDealersList = contactedSellerDetails.map(async contact => {
    const userData = getUserById(contact.sellerId);
    // Handle Promise case
    const resolvedUserData = await Promise.resolve(userData);
    if (!resolvedUserData) {
      console.warn('User data could not be resolved');
      return null;
    }
    return resolvedUserData as DealerData;
  })
    .filter(Boolean) as DealerData[];


  const getDealerProperty = (dealer: any, property: string, fallback: string = '') => {
    return dealer?.[property] || fallback;
  };



  const handleSubmit = async () => {
    if (!name || !email || !phone || !message) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Trigger haptic feedback on success
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setIsSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError("Failed to send message. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Contact Us</Text>
            <Text style={styles.headerSubtitle}>
              We'd love to hear from you
            </Text>
          </View>

          {/* Contacted Dealers Section */}
          {contactedDealersList.length > 0 && (
            <View style={styles.contactedDealersContainer}>
              <Text style={styles.contactedDealersTitle}>Your Contacted Dealers</Text>

              {contactedDealersList.map((dealer, index) => {
                const dealerData = dealer as any;
                return (
                  <View key={dealer?.id || index} style={styles.dealerCard}>
                    <View style={styles.dealerHeader}>
                      <View style={styles.dealerIconContainer}>
                        <User size={20} color="#1976D2" />
                      </View>
                      <View style={styles.dealerInfo}>
                        <Text style={styles.dealerName}>{getDealerProperty(dealerData, "fullName") || getDealerProperty(dealerData, 'name')}</Text>
                        {getDealerProperty(dealerData, "brandName") && (
                          <View style={styles.brandContainer}>
                            <Store size={14} color="#F3B62B" style={styles.brandIcon} />
                            <Text style={styles.brandName}>{getDealerProperty(dealerData, "brandName")}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.dealerDetailsContainer}>
                      {getDealerProperty(dealerData, "city") && (
                        <View style={styles.dealerDetailRow}>
                          <MapPin size={16} color="#666666" style={styles.dealerDetailIcon} />
                          <Text style={styles.dealerDetailText}>
                            {getDealerProperty(dealerData, "city")}{getDealerProperty(dealerData, "state") ? `, ${getDealerProperty(dealerData, "state")}` : ""}
                          </Text>
                        </View>
                      )}

                      {getDealerProperty(dealerData, "phone") && (
                        <View style={styles.dealerDetailRow}>
                          <Phone size={16} color="#666666" style={styles.dealerDetailIcon} />
                          <Text style={styles.dealerDetailText}>{getDealerProperty(dealerData, "phone")}</Text>
                        </View>
                      )}

                      <View style={styles.dealerDetailRow}>
                        <Mail size={16} color="#666666" style={styles.dealerDetailIcon} />
                        <Text style={styles.dealerDetailText}>{getDealerProperty(dealerData, "email")}</Text>
                      </View>
                    </View>

                    <View style={styles.contactTimeContainer}>
                      <Clock size={14} color="#9e9e9e" style={styles.contactTimeIcon} />
                      <Text style={styles.contactTimeText}>
                        Contacted on {formatDate(contactedSellerDetails[index]?.timestamp || Date.now())}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          <View style={styles.contactInfoContainer}>
            <View style={styles.contactInfoCard}>
              <View style={styles.contactIconContainer}>
                <Phone size={20} color="#F3B62B" />
              </View>
              <View>
                <Text style={styles.contactInfoTitle}>Phone</Text>
                <Text style={styles.contactInfoText}>+91 98765 43210</Text>
              </View>
            </View>

            <View style={styles.contactInfoCard}>
              <View style={styles.contactIconContainer}>
                <Mail size={20} color="#F3B62B" />
              </View>
              <View>
                <Text style={styles.contactInfoTitle}>Email</Text>
                <Text style={styles.contactInfoText}>info@vpbullion.com</Text>
              </View>
            </View>

            <View style={styles.contactInfoCard}>
              <View style={styles.contactIconContainer}>
                <MapPin size={20} color="#F3B62B" />
              </View>
              <View>
                <Text style={styles.contactInfoTitle}>Address</Text>
                <Text style={styles.contactInfoText}>
                  123 Bullion Street, Mumbai, India
                </Text>
              </View>
            </View>
          </View>

          {isSubmitted ? (
            <View style={styles.successContainer}>
              <LinearGradient
                colors={["#FFF8E1", "#FFF3CD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.successGradient}
              >
                <CheckCircle size={60} color="#4CAF50" />
                <Text style={styles.successTitle}>Message Sent!</Text>
                <Text style={styles.successText}>
                  Thank you for contacting us. We'll get back to you shortly.
                </Text>
                <TouchableOpacity
                  style={styles.newMessageButton}
                  onPress={() => setIsSubmitted(false)}
                >
                  <Text style={styles.newMessageButtonText}>Send Another Message</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Send us a message</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#9e9e9e"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9e9e9e"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9e9e9e"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="How can we help you?"
                  placeholderTextColor="#9e9e9e"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={handleSubmit}
                disabled={isLoading}
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
                    <>
                      <Text style={styles.buttonText}>Send Message</Text>
                      <Send size={18} color="#ffffff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
  },
  contactedDealersContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  contactedDealersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  dealerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dealerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dealerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dealerInfo: {
    flex: 1,
  },
  dealerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    marginRight: 4,
  },
  brandName: {
    fontSize: 14,
    color: "#F3B62B",
    fontWeight: "500",
  },
  dealerDetailsContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dealerDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dealerDetailIcon: {
    marginRight: 8,
  },
  dealerDetailText: {
    fontSize: 14,
    color: "#666666",
  },
  contactTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  contactTimeIcon: {
    marginRight: 4,
  },
  contactTimeText: {
    fontSize: 12,
    color: "#9e9e9e",
  },
  contactInfoContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  contactInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactInfoTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  contactInfoText: {
    fontSize: 14,
    color: "#666666",
  },
  formContainer: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#333333",
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    color: "#333333",
    backgroundColor: "#f9f9f9",
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  button: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  successContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  successGradient: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  newMessageButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#F3B62B",
  },
  newMessageButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F3B62B",
  },
});