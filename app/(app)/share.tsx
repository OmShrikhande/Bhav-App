import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share as RNShare,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Share2, Copy, QrCode, LogOut, RefreshCw, Shield, Award, Scroll, Menu } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { images } from "@/constants/images";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "expo-router";
import * as Clipboard from 'expo-clipboard';

export default function ShareScreen() {
  const baseAppLink = "https://bhavapp.com/app";
  const { user, logout, generateReferralCode, } = useAuthStore();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState<string | null>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construct app link with referral code if available
  const getAppLink = () => {
    if (user?.role === 'admin' && referralCode) {
      return `${baseAppLink}?ref=${referralCode}`;
    }
    return baseAppLink;
  };

  const appLink = getAppLink();

  // Generate a new referral code
  const handleGenerateReferralCode = async () => {
    if (user?.role !== 'admin') return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsGenerating(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const newCode = generateReferralCode();
      setReferralCode(newCode);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "New Referral Code Generated",
        `Your new referral code is: ${newCode}\n\nThis code will be included when you share the app.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error generating referral code:", error);
      Alert.alert("Error", "Failed to generate referral code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    try {
      const message = user?.role === 'admin' && referralCode
        ? `Check out Bhav app for real-time gold and silver rates! Use my referral code ${referralCode} to get premium access. ${appLink}`
        : `Check out Bhav app for real-time gold and silver rates! ${appLink}`;

      await RNShare.share({
        message,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCopy = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    try {
      await Clipboard.setStringAsync(appLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy link to clipboard");
    }
  };

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    logout();
    router.replace("/auth/login");
  };

  const openDrawer = () => {
    router.push("/drawer");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={openDrawer}
        >
          <Menu size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Share App</Text>
        </View>
      </View>

      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share App</Text>
          <Text style={styles.headerSubtitle}>
            Share Bhav App with friends and family
          </Text>
        </View>

        <View style={styles.container}>
          {/* Admin Referral Section */}
          {/* {user?.role === 'admin' && (
            <View style={styles.referralContainer}>
              <LinearGradient
                colors={["#E3F2FD", "#BBDEFB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.referralGradient}
              >
                <View style={styles.referralHeader}>
                  <Shield size={20} color="#1976D2" />
                  <Text style={styles.referralTitle}>Admin Referral Program</Text>
                </View>

                <Text style={styles.referralDescription}>
                  Generate a unique referral code to share with new users. Users who sign up with your code will get premium access to exclusive content.
                </Text>

                {referralCode ? (
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Your active referral code:</Text>
                    <View style={styles.codeBox}>
                      <Text style={styles.codeText}>{referralCode}</Text>
                    </View>
                    <Text style={styles.codeHint}>This code will be included when you share the app</Text>
                  </View>
                ) : (
                  <Text style={styles.noCodeText}>No active referral code. Generate one now!</Text>
                )}

                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateReferralCode}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <RefreshCw size={16} color="#ffffff" />
                      <Text style={styles.generateButtonText}>
                        {referralCode ? "Generate New Code" : "Generate Code"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )} */}

          <LinearGradient
            colors={["#FFF8E1", "#FFF3CD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.qrContainer}
          >
            <View style={styles.qrWrapper}>
              <Image
                source={images.qrCode}
                style={styles.qrCode}
                contentFit="contain"
              />
            </View>
            <Text style={styles.scanText}>Scan to download the app</Text>
          </LinearGradient>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>{appLink}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              {copied ? (
                <Award size={20} color="#4CAF50" />
              ) : (
                <Copy size={20} color="#F3B62B" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleShare}
          >
            <LinearGradient
              colors={["#F3B62B", "#F5D76E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Share App</Text>
              <Share2 size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButtonContainer}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={["#F44336", "#D32F2F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
              <LogOut size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Why Share Bhav App?</Text>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <TrendingUpIcon />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Real-time Rates</Text>
                <Text style={styles.benefitText}>
                  Get live gold and silver rates from COMEX, Spot, and INR markets
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <CalculatorIcon />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>TDS Calculator</Text>
                <Text style={styles.benefitText}>
                  Easily calculate TDS on bullion transactions
                </Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <UpdatesIcon />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Market Updates</Text>
                <Text style={styles.benefitText}>
                  Stay informed with the latest bullion market news and trends
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Custom SVG icons
const TrendingUpIcon = () => (
  <View style={styles.customIcon}>
    <LinearGradient
      colors={["#F3B62B", "#F5D76E"]}
      style={styles.iconGradient}
    >
      <QrCode size={24} color="#ffffff" />
    </LinearGradient>
  </View>
);

const CalculatorIcon = () => (
  <View style={styles.customIcon}>
    <LinearGradient
      colors={["#F3B62B", "#F5D76E"]}
      style={styles.iconGradient}
    >
      <QrCode size={24} color="#ffffff" />
    </LinearGradient>
  </View>
);

const UpdatesIcon = () => (
  <View style={styles.customIcon}>
    <LinearGradient
      colors={["#F3B62B", "#F5D76E"]}
      style={styles.iconGradient}
    >
      <QrCode size={24} color="#ffffff" />
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  referralContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  referralGradient: {
    padding: 20,
    borderRadius: 16,
  },
  referralHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1976D2",
    marginLeft: 8,
  },
  referralDescription: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    marginBottom: 16,
  },
  codeContainer: {
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#1976D2",
    marginBottom: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
    textAlign: "center",
    letterSpacing: 1,
  },
  codeHint: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
  },
  noCodeText: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  qrContainer: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  qrWrapper: {
    width: 200,
    height: 200,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  qrCode: {
    width: 168,
    height: 168,
  },
  scanText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
  },
  copyButton: {
    padding: 8,
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
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
  logoutButtonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 32,
    elevation: 3,
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoutButton: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  benefitsContainer: {
    flex: 1,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  benefitCard: {
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  benefitIconContainer: {
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  customIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  iconGradient: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
});