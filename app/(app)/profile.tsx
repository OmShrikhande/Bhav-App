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
  Alert,
  Share,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { User, Mail, Phone, MapPin, Camera, Save, CheckCircle, ArrowUpCircle, Store, Check, Copy, Share2, Menu, Instagram, Plus, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useAuthStore } from "@/store/auth-store";
import { useAuth } from "@/context/auth-context";
import { firestoreService } from "@/services/firestore";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const { user: firebaseUser, firebaseAuth } = useAuth();
  const router = useRouter();
  
  // Use Firebase user if available, otherwise fall back to legacy user
  const currentUser = firebaseUser || user;
  const [fullName, setFullName] = useState(currentUser?.fullName || currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [brandName, setBrandName] = useState(currentUser?.brandName || ""); // Added brand name state
  const [about, setAbout] = useState(currentUser?.about || ""); // Added about state
  const [profileImage, setProfileImage] = useState<string | null>(currentUser?.profileImage || null);
  const [brandImage, setBrandImage] = useState<string | null>(currentUser?.brandImage || null); // Added brand image state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  // WhatsApp and Instagram
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser?.whatsappNumber || "");
  const [instagramHandle, setInstagramHandle] = useState(currentUser?.instagramHandle || "");
  const [location, setLocation] = useState(currentUser?.location || "");

  // Add catalogue images state
  const [catalogueImages, setCatalogueImages] = useState<string[]>(() => {
    if (currentUser?.catalogueImages) {
      if (typeof currentUser.catalogueImages === 'string') {
        try {
          const parsedImages = JSON.parse(currentUser.catalogueImages);
          return Array.isArray(parsedImages) ? parsedImages : [];
        } catch (error) {
          console.error('Error parsing initial catalogue images:', error);
          return [];
        }
      } else if (Array.isArray(currentUser.catalogueImages)) {
        return currentUser.catalogueImages;
      }
    }
    return [];
  });

  // Update state when user changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setAddress(currentUser.address || "");
      setBrandName(currentUser.brandName || "");
      setAbout(currentUser.about || "");
      setProfileImage(currentUser.profileImage || null);
      setBrandImage(currentUser.brandImage || null); // Add this line
      setWhatsappNumber(currentUser.whatsappNumber || "");
      setInstagramHandle(currentUser.instagramHandle || "");
      setLocation(currentUser.location || "");

      // Parse catalogue images properly
      if (currentUser.catalogueImages) {
        if (typeof currentUser.catalogueImages === 'string') {
          try {
            const parsedImages = JSON.parse(currentUser.catalogueImages);
            setCatalogueImages(Array.isArray(parsedImages) ? parsedImages : []);
          } catch (error) {
            console.error('Error parsing catalogue images:', error);
            setCatalogueImages([]);
          }
        } else if (Array.isArray(currentUser.catalogueImages)) {
          setCatalogueImages(currentUser.catalogueImages);
        } else {
          setCatalogueImages([]);
        }
      } else {
        setCatalogueImages([]);
      }
    }
  }, [currentUser]);

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Failed to pick image. Please try again.");
    }
  };

  // Function to pick brand image
  const pickBrandImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Wide aspect ratio like the live rates image
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setBrandImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking brand image:", err);
      setError("Failed to pick brand image. Please try again.");
    }
  };

  // Function to pick catalogue image
  const pickCatalogueImage = async () => {
    if (catalogueImages.length >= 8) {
      Alert.alert("Limit Reached", "You can only upload up to 8 catalogue images.");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0].uri;
        setCatalogueImages(prev => [...prev, newImage]);
      }
    } catch (err) {
      console.error("Error picking catalogue image:", err);
      setError("Failed to pick image. Please try again.");
    }
  };

  // Function to remove catalogue image
  const removeCatalogueImage = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    setCatalogueImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Create user data object with updated fields
      const userData = {
        fullName,
        name: fullName, // Update name to match fullName
        email,
        phone,
        address,
        profileImage: profileImage ?? undefined,
        brandImage: currentUser?.role === 'seller' ? (brandImage ?? undefined) : undefined,
        brandName: currentUser?.role === 'seller' ? brandName : undefined, // Only include brandName for sellers
        about: currentUser?.role === 'seller' ? about : undefined, // Only include about for sellers
        whatsappNumber: currentUser?.role === 'seller' ? whatsappNumber : undefined, // Only include whatsappNumber for sellers
        instagramHandle: currentUser?.role === 'seller' ? instagramHandle : undefined, // Only include instagramHandle for sellers
        location: currentUser?.role === 'seller' ? location : undefined, // Only include location for sellers
        catalogueImages: currentUser?.role === 'seller'
          ? (catalogueImages.length > 0 ? catalogueImages : undefined)
          : undefined, // Pass array directly
      };

      let result = { success: false, error: "" };

      // Try to update in Firestore first if we have a Firebase user
      if (firebaseUser && firebaseUser.id) {
        try {
          // Update in Firestore
          await firestoreService.updateUser(firebaseUser.id, userData);
          
          // Update in Firebase Auth store
          await firebaseAuth.updateUserProfile(userData);
          
          result = { success: true };
        } catch (error: any) {
          console.error("Error updating Firestore profile:", error);
          // Fall back to legacy update if Firestore fails
        }
      }
      
      // If Firestore update failed or we don't have a Firebase user, try legacy update
      if (!result.success && user) {
        result = await updateUser(userData);
      }

      if (result.success) {
        // Trigger haptic feedback on success
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);

        // Show success alert
        if (Platform.OS === 'web') {
          alert("Profile updated successfully!");
        } else {
          Alert.alert(
            "Profile Updated",
            "Your profile information has been updated successfully.",
            [{ text: "OK" }]
          );
        }
      } else {
        setError(result.error || "Failed to update profile. Please try again.");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Use a placeholder image if no profile image is set
  const getProfileImage = () => {
    if (profileImage) {
      return profileImage;
    }
    return images.profilePlaceholder;
  };
  // Use a placeholder image if no brand image is set
  const getBrandImage = () => {
    if (brandImage) return brandImage;
  };

  // Handle upgrade to seller
  const handleUpgradeToSeller = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    if (!currentUser) return;

    // Navigate to subscription page with user ID
    router.push({
      pathname: "/auth/subscription",
      params: { userId: currentUser.id }
    });
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      // Try to log out from Firebase Auth first
      if (firebaseAuth) {
        await firebaseAuth.logOut();
      }
      
      // Also log out from legacy auth
      if (user) {
        await updateUser({ logout: true });
      }
      
      // Navigate to login screen
      router.replace("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
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
        {/* <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Profile</Text>
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
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSubtitle}>
              Manage your personal information
            </Text>
          </View>

          <View style={styles.profileImageContainer}>
            {/* Brand Cover Image - Only for sellers */}
            {currentUser?.role === 'seller' && (
              <View style={styles.top}>
                {/* Show brand image if available, otherwise show brand name */}
                {brandImage ? (
                  <Image
                    source={{ uri: getBrandImage() }}
                    style={styles.brandCoverImage}
                    contentFit="cover"
                  />
                ) : (
                  /* Default brand name display when no image */
                  currentUser?.brandName && (
                    <Text style={styles.brandName}>{currentUser.brandName}</Text>
                  )
                )}

                {/* Camera button - always visible */}
                <TouchableOpacity
                  style={styles.brandCameraButton}
                  onPress={pickBrandImage}
                >
                  <Camera size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}



            {/* Profile Image - positioned over brand cover */}
            <View style={styles.profileImageWrapper}>
              <Image
                source={{ uri: getProfileImage() }}
                style={styles.profileImage}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={pickImage}
              >
                <Camera size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>{fullName}</Text>

            {currentUser?.role === 'admin' && (
              <Text style={styles.profileEmail}>{currentUser?.role}</Text>
            )}

            {/* Display seller badge if user is a seller */}
            {currentUser?.role === 'seller' && (
              <View style={styles.sellerBadge}>
                <Text style={styles.sellerBadgeText}>
                  Verified Seller
                </Text>
              </View>
            )}

            {/* Display upgrade to seller button if user is not a seller */}
            {currentUser?.role === 'customer' && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgradeToSeller}
              >
                <ArrowUpCircle size={16} color="#F3B62B" style={styles.upgradeIcon} />
                <Text style={styles.upgradeButtonText}>
                  Upgrade to Seller
                </Text>
              </TouchableOpacity>
            )}
          </View>


          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          
          {/* Referral Code Section - Only for sellers */}
          {/* {currentUser?.role === 'seller' && (
            <View style={styles.referralCodeContainer}>
              <View style={styles.referralCodeHeader}>
                <Text style={styles.referralCodeTitle}>Your Referral Code</Text>
                {referralCode && (
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShareReferralCode}
                  >
                    <Share2 size={18} color="#1976D2" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.referralCodeContent}>
                {referralCode ? (
                  <>
                    <Text style={styles.referralCode}>{referralCode}</Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={handleCopyReferralCode}
                    >
                      {codeCopied ? (
                        <Check size={20} color="#4CAF50" />
                      ) : (
                        <Copy size={20} color="#1976D2" />
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerateReferralCode}
                    disabled={isGeneratingCode}
                  >
                    {isGeneratingCode ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.generateButtonText}>Generate Code</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.referralCodeInfo}>
                Share this code with your customers so they can add you as their seller.
              </Text>
            </View>
          )} */}

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Personal Information</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9e9e9e"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>


            {/* Brand Name field - only visible for sellers */}
            {user?.role === 'seller' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Brand Name</Text>
                  <View style={styles.inputContainer}>
                    <Store size={20} color="#F3B62B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your business or brand name"
                      placeholderTextColor="#9e9e9e"
                      value={brandName}
                      onChangeText={setBrandName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>About</Text>
                  <View style={styles.textAreaContainer}>
                    <Store size={20} color="#F3B62B" style={[styles.inputIcon, { marginTop: 6 }]} />
                    <TextInput
                      style={styles.textArea}
                      placeholder="Enter a brief description about your business"
                      placeholderTextColor="#9e9e9e"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      value={about}
                      onChangeText={setAbout}
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#F3B62B" style={styles.inputIcon} />
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
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#F3B62B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9e9e9e"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={styles.textAreaContainer}>
                <MapPin size={20} color="#F3B62B" style={[styles.inputIcon, { marginTop: 6 }]} />
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter your address"
                  placeholderTextColor="#9e9e9e"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>


            {user?.role === 'seller' && (
              <>
                {/* WhatsApp Input */}
                <Text style={styles.inputLabel}>WhatsApp</Text>
                <View style={styles.socialInputContainer}>
                  <View style={styles.socialIconContainer}>
                    <FontAwesome name="whatsapp" size={20} color="#25D366" />
                  </View>
                  <TextInput
                    style={styles.socialInput}
                    placeholder="WhatsApp number"
                    placeholderTextColor="#9e9e9e"
                    keyboardType="phone-pad"
                    value={whatsappNumber}
                    onChangeText={setWhatsappNumber}
                  />
                </View>

                {/* Instagram Input */}
                <Text style={styles.inputLabel}>Instagram</Text>
                <View style={styles.socialInputContainer}>
                  <View style={styles.socialIconContainer}>
                    <FontAwesome name="instagram" size={20} color="#E4405F" />
                  </View>
                  <TextInput
                    style={styles.socialInput}
                    placeholder="Instagram link"
                    placeholderTextColor="#9e9e9e"
                    value={instagramHandle}
                    onChangeText={setInstagramHandle}
                  />
                </View>

                {/* Location Input */}
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.socialInputContainer}>
                  <View style={styles.socialIconContainer}>
                    <FontAwesome name="map-marker" size={20} color="#1F7D53" style={{ marginHorizontal: 3 }} />
                  </View>
                  <TextInput
                    style={styles.socialInput}
                    placeholder="Location link"
                    placeholderTextColor="#9e9e9e"
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>

                {/* Catalogue Images Section */}
                <View style={styles.inputGroup}>
                  <View style={styles.catalogueHeader}>
                    <Text style={styles.inputLabel}>Catalogue Images</Text>
                    <Text style={styles.catalogueCount}>
                      {catalogueImages.length}/8
                    </Text>
                  </View>

                  <View style={styles.catalogueContainer}>
                    <FlatList
                      data={[...catalogueImages, 'add']}
                      numColumns={2}
                      scrollEnabled={false}
                      keyExtractor={(item, index) =>
                        typeof item === 'string' && item === 'add' ? 'add-button' : `image-${index}`
                      }
                      renderItem={({ item, index }) => {
                        if (item === 'add' && catalogueImages.length < 8) {
                          return (
                            <TouchableOpacity
                              style={styles.addImageButton}
                              onPress={pickCatalogueImage}
                            >
                              <Plus size={32} color="#F3B62B" />
                              <Text style={styles.addImageText}>Add Image</Text>
                            </TouchableOpacity>
                          );
                        } else if (item !== 'add') {
                          return (
                            <View style={styles.catalogueImageContainer}>
                              <Image
                                source={{ uri: item }}
                                style={styles.catalogueImage}
                                contentFit="cover"
                              />
                              <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => removeCatalogueImage(index)}
                              >
                                <X size={16} color="#ffffff" />
                              </TouchableOpacity>
                            </View>
                          );
                        }
                        return null;
                      }}
                      contentContainerStyle={styles.catalogueGrid}
                    />
                  </View>

                  <Text style={styles.catalogueInfo}>
                    Upload product images to showcase your inventory. Maximum 8 images allowed.
                  </Text>
                </View>
              </>
            )}


            {/* Upgrade to Seller button - larger version above Save Changes */}
            {user?.role === 'customer' && (
              <TouchableOpacity
                style={styles.largeUpgradeButton}
                onPress={handleUpgradeToSeller}
              >
                <LinearGradient
                  colors={["#F5D76E", "#F3B62B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.largeUpgradeButtonInner}
                >
                  <ArrowUpCircle size={20} color="#fff" style={styles.largeUpgradeIcon} />
                  <Text style={styles.largeUpgradeText}>Upgrade to Seller</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleSave}
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
                    <Text style={styles.buttonText}>Save Changes</Text>
                    <Save size={18} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {isSaved && (
              <View style={styles.savedMessage}>
                <CheckCircle size={18} color="#4CAF50" style={styles.savedIcon} />
                <Text style={styles.savedMessageText}>Profile updated successfully!</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView >
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
    fontSize: 14,
    color: "#666666",
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 16,
    fontSize: 14,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandCoverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  brandCameraButton: {
    position: "absolute",
    top: 8,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  brandNameOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  brandNameText: {
    color: "#F5D76E", // Golden color like "Sarth Jewels"
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Brush Script MT' : 'cursive', // Elegant script font
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 5,
    zIndex: 1, // Ensure profile image is above brand cover
    margin: "auto",
    // marginTop: -60, // Overlap with brand cover
  },
  profileImage: {
    borderWidth: 2,
    borderColor: "#ffffff",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#002810",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    fontWeight: "500",
  },
  sellerBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  sellerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F5D76E",
    marginTop: 8,
  },
  upgradeIcon: {
    marginRight: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F3B62B",
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
  inputGroup: {
    marginBottom: 16,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: "#333333",
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
    height: 75,
    color: "#333333",
    textAlignVertical: "top",
    paddingTop: 8,
  },
  largeUpgradeButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#F3B62B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  largeUpgradeButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  largeUpgradeIcon: {
    marginRight: 8,
  },
  largeUpgradeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
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
  savedMessage: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  savedIcon: {
    marginRight: 8,
  },
  savedMessageText: {
    color: "#4CAF50",
    fontWeight: "500",
  },



  // Referral Code Styles
  referralCodeContainer: {
    backgroundColor: "#E3F2FD",
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  referralCodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  referralCodeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  referralCodeContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  referralCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    letterSpacing: 1,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  generateButton: {
    flex: 1,
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  referralCodeInfo: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  // Social Inputs
  socialInputContainer: {
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
  socialIconContainer: {
    marginRight: 12,
  },
  socialInput: {
    flex: 1,
    height: 56,
    color: "#333333",
  },

  // Catalogue Images Styles
  catalogueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catalogueCount: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  catalogueContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  catalogueGrid: {
    gap: 12,
  },
  catalogueImageContainer: {
    position: "relative",
    width: "45%",
    aspectRatio: 4 / 3,
    margin: 8,
  },
  catalogueImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageButton: {
    width: "45%",
    aspectRatio: 4 / 3,
    borderWidth: 2,
    borderColor: "#F3B62B",
    borderStyle: "dashed",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E1",
    margin: 8,
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    color: "#F3B62B",
    fontWeight: "600",
  },
  catalogueInfo: {
    fontSize: 12,
    color: "#666666",
    marginTop: 8,
    lineHeight: 16,
  },

  top: {
    backgroundColor: "#002810",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 16,
    width: "90%",
    height: 150,
    color: "#ffffff",
    marginBottom: -60,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 20,
  },
  
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  brandName: {
    fontSize: 50,
    fontFamily: 'LavishlyYours-Regular',
    fontWeight: "bold",
    color: "#F3B62B",
    marginTop: -30,
  },
});