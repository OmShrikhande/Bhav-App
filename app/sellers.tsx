import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore, User } from "@/store/auth-store";
import { Search, Filter, Star, ArrowLeft } from "lucide-react-native";
import { DealerCard } from "@/components/DealerCard";
import * as Haptics from "expo-haptics";

export default async function SellersScreen() {
  const router = useRouter();
  const { user, getSellerReferralsForCustomer, getUserById, setSelectedSeller } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const customerSellers = user
    ? getSellerReferralsForCustomer(user.id)
      .map(ref => getUserById(ref.sellerId))
      .filter(Boolean)
    : [];

  // Get all sellers from users array
  const allSellers = customerSellers; //users.filter(u => u.role === "seller" && u.sellerVerified);

  // Get unique cities and states for filters
  const cities = [...new Set((await Promise.all(allSellers.map(async (seller) => seller?.city))).filter(Boolean))];
  const states = [...new Set((await Promise.all(allSellers.map(async (seller) => seller?.state))).filter(Boolean))];

  // Filter sellers based on search query and selected filters
  const filteredSellers = allSellers.filter(async seller => {
    const matchesSearch =
      searchQuery === "" ||
      (seller?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (seller?.brandName && (seller?.brandName ?? "").toLowerCase().includes(searchQuery.toLowerCase())) ||
      (seller?.city && seller?.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (seller?.state && seller?.state.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCity = selectedCity === "" || seller?.city === selectedCity;
    const matchesState = selectedState === "" || seller?.state === selectedState;

    return matchesSearch && matchesCity && matchesState;
  });

  // Get default sellers (2-3) if no filters are applied
  const defaultSellers = selectedCity === "" && selectedState === "" && searchQuery === ""
    ? allSellers.slice(0, 3)
    : filteredSellers;

  // Handle contact dealer
  const handleContactDealer = async (dealerId: string) => {
    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Contact dealer - this will add the dealer to contactedDealers array
    //contactDealer(dealerId);

    // Get dealer info
    const dealer = await Promise.all(allSellers).then(sellers => sellers.find(u => u && u.id === dealerId));

    // Show success alert with dealer contact info
    Alert.alert(
      "Contact Request Sent",
      `You can now see the dealer's contact information. The dealer has been notified and may contact you soon.`,
      [{ text: "OK" }]
    );
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Reset filters
  const resetFilters = () => {
    setSelectedCity("");
    setSelectedState("");
    setSearchQuery("");
  };

  // Handle city selection with type safety
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
  };

  // Handle state selection with type safety
  const handleStateSelect = (state: string) => {
    setSelectedState(state);
  };

  const handleSelectSeller = (seller: User | undefined) => {
    setSelectedSeller(seller ?? null);
    router.push("/(app)/(tabs)/rates");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sellers</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#333333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9e9e9e" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dealers by name or location"
            placeholderTextColor="#9e9e9e"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filter Sellers</Text>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>City:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptionsContainer}
            >
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedCity === "" && styles.filterOptionSelected
                ]}
                onPress={() => handleCitySelect("")}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedCity === "" && styles.filterOptionTextSelected
                ]}>All</Text>
              </TouchableOpacity>

              {cities.map((city, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterOption,
                    selectedCity === (city) && styles.filterOptionSelected
                  ]}
                  onPress={() => city && handleCitySelect(city)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedCity === city && styles.filterOptionTextSelected
                  ]}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>State:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptionsContainer}
            >
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedState === "" && styles.filterOptionSelected
                ]}
                onPress={() => handleStateSelect("")}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedState === "" && styles.filterOptionTextSelected
                ]}>All</Text>
              </TouchableOpacity>

              {states.map((state, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterOption,
                    selectedState === state && styles.filterOptionSelected
                  ]}
                  onPress={() => state && handleStateSelect(state)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedState === state && styles.filterOptionTextSelected
                  ]}>{state}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F3B62B" />
            <Text style={styles.loadingText}>Loading sellers...</Text>
          </View>
        ) : defaultSellers.length > 0 ? (
          <View style={styles.dealersContainer}>
            {defaultSellers.filter((seller): seller is User => !!seller).map((seller) => (
              <DealerCard
                key={seller.id}
                dealer={{
                  ...seller,
                  name: seller.name ?? "",
                }}
                onContact={() => handleSelectSeller(seller)}
                isContacted={false}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No sellers found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or search query
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsContainer}>
          <LinearGradient
            colors={["#FFF8E1", "#FFF3CD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipsGradient}
          >
            <View style={styles.tipsHeader}>
              <Star size={20} color="#F3B62B" />
              <Text style={styles.tipsTitle}>Sellers Tips</Text>
            </View>
            <Text style={styles.tipsContent}>
              Contact sellers to get the latest rates and special offers. Dealers can provide you with personalized quotes based on your requirements.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#333333",
  },
  filtersContainer: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 8,
  },
  filterOptionsContainer: {
    paddingBottom: 8,
  },
  filterOption: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterOptionSelected: {
    backgroundColor: "#FFF8E1",
    borderColor: "#F3B62B",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#666666",
  },
  filterOptionTextSelected: {
    color: "#F3B62B",
    fontWeight: "500",
  },
  resetButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    fontSize: 14,
    color: "#F3B62B",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  dealersContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
  },
  tipsContainer: {
    marginHorizontal: 20,
    // marginTop: 24,
    marginBottom: 30,
    borderRadius: 16,
    overflow: "hidden",
  },
  tipsGradient: {
    borderRadius: 16,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 8,
  },
  tipsContent: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 22,
  },

  backButton: {
    padding: 8,
  },
});