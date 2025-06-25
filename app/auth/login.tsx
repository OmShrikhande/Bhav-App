import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { images } from "@/constants/images";
import { useAuth } from '@/context/auth-context';
import { ADMIN_USERNAME } from '@/store/auth-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const { firebaseAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Call Firebase sign in
      const result = await firebaseAuth.signIn(email, password);

      if (result.success) {
        // Trigger haptic feedback on success
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Clear any navigation flags before redirecting
        await AsyncStorage.removeItem('navigation-in-progress');
        
        // Navigate to the appropriate dashboard based on user role
        if (firebaseAuth.user?.role === 'admin' || firebaseAuth.user?.username === ADMIN_USERNAME) {
          console.log("Login: User is admin, navigating to admin dashboard");
          // Store admin user in AsyncStorage for the admin layout
          await AsyncStorage.setItem('admin-user', JSON.stringify(firebaseAuth.user));
          router.replace("/(admin)/dashboard");
        } else if (firebaseAuth.user?.role === 'seller') {
          console.log("Login: User is seller, navigating to seller dashboard");
          router.replace("/(app)/(tabs)/seller-dashboard");
        } else {
          console.log("Login: User is customer, navigating to customer dashboard");
          router.replace("/(app)/(tabs)/dashboard");
        }
      } else {
        setError(result.error || "Invalid email or password");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={images.logo}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.logoText}>BHAV App</Text>
          </View>

          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue trading bullion
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={[styles.inputContainer, focusedField === "email" && styles.inputContainerFocused]}>
            <Mail size={20} color="#F3B62B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9e9e9e"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputContainer,
          focusedField === "password" && styles.inputContainerFocused,
          ]}>
            <Lock size={20} color="#F3B62B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9e9e9e"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
              keyboardType="default"
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color="#9e9e9e" />
              ) : (
                <Eye size={20} color="#9e9e9e" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.forgotPasswordRow}>
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.buttonContainer}
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
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>



          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Link href="/auth/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          <View style={styles.adminLoginContainer}>
            <Link href="/auth/admin-login" asChild>
              <TouchableOpacity>
                <Text style={styles.adminLoginText}>Admin Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
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
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F3B62B",
    marginTop: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 32,
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 16,
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
  forgotPasswordRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 24,
  },
  forgotPasswordContainer: {
    padding: 4,
    cursor: "pointer",
  },
  forgotPasswordText: {
    color: "#F3B62B",
    fontWeight: "500",
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    cursor: "pointer",
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
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    color: "#666666",
  },
  signupLink: {
    fontWeight: "600",
    color: "#F3B62B",
    cursor: "pointer",
  },
  adminLoginContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  adminLoginText: {
    fontSize: 14,
    color: "#666666",
    textDecorationLine: "underline",
  },
});