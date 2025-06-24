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
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Mail, Lock, Eye, EyeOff, User, Shield } from "lucide-react-native";
import { images } from "@/constants/images";
import { useAuth } from '@/context/auth-context';
import { ADMIN_USERNAME } from '@/store/auth-store';
import { doc, getFirestore, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { firebaseAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(ADMIN_USERNAME);
  const [fullName, setFullName] = useState("Admin User");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'create'>('login');

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

        // Check if user is admin
        if (firebaseAuth.user?.role === 'admin' || firebaseAuth.user?.username === ADMIN_USERNAME) {
          // Clear any navigation flags before redirecting
          await AsyncStorage.removeItem('navigation-in-progress');
          
          // Store admin user in AsyncStorage for the admin layout
          await AsyncStorage.setItem('admin-user', JSON.stringify(firebaseAuth.user));
          
          // Show success message
          Alert.alert(
            "Login Successful",
            "You are now logged in as an administrator.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Navigate to admin dashboard
                  router.replace("/(admin)/dashboard");
                }
              }
            ]
          );
        } else {
          setError("You don't have admin privileges");
          await firebaseAuth.logOut();
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

  const handleCreateAdmin = async () => {
    if (!email || !password || !username || !fullName) {
      setError("Please fill in all fields");
      return;
    }

    if (username !== ADMIN_USERNAME) {
      setError(`Admin username must be "${ADMIN_USERNAME}"`);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const auth = getAuth();
      const db = getFirestore();

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: email,
        username: username,
        fullName: fullName,
        name: fullName,
        role: 'admin',
        isActive: true,
        sellerVerified: true,
        isPremium: true,
        buyRequestCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        city: "Admin City",
        state: "Admin State",
        firebaseUid: user.uid,
        catalogue: null
      });
      
      // Store the newly created admin user in AsyncStorage
      const adminUser = {
        id: user.uid,
        email: email,
        username: username,
        fullName: fullName,
        name: fullName,
        role: 'admin',
        firebaseUid: user.uid
      };
      
      await AsyncStorage.setItem('admin-user', JSON.stringify(adminUser));
      
      Alert.alert(
        "Success", 
        "Admin user created successfully. Please login now.",
        [{ text: "OK", onPress: () => setMode('login') }]
      );
    } catch (err: any) {
      console.error("Create admin error:", err);
      setError(err.message || "Failed to create admin user. Please try again.");
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image
                source={images.logo}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.logoText}>Admin Portal</Text>
            </View>

            <View style={styles.headerContainer}>
              <Shield size={24} color="#F3B62B" />
              <Text style={styles.welcomeText}>Admin Access</Text>
            </View>
            
            <Text style={styles.subtitle}>
              {mode === 'login' 
                ? 'Sign in with your admin credentials' 
                : 'Create a new admin account'}
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

            {mode === 'create' && (
              <>
                <View style={[styles.inputContainer, focusedField === "username" && styles.inputContainerFocused]}>
                  <User size={20} color="#F3B62B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username (must be vipin_bullion)"
                    placeholderTextColor="#9e9e9e"
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                  />
                </View>

                <View style={[styles.inputContainer, focusedField === "fullName" && styles.inputContainerFocused]}>
                  <User size={20} color="#F3B62B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#9e9e9e"
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={mode === 'login' ? handleLogin : handleCreateAdmin}
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
                  <Text style={styles.buttonText}>
                    {mode === 'login' ? 'Sign In' : 'Create Admin'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.switchModeContainer}>
              <Text style={styles.switchModeText}>
                {mode === 'login' 
                  ? "Need to create an admin account? " 
                  : "Already have an admin account? "}
              </Text>
              <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'create' : 'login')}>
                <Text style={styles.switchModeLink}>
                  {mode === 'login' ? 'Create Admin' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.backToLoginContainer}>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.backToLoginText}>Back to Regular Login</Text>
                </TouchableOpacity>
              </Link>
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
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 8,
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
    borderColor: "#F3B62B",
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
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 16,
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
  switchModeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    flexWrap: "wrap",
  },
  switchModeText: {
    color: "#666666",
  },
  switchModeLink: {
    fontWeight: "600",
    color: "#F3B62B",
  },
  backToLoginContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  backToLoginText: {
    color: "#666666",
    textDecorationLine: "underline",
  },
});