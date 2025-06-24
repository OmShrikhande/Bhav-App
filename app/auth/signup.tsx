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
  Switch,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, MapPin, Phone, CheckCircle, Store } from "lucide-react-native";
import { useAuth } from '@/context/auth-context';
import { UserProfile } from '@/store/firebase-auth-store';

// Define major cities for dropdown
const MAJOR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Lucknow",
  "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Other"
];

export default function SignupScreen() {
  const router = useRouter();
  const { firebaseAuth } = useAuth();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState(""); // Add state field with empty string default
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [brandName, setBrandName] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [becomeSeller, setBecomeSeller] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(MAJOR_CITIES);
  
  // Clear any Firebase auth errors when component mounts
  useEffect(() => {
    firebaseAuth.clearError();
  }, []);

  // Update local error state when Firebase auth error changes
  useEffect(() => {
    if (firebaseAuth.error) {
      setError(firebaseAuth.error);
    }
  }, [firebaseAuth.error]);

  // Filter cities based on input
  useEffect(() => {
    if (city.trim() === "") {
      setFilteredCities(MAJOR_CITIES);
    } else {
      const filtered = MAJOR_CITIES.filter(
        c => c.toLowerCase().includes(city.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [city]);

  // Handle city selection
  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCityDropdown(false);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  // Toggle seller option
  const toggleBecomeSeller = () => {
    setBecomeSeller(!becomeSeller);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  // Handle signup
  const handleSignup = async () => {
    // Validation checks first - before any async operations
    if (!name || !email || !phone || !password || !confirmPassword || !city) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Create user profile for Firebase
      const userProfile: UserProfile = {
        name,
        fullName: name,
        email,
        phone,
        city,
        state, // Include the state field
        address,
        brandName: becomeSeller ? brandName : "",
        role: becomeSeller ? "seller" : "customer",
        createdAt: Date.now(),
        isActive: true,
        isPremium: false,
        buyRequestCount: 0,
      };

      // Call Firebase signup
      const result = await firebaseAuth.signUp(email, password, userProfile);

      if (result.success) {
        // Trigger haptic feedback on success
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Redirect based on role
        if (becomeSeller && result.userId) {
          router.replace({
            pathname: "/auth/subscription",
            params: { userId: result.userId },
          });
        } else {
          Alert.alert(
            "Welcome to Bhav App! 🎉",
            "Your customer account has been created successfully.\n\n✅ Browse live gold & silver rates\n✅ Connect with verified sellers\n✅ Make secure transactions\n\nYou will now be redirected to the dashboard.",
            [
              {
                text: "Continue",
                onPress: () => {
                  router.replace("/(app)/(tabs)/seller-dashboard");
                },
                style: "default",
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        setError(result.error || "Signup failed. Please try again.");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      
      // Handle specific Firebase errors with user-friendly messages
      if (err.message && err.message.includes('auth/email-already-in-use')) {
        setError("This email is already registered. Please use a different email or try logging in.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
      
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#333333" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Bhav App to buy and sell precious metals
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {error.includes("already registered") && (
                <TouchableOpacity
                  onPress={() => router.replace("/auth/login")}
                  style={styles.loginInsteadButton}
                >
                  <Text style={styles.loginInsteadText}>Login Instead</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[
                styles.inputContainer,
                focusedField === "fullName" && styles.inputContainerFocused,
              ]}>
                <User size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9e9e9e"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[
                styles.inputContainer,
                focusedField === "email" && styles.inputContainerFocused,
              ]}>
                <Mail size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9e9e9e"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[
                styles.inputContainer,
                focusedField === "phone" && styles.inputContainerFocused,
              ]}>
                <Phone size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9e9e9e"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={[
                styles.inputContainer,
                focusedField === "username" && styles.inputContainerFocused,
              ]}>
                <User size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  placeholderTextColor="#9e9e9e"
                  keyboardType="default"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View> */}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[
                styles.inputContainer,
                focusedField === "password" && styles.inputContainerFocused,
              ]}>
                <Lock size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#9e9e9e"
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9e9e9e" />
                  ) : (
                    <Eye size={20} color="#9e9e9e" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[
                styles.inputContainer,
                focusedField === "confirm-password" && styles.inputContainerFocused,
              ]}>
                <Lock size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9e9e9e"
                  autoCapitalize="none"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField("confirm-password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#9e9e9e" />
                  ) : (
                    <Eye size={20} color="#9e9e9e" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City</Text>
              <View style={[
                styles.inputContainer,
                focusedField === "city" && styles.inputContainerFocused,
              ]}>
                <MapPin size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your city"
                  placeholderTextColor="#9e9e9e"
                  value={city}
                  onChangeText={setCity}
                  onFocus={() => {
                    setFocusedField("city");
                    setShowCityDropdown(true);
                  }}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {showCityDropdown && filteredCities.length > 0 && (
                <View style={styles.dropdownContainer}>
                  <ScrollView
                    style={styles.dropdown}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredCities.map((cityName, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => handleCitySelect(cityName)}
                      >
                        <Text style={styles.dropdownItemText}>{cityName}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State</Text>
              <View style={[
                styles.inputContainer,
                focusedField === "state" && styles.inputContainerFocused,
              ]}>
                <MapPin size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your state"
                  placeholderTextColor="#9e9e9e"
                  value={state}
                  onChangeText={setState}
                  onFocus={() => setFocusedField("state")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address (Optional)</Text>
              <View style={[styles.textAreaContainer, focusedField === "address" && styles.inputContainerFocused]}>
                <MapPin size={20} color="#F3B62B" style={[styles.inputIcon, { marginTop: 6 }]} />
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter your address"
                  placeholderTextColor="#9e9e9e"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={address}
                  onChangeText={setAddress}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Become a Seller</Text>
                <Text style={styles.switchDescription}>
                  Enable to sell bullion on the platform
                </Text>
              </View>
              <Switch
                value={becomeSeller}
                onValueChange={toggleBecomeSeller}
                trackColor={{ false: "#e0e0e0", true: "#FFF8E1" }}
                thumbColor={becomeSeller ? "#F3B62B" : "#f5f5f5"}
                ios_backgroundColor="#e0e0e0"
              />
            </View>

            {/* Brand Name field - only visible when becomeSeller is true */}
            {becomeSeller && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Brand Name</Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === "brandName" && styles.inputContainerFocused,
                ]}>
                  <Store size={20} color="#F3B62B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your business or brand name"
                    placeholderTextColor="#9e9e9e"
                    value={brandName}
                    onChangeText={setBrandName}
                    onFocus={() => setFocusedField("brandName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleSignup}
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
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.replace("/auth/login")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
  },
  errorText: {
    color: "#ff3b30",
    marginHorizontal: 24,
    marginBottom: 16,
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 16,
    position: "relative",
  },
  inputLabel: {
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
  },
  inputContainerFocused: {
    borderColor: "#F3B62B", // Change border color when focused
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: "#333333",
  },
  eyeIcon: {
    padding: 8,
  },
  textAreaContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    flex: 1,
    height: 100,
    color: "#333333",
    textAlignVertical: "top",
    paddingTop: 8,
  },
  dropdownContainer: {
    position: "absolute",
    top: 88,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdown: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333333",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: "#666666",
  },
  sellerInfoContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F5D76E",
  },
  sellerInfoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  sellerInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
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
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#666666",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F3B62B",
    marginLeft: 4,
  },
  errorContainer: {
    marginHorizontal: 24,
    marginBottom: 10,
    alignItems: "center",
  },
  errorText: {
    color: "#E53935",
    textAlign: "center",
    marginBottom: 5,
  },
  loginInsteadButton: {
    marginTop: 5,
    padding: 8,
  },
  loginInsteadText: {
    color: "#1976D2",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});