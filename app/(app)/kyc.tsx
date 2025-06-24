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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { FileText, Upload, CheckCircle, Camera, Menu } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { images } from "@/constants/images";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

export default function KycScreen() {
  const [fullName, setFullName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [panImage, setPanImage] = useState<string | null>(null);
  const [aadharImage, setAadharImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuthStore();

  const isSeller = user?.role === "seller";

  const pickImage = async (setImageFunction: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageFunction(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !panNumber || !aadharNumber || !address) {
      setError("Please fill in all fields and upload all required documents");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Simulate API call - make it instant as requested
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to submit KYC. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, use placeholder images if user hasn't selected any
  const getPanImage = () => panImage || images.marketUpdate1;
  const getAadharImage = () => aadharImage || images.marketUpdate2;
  const getSelfieImage = () => selfieImage || images.profilePlaceholder;

  const openDrawer = () => {
    router.push("/drawer");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={openDrawer}
        // style={styles.menuButton}
        >
          <Menu size={24} color="#333333" />
        </TouchableOpacity>
        {/* <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>User Management</Text>
        </View> */}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>KYC Verification</Text>
            <Text style={styles.headerSubtitle}>
              Complete your verification to start trading
            </Text>
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
                <Text style={styles.successTitle}>KYC Submitted!</Text>
                <Text style={styles.successText}>
                  Your KYC documents have been submitted successfully. We'll verify your details and update you shortly.
                </Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Under Review</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Personal Information</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9e9e9e"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PAN Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your PAN number"
                  placeholderTextColor="#9e9e9e"
                  autoCapitalize="characters"
                  value={panNumber}
                  onChangeText={setPanNumber}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Aadhar Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Aadhar number"
                  placeholderTextColor="#9e9e9e"
                  keyboardType="number-pad"
                  value={aadharNumber}
                  onChangeText={setAadharNumber}
                />
              </View>

              {isSeller && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>GST Certificate Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your GST Certificate number"
                    placeholderTextColor="#9e9e9e"
                    keyboardType="number-pad"
                    value={gstNumber}
                    onChangeText={setGstNumber}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter your full address"
                  placeholderTextColor="#9e9e9e"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <Text style={styles.sectionTitle}>Document Upload</Text>

              <View style={styles.documentContainer}>
                <Text style={styles.documentLabel}>PAN Card</Text>
                {panImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: getPanImage() }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={() => pickImage(setPanImage)}
                    >
                      <Text style={styles.changeImageText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage(setPanImage)}
                  >
                    <Upload size={24} color="#F3B62B" />
                    <Text style={styles.uploadText}>Upload PAN Card</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.documentContainer}>
                <Text style={styles.documentLabel}>Aadhar Card</Text>
                {aadharImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: getAadharImage() }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={() => pickImage(setAadharImage)}
                    >
                      <Text style={styles.changeImageText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage(setAadharImage)}
                  >
                    <Upload size={24} color="#F3B62B" />
                    <Text style={styles.uploadText}>Upload Aadhar Card</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.documentContainer}>
                <Text style={styles.documentLabel}>Selfie</Text>
                {selfieImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: getSelfieImage() }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={() => pickImage(setSelfieImage)}
                    >
                      <Text style={styles.changeImageText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage(setSelfieImage)}
                  >
                    <Camera size={24} color="#F3B62B" />
                    <Text style={styles.uploadText}>Upload Selfie</Text>
                  </TouchableOpacity>
                )}
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
                      <Text style={styles.buttonText}>Submit KYC</Text>
                      <FileText size={18} color="#ffffff" />
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  headerSubtitle: {
    fontSize: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 16,
    marginBottom: 16,
  },
  documentContainer: {
    marginBottom: 16,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  uploadButton: {
    height: 120,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#F3B62B",
  },
  imagePreviewContainer: {
    position: "relative",
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 8,
  },
  changeImageText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
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
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: "#FFC107",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
});