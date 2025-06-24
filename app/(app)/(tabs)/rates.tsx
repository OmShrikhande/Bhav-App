import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { TrendingUp, TrendingDown, RefreshCw, ArrowUp, ArrowDown, Minus, Package, ShoppingBag, Lock, Plus, Check, Menu, Bell, PenSquare } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform, Dimensions } from "react-native";
import * as Font from "expo-font";
import { useAuth } from "@/context/auth-context";
import { firestoreService } from "@/services/firestore";
import { useAuthStore, InventoryItem, MAX_BUY_REQUESTS, User } from "@/store/auth-store";
import { images } from "@/constants/images";
import { router, useFocusEffect } from "expo-router";
import colors from "@/constants/colors";
import { useMetalPrices } from "@/hooks/useMetalPrices";

type TabType = 'all' | 'gold' | 'silver';

export default function RatesScreen() {
  const { user, firebaseAuth } = useAuth();
  const currentUser = firebaseAuth.user || user;
  
  const {
    getSellerReferralsForCustomer,
    getUserById,
    getInventoryItemsForSeller,
    setSelectedSeller,
    selectedSeller,
    getUserBuyRequestCount,
    hasReachedBuyRequestLimit,
    contactDealer,
    getAllInventoryItems,
    getNotificationsForUser,
    createBuyRequest,
  } = useAuthStore();
  
  // Add Firestore state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rates, setRates] = useState<any>(null);
  const [previousRates, setPreviousRates] = useState<any>(null);

  const [showSellerModal, setShowSellerModal] = useState(false);

  // Get sellers added by the customer via referral code
  const customerSellers = user
    ? getSellerReferralsForCustomer(user.id)
      .map(ref => getUserById(ref.sellerId))
      .filter(Boolean)
    : [];

  // Get inventory for the selected seller
  const selectedSellerInventory =
    selectedSeller && selectedSeller.id
      ? getInventoryItemsForSeller(selectedSeller.id).filter(item => item.isVisible)
      : [];

  const handleSelectSeller = (seller: User | null | undefined) => {
    if (selectedSeller?.id === seller?.id) {
      Alert.alert(
        "Seller Already Selected",
        "You have already selected this seller. Please select another seller.",
        [{ text: "OK" }]
      );
      return;
    }

    setSelectedSeller(seller ?? null);
    Alert.alert(
      "Seller Selected",
      `You have selected ${seller?.brandName || seller?.fullName || seller?.name}.`,
      [{ text: "OK" }]
    );
  };

  const openSellerSelection = () => {
    if (customerSellers.length === 0) {
      Alert.alert(
        "No Sellers Found",
        "You have not added any sellers yet. Please add sellers using their referral codes.",
        [{ text: "OK" }]
      );
      return;
    }

    const sellerOptions = customerSellers.map(seller => ({
      text: (seller as User)?.brandName || (seller as User)?.fullName || (seller as User)?.name,
      onPress: () => handleSelectSeller(seller as User),
    }));

    Alert.alert(
      "Select Seller",
      undefined,
      [...sellerOptions, { text: "Close", style: "destructive" }]
    );
  };

  const closeSellerSelection = () => setShowSellerModal(false);

  // Fetch rates from Firestore
  const fetchRates = async () => {
    setLoading(true);
    try {
      const latestRates = await firestoreService.getLatestRates();
      setRates(latestRates);
      
      // For demo purposes, we'll simulate previous rates
      // In a real app, you would fetch historical data
      if (latestRates) {
        const simulatedPreviousRates = {
          gold24k: Math.round(latestRates.gold24k * 0.99),
          gold22k: Math.round(latestRates.gold22k * 0.99),
          silver: Math.round(latestRates.silver * 0.98),
          timestamp: new Date(Date.now() - 86400000) // 24 hours ago
        };
        setPreviousRates(simulatedPreviousRates);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      Alert.alert('Error', 'Failed to load rates. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Calculate price change
  const calculateChange = (current: number, previous: number) => {
    if (!current || !previous) return { value: 0, percentage: 0, direction: 'none' };
    
    const change = current - previous;
    const percentage = (change / previous) * 100;
    
    return {
      value: Math.abs(change),
      percentage: Math.abs(percentage).toFixed(2),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'none'
    };
  };
  
  // Render change indicator
  const renderChangeIndicator = (direction: string) => {
    if (direction === 'up') {
      return <ArrowUp size={16} color="#E53935" />;
    } else if (direction === 'down') {
      return <ArrowDown size={16} color="#43A047" />;
    } else {
      return <Minus size={16} color="#757575" />;
    }
  };
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRates();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Legacy code for compatibility
  const {
    prices, Error, refreshPrices
  } = useMetalPrices();
  
  // Log prices for debugging
  useEffect(() => {
    console.log("Prices in rates.tsx:", prices);
  }, [prices]);

  // Store previous prices
  const prevGoldBuy = useRef<string | null>(null);
  const prevGoldSell = useRef<string | null>(null);
  const prevSilverBuy = useRef<string | null>(null);
  const prevSilverSell = useRef<string | null>(null);

  // Store color states
  const [goldBuyColor, setGoldBuyColor] = useState("#333333");
  const [goldSellColor, setGoldSellColor] = useState("#333333");
  const [silverBuyColor, setSilverBuyColor] = useState("#333333");
  const [silverSellColor, setSilverSellColor] = useState("#333333");

  // Timer refs to clear timeouts
  const goldBuyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goldSellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silverBuyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silverSellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get user's buy request count
  const buyRequestCount = user ? getUserBuyRequestCount(user.id) : 0;
  const hasReachedLimit = user ? hasReachedBuyRequestLimit(user.id) : false;

  const isPremiumUser = user?.isPremium || false;

  const isSeller = user?.role === "seller";
  const isCustomer = user?.role === "customer";
  const isAdmin = user?.role === "admin";
  // Use isLoading instead of loading to avoid duplicate declaration
  const [isLoading, setIsLoading] = useState(false);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isBuyLoading, setIsBuyLoading] = useState(false);

  const [addedSellers, setAddedSellers] = useState<User[]>([]);
  const [sellerProducts, setSellerProducts] = useState<{ [key: string]: InventoryItem[] }>({});

  const [activeTab, setActiveTab] = useState<TabType>("all");

  const editInventory = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    // Navigate to inventory management screen
    router.push("/(app)/inventory");
  };

  const addSeller = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    // Navigate to inventory management screen
    router.push("/(app)/seller-data");
  };

  // Navigate to seller profile
  const navigateToSellerProfile = (sellerId: string) => {
    router.push(`/seller-profile/${sellerId}`);
  };


  // Handle buy request
  const handleBuyRequest = async (itemId: string, sellerId: string) => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please login to send buy requests.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Login",
            onPress: () => router.push("/auth/login")
          }
        ]
      );
      return;
    }

    // Check if user has reached the buy limit and is not premium
    if (!isPremiumUser && hasReachedLimit) {
      // Redirect to premium upgrade page
      router.push("/auth/premium-subscription");
      return;
    }

    setIsBuyLoading(true);

    try {
      // Trigger haptic feedback
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Create buy request
      const result = await createBuyRequest(itemId, user.id, sellerId);

      if (result.success) {
        // Show success alert
        Alert.alert(
          "Buy Request Sent",
          "Your request has been sent to the seller. You will be notified when they respond.",
          [{ text: "OK" }]
        );
      } else {
        if (result.limitReached) {
          // Redirect to premium upgrade page
          Alert.alert(
            "Buy Limit Reached",
            "You have reached your free buy request limit. Would you like to upgrade to premium for unlimited requests?",
            [
              {
                text: "Not Now",
                style: "cancel"
              },
              {
                text: "Upgrade to Premium",
                onPress: () => router.push("/auth/premium-subscription")
              }
            ]
          );
        } else {
          Alert.alert("Error", result.error || "Failed to send buy request. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error sending buy request:", error);
      Alert.alert("Error", "Failed to send buy request. Please try again.");
    } finally {
      setIsBuyLoading(false);
    }
  };

  // const handleRefresh = async () => {
  //   await refreshPrices();
  //   if (Platform.OS !== "web") {
  //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   }
  // };
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts
  useEffect(() => {
    Font.loadAsync({
      'LavishlyYours-Regular': require('../../../assets/fonts/LavishlyYours-Regular.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);
  
  // Fetch rates from Firestore when component mounts
  useEffect(() => {
    fetchRates();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchInventory = async () => {
        setIsLoading(true);
        try {
          const items = useAuthStore.getState().getAllInventoryItems
            ? useAuthStore.getState().getAllInventoryItems()
            : [];
          setInventoryItems(items || []);
        } catch (error) {
          setInventoryItems([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInventory();
    }, [])
  );

  // referral
  useEffect(() => {
    if (user && (isCustomer || isAdmin)) {
      // Fetch seller referrals for this user
      const referrals = useAuthStore.getState().getSellerReferralsForCustomer(user.id);
      // Get seller details for each referral
      const sellers = referrals
        .map(ref => getUserById(ref.sellerId))
        .filter(Boolean) as User[];
      setAddedSellers(sellers);

      // Load products for each seller
      const productsMap: { [key: string]: InventoryItem[] } = {};
      sellers.forEach(seller => {
        productsMap[seller.id] = useAuthStore.getState()
          .getInventoryItemsForSeller(seller.id)
          .filter(item => item.isVisible);
      });
      setSellerProducts(productsMap);
    }
  }, [user, isCustomer, isAdmin, getUserById]);

  useEffect(() => {
    // Gold Buy Price
    if (prices.gold?.buy && prevGoldBuy.current !== null) {
      const currentPrice = Number(prices.gold.buy);
      const previousPrice = Number(prevGoldBuy.current);

      if (currentPrice > previousPrice) {
        setGoldBuyColor("#4CAF50"); // Green
        if (goldBuyTimer.current) clearTimeout(goldBuyTimer.current);
        goldBuyTimer.current = setTimeout(() => {
          setGoldBuyColor("#333333"); // Back to black
        }, 1000);
      } else if (currentPrice < previousPrice) {
        setGoldBuyColor("#F44336"); // Red
        if (goldBuyTimer.current) clearTimeout(goldBuyTimer.current);
        goldBuyTimer.current = setTimeout(() => {
          setGoldBuyColor("#333333"); // Back to black
        }, 1000);
      }
    }
    prevGoldBuy.current = typeof prices.gold?.buy === "string" ? prices.gold.buy : null;

    // Gold Sell Price
    if (prices.gold?.sell && prevGoldSell.current !== null) {
      const currentPrice = Number(prices.gold.sell);
      const previousPrice = Number(prevGoldSell.current);

      if (currentPrice > previousPrice) {
        setGoldSellColor("#4CAF50"); // Green
        if (goldSellTimer.current) clearTimeout(goldSellTimer.current);
        goldSellTimer.current = setTimeout(() => {
          setGoldSellColor("#333333"); // Back to black
        }, 1000);
      } else if (currentPrice < previousPrice) {
        setGoldSellColor("#F44336"); // Red
        if (goldSellTimer.current) clearTimeout(goldSellTimer.current);
        goldSellTimer.current = setTimeout(() => {
          setGoldSellColor("#333333"); // Back to black
        }, 1000);
      }
    }
    prevGoldSell.current = typeof prices.gold?.sell === "string" ? prices.gold.sell : null;

    // Silver Buy Price
    if (prices.silver?.buy && prevSilverBuy.current !== null) {
      const currentPrice = Number(prices.silver.buy);
      const previousPrice = Number(prevSilverBuy.current);

      if (currentPrice > previousPrice) {
        setSilverBuyColor("#4CAF50"); // Green
        if (silverBuyTimer.current) clearTimeout(silverBuyTimer.current);
        silverBuyTimer.current = setTimeout(() => {
          setSilverBuyColor("#333333"); // Back to black
        }, 1000);
      } else if (currentPrice < previousPrice) {
        setSilverBuyColor("#F44336"); // Red
        if (silverBuyTimer.current) clearTimeout(silverBuyTimer.current);
        silverBuyTimer.current = setTimeout(() => {
          setSilverBuyColor("#333333"); // Back to black
        }, 1000);
      }
    }
    prevSilverBuy.current = typeof prices.silver?.buy === "string" ? prices.silver.buy : null;

    // Silver Sell Price
    if (prices.silver?.sell && prevSilverSell.current !== null) {
      const currentPrice = Number(prices.silver.sell);
      const previousPrice = Number(prevSilverSell.current);

      if (currentPrice > previousPrice) {
        setSilverSellColor("#4CAF50"); // Green
        if (silverSellTimer.current) clearTimeout(silverSellTimer.current);
        silverSellTimer.current = setTimeout(() => {
          setSilverSellColor("#333333"); // Back to black
        }, 1000);
      } else if (currentPrice < previousPrice) {
        setSilverSellColor("#F44336"); // Red
        if (silverSellTimer.current) clearTimeout(silverSellTimer.current);
        silverSellTimer.current = setTimeout(() => {
          setSilverSellColor("#333333"); // Back to black
        }, 1000);
      }
    }
    prevSilverSell.current = typeof prices.silver?.sell === "string" ? prices.silver.sell : null;

    // Cleanup function
    return () => {
      if (goldBuyTimer.current) clearTimeout(goldBuyTimer.current);
      if (goldSellTimer.current) clearTimeout(goldSellTimer.current);
      if (silverBuyTimer.current) clearTimeout(silverBuyTimer.current);
      if (silverSellTimer.current) clearTimeout(silverSellTimer.current);
    };
  }, [prices.gold?.buy, prices.gold?.sell, prices.silver?.buy, prices.silver?.sell]);

  if (!fontsLoaded) return null;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  const openModal = (itemId: string) => {
    router.push({
      pathname: "/modal",
      params: { itemId }
    });
  };

  const openDrawer = () => {
    router.push("/drawer");
  };

  const openSellers = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    // Navigate to select sellers screen
    router.push("/sellers" as any);
  }

  // Update the goldBuy, goldSell, silverBuy, silverSell variables
  const goldBuy = prices.gold?.buy || "Loading";
  const goldSell = prices.gold?.sell || "Loading";
  const silverBuy = prices.silver?.buy || "Loading";
  const silverSell = prices.silver?.sell || "Loading";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.menuButton}
        >
          <Menu size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Live Rates</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            refreshPrices();
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            console.log("Manual refresh triggered");
          }}
          style={styles.refreshButton}
        >
          <RefreshCw size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Brand/logo section */}
        {isSeller && (
          <View style={styles.top}>
            {user?.brandImage ? (
              <Image
                source={{ uri: user.brandImage }}
                style={styles.brandCoverImage}
              />
            ) : user?.brandName ? (
              <Text style={styles.brandName}>{user.brandName}</Text>
            ) : (
              <Image
                source={images.bhavLogo}
                style={styles.logo}
              />
            )}
          </View>
        )}

        {(isCustomer || isAdmin) && (
          // <View style={styles.top}>
          //   {selectedSeller?.brandImage ? (
          //     <Image source={{ uri: selectedSeller.brandImage }} style={styles.brandCoverImage} />
          //   ) : selectedSeller?.brandName ? (
          //     <Text style={styles.brandName}>{selectedSeller.brandName}</Text>
          //   ) : (
          //     <Image source={images.bhavLogo} style={styles.logo} />
          //   )}
          // </View>
          <>
            {selectedSeller ? (
              <View style={styles.top}>
                {selectedSeller.brandImage ? (
                  <Image source={{ uri: selectedSeller.brandImage }} style={styles.brandCoverImage} />
                ) : selectedSeller.brandName ? (
                  <Text style={styles.brandName}>{selectedSeller.brandName}</Text>
                ) : (
                  <Image source={images.bhavLogo} style={styles.logo} />
                )}
              </View>
            ) : (
              <View style={styles.top}>
                <Image source={images.bhavLogo} style={styles.logo} />
              </View>
            )}
          </>
        )}


        {/* Top row */}
        <>
          <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 5 }}>
            {/* silver dollar */}
            <View style={[styles.card, { marginHorizontal: 5 }]}>
              <LinearGradient
                colors={["#FFF8E1", "#FFF3CD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View>
                  <Text style={styles.cardTitle}>Silver $</Text>
                </View>

                <Text style={styles.priceText}>
                  {prices.spotSilver?.comex || "Loading"}
                </Text>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>
                      {prices.spotSilver?.low || "Loading"}  |  {prices.spotSilver?.high || "Loading"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* USD/INR */}
            <View style={[styles.card, { marginHorizontal: 5 }]}>
              <LinearGradient
                colors={["#FFF8E1", "#FFF3CD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View>
                  <Text style={styles.cardTitle}>USD/INR</Text>
                </View>

                <Text style={styles.priceText}>
                  {prices.usdinr?.comex || "Loading"}
                </Text>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>
                      {prices.usdinr?.low || "Loading"}  |  {prices.usdinr?.high || "Loading"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* gold dollar */}
            <View style={[styles.card, { marginHorizontal: 5 }]}>
              <LinearGradient
                colors={["#FFF8E1", "#FFF3CD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View>
                  <Text style={styles.cardTitle}>Gold $</Text>
                </View>

                <Text style={styles.priceText}>
                  {prices.spotGold?.spot || "Loading"}
                </Text>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>
                      {prices.spotGold?.low || "Loading"}  |  {prices.spotGold?.high || "Loading"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </>


        {/* Bottom row */}
        <>
          <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 5, }}>
            {/* gold MCX */}
            <View style={[styles.card, { marginHorizontal: 5, width: "50%" }]}>
              <LinearGradient
                colors={["#FFF8E1", "#FFF3CD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View>
                  <Text style={styles.cardTitle}>Gold MCX</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%" }}>
                  <Text style={[styles.priceText, { color: goldBuyColor }]}>
                    {goldBuy}
                  </Text>
                  <Text style={[styles.priceText, { color: goldSellColor }]}>
                    {goldSell}
                  </Text>
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>
                      {prices.gold?.low || "Loading"}  |  {prices.gold?.high || "Loading"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Silver MCX */}
            <View style={[styles.card, { marginHorizontal: 2, width: "50%" }]}>
              <LinearGradient
                colors={["#FFF8E1", "#FFF3CD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View>
                  <Text style={styles.cardTitle}>Silver MCX</Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%" }}>
                  <Text style={[styles.priceText, { color: silverBuyColor }]}>
                    {silverBuy}
                  </Text>
                  <Text style={[styles.priceText, { color: silverSellColor }]}>
                    {silverSell}
                  </Text>
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailValue}>
                      {prices.silver?.low || "Loading"}  |  {prices.silver?.high || "Loading"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </>

        <View style={styles.horizontalRow} />


        {/* For Sellers - Show their own inventory */}
        {isSeller && (
          <>
            {/* manage inventory seller */}

            <View style={styles.alertsHeader}>
              <Text style={styles.sectionTitle}>Manage Inventory</Text>
              <TouchableOpacity onPress={editInventory}>
                <PenSquare size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <View>
              {/* <View style={styles.sellerHeader}>
                <Text style={styles.sellerName}>
                  {user?.brandName || user?.fullName || user?.name}
                </Text>
                {user?.sellerVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View> */}

              <View style={{ marginTop: 5 }}>
                {/* <Text style={styles.productsTitle}>Your Products:</Text> */}
                {inventoryItems.length > 0 ? (
                  inventoryItems
                    .filter(item => item.sellerId === user?.id && item.isVisible)
                    .map(item => (
                      <TouchableOpacity onPress={() => openModal(item.id)} key={item.id}>
                        <View key={item.id} style={styles.inventoryCard}>
                          <View style={styles.inventoryCardHeader}>
                            <Text style={styles.inventoryProductName}>
                              {item.productName}
                            </Text>
                            <View style={styles.ratesContainer}>
                              {/* Only show buy price if buyPremium > 0 */}
                              {item.buyPremium !== 0 && (
                                <View style={styles.buysell}>
                                  <Text style={[styles.detailBuyInventory, {
                                    color: item.productType === "Gold" ? goldBuyColor : silverBuyColor,
                                  }]}>
                                    {item.productType === "Gold"
                                      ? Number(goldBuy) + item.buyPremium
                                      : item.productType === "Silver"
                                        ? Number(silverBuy) + item.buyPremium
                                        : "Loading"}
                                  </Text>
                                  <Text style={[styles.buy, {
                                    color: "#333333"
                                  }]}>
                                    Buy ₹{item.buyPremium > 0 ? '+' : ''}{item.buyPremium.toLocaleString()}
                                  </Text>
                                </View>
                              )}

                              {/* Only show sell price if sellPremium is not 0 */}
                              {item.sellPremium !== 0 && (
                                <View style={styles.buysell}>
                                  <Text style={[styles.detailSellInventory, {
                                    color: item.productType === "Gold" ? goldSellColor : silverSellColor
                                  }]}>
                                    {item.productType === "Gold"
                                      ? Number(goldSell) + item.sellPremium
                                      : item.productType === "Silver"
                                        ? Number(silverSell) + item.sellPremium
                                        : "Loading"}
                                  </Text>
                                  <Text style={[styles.sell, {
                                    color: "#333333"
                                  }]}>
                                    Sell ₹{item.sellPremium > 0 ? '+' : ''}{item.sellPremium.toLocaleString()}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                ) : (
                  <Text style={styles.noProductsText}>
                    No products in your inventory
                  </Text>
                )}
              </View>

              {/* Edit Inventory Button */}
              {/* <TouchableOpacity
                style={styles.editButton}
                onPress={editInventory}
              >
                <PenBoxIcon size={20} color="#ffffff" />
                <Text style={styles.editButtonText}>Edit Inventory</Text>
              </TouchableOpacity> */}
            </View>
          </>
        )}



        {/* Live Inventory Section */}
        {(isCustomer || isAdmin) && (
          <>
            <View style={styles.alertsHeader}>
              <Text style={styles.sectionTitle}>Live Inventory</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: 150 }}>
                <Text style={styles.selectSeller} onPress={openSellerSelection}>
                  {selectedSeller ? "Change Seller" : "Select Seller"}
                </Text>

                <TouchableOpacity onPress={addSeller} style={{ marginHorizontal: 2 }}>
                  <Plus size={24} color="#333333" />
                </TouchableOpacity>
              </View>
            </View>

            {selectedSeller ? (
              <View>
                {selectedSellerInventory.length > 0 ? (
                  selectedSellerInventory.map(item => (
                    <TouchableOpacity onPress={() => openModal(item.id)} key={item.id}>
                      <View style={styles.inventoryCard}>
                        <View style={styles.inventoryCardHeader}>
                          <Text style={styles.inventoryProductName}>{item.productName}</Text>
                          <View style={styles.ratesContainer}>
                            {item.buyPremium !== 0 && (
                              <View style={styles.buysell}>
                                <Text style={[styles.detailBuyInventory, { color: item.productType === "Gold" ? goldBuyColor : silverBuyColor }]}>
                                  {item.productType === "Gold"
                                    ? Number(goldBuy) + item.buyPremium
                                    : Number(silverBuy) + item.buyPremium}
                                </Text>
                                <Text style={styles.buy}>Buy ₹{item.buyPremium.toLocaleString()}</Text>
                              </View>
                            )}
                            {item.sellPremium !== 0 && (
                              <View style={styles.buysell}>
                                <Text style={[styles.detailSellInventory, { color: item.productType === "Gold" ? goldSellColor : silverSellColor }]}>
                                  {item.productType === "Gold"
                                    ? Number(goldSell) + item.sellPremium
                                    : Number(silverSell) + item.sellPremium}
                                </Text>
                                <Text style={styles.sell}>Sell ₹{item.sellPremium.toLocaleString()}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noProductsText}>No products available</Text>
                )}
              </View>
            ) : (
              <View style={{ alignItems: "center", marginVertical: 24, marginHorizontal: 16 }}>
                <Text style={{ color: "#999", fontStyle: "italic" }}>Select a seller to view their inventory.</Text>
              </View>
            )}

            {/* Seller Selection Modal */}
            {showSellerModal && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Select Seller</Text>
                  {customerSellers.length === 0 ? (
                    <Text style={{ color: "#999", fontStyle: "italic" }}>No sellers added yet.</Text>
                  ) : (
                    customerSellers.map(seller => (
                      seller ? (
                        <TouchableOpacity key={(seller as User)?.id} onPress={() => handleSelectSeller(seller as User)}>
                          <View style={styles.sellerItem}>
                            <Text style={styles.sellerName}>{(seller as User).brandName || (seller as User).fullName || (seller as User).name}</Text>
                          </View>
                        </TouchableOpacity>
                      ) : null
                    ))
                  )}
                  <TouchableOpacity onPress={closeSellerSelection}>
                    <Text style={styles.closeButton}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createBuyRequest(itemId: string, id: string, sellerId: string): { success: boolean; limitReached?: boolean; error?: string } {
  // TODO: Implement actual buy request logic here.
  // This is a mock implementation for demonstration.
  // Replace with real API call or logic as needed.
  return {
    success: true,
    limitReached: false,
    error: undefined,
  };
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  top: {
    backgroundColor: "#002810",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 16,
    height: 150,
    color: "#ffffff",
  },
  brandName: {
    fontSize: 50,
    fontWeight: "500",
    color: "#F3B62B",
    fontFamily: 'LavishlyYours-Regular',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 100,
    display: "flex",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginVertical: 5,
    marginHorizontal: 5,
  },
  selectSeller: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
    borderWidth: 1.3,
    borderColor: "#1976D2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  card: {
    borderRadius: 16,
    marginBottom: 5,
    overflow: "hidden",
    elevation: 2,
    width: "31.5%",
  },
  cardGradient: {
    paddingVertical: 10,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "light",
    color: "#333333",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginVertical: 5,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    alignItems: "center",
  },
  detailValue: {
    fontSize: 10,
    fontWeight: "400",
    color: "#444444",
    marginHorizontal: -10
  },

  // faqs
  alertsContainer: {
    marginTop: 10,
  },
  alertsGradient: {
    borderRadius: 16,
    padding: 16,
    height: 80,
  },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
    alignItems: "center",
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 8,
  },
  alertsList: {
    gap: 8,
  },
  alertItem: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  alertItemText: {
    fontSize: 14,
    color: "#333333",
  },
  horizontalRow: {
    height: 1, // Thickness of the row
    backgroundColor: "#E0E0E0", // Color of the row
    marginVertical: 5, // Space above and below the row
  },

  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 20,
  },

  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  premiumSectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  premiumSectionIcon: {
    marginRight: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: "#F3B62B",
    fontWeight: "500",
  },

  // inventory
  // Inventory Items Styles
  inventoryContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  inventoryCard: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    backgroundColor: "#eeeeee",
  },
  inventoryCardHeader: {
    padding: 16,
    paddingVertical: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inventoryProductName: {
    fontSize: 14,
    textAlign: "left",
    fontWeight: "400",
    color: "#333333",
  },
  inventoryDetailsContainer: {
    // paddingHorizontal: 12,
  },
  inventoryDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  inventoryDetailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  inventoryDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  inventoryCardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    paddingTop: 0,
  },
  buyButton: {
    backgroundColor: "#F3B62B",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buyButtonDisabled: {
    backgroundColor: "#E53935",
  },
  buyButtonIcon: {
    marginRight: 4,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },


  contactSellerButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  contactSellerButtonText: {
    fontSize: 14,
    paddingHorizontal: 16,
    fontWeight: "500",
    color: "#ffffff",
  },

  // Buy Limit Indicator Styles
  buyLimitIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(25, 118, 210, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  buyLimitIndicatorText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  // seller section
  sellerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sellerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  verifiedBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  verifiedText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  codeLabel: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  codeValue: {
    fontWeight: "500",
    color: "#333333",
  },
  locationText: {
    fontSize: 14,
    color: "#333333",
    marginTop: 5,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginTop: 12,
    marginBottom: 8,
  },
  productCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
  },
  productImagePlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    textAlign: "center",
  },
  premiumContainer: {
    marginTop: 4,
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    // color: "#F3B62B",
    textAlign: "center",
  },
  noProductsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },

  ratesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "55%",
  },
  // detailValueInventory: {
  //   fontSize: 16,
  //   fontWeight: "500",
  //   alignItems: "flex-end",
  //   justifyContent: "flex-end",
  // },
  detailBuyInventory: {
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 10,
  },
  detailSellInventory: {
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  // detailValueInventory: {
  //   fontSize: 20,
  //   fontWeight: "bold",
  //   color: "#F44336",
  // },
  sell: {
    fontSize: 10,
    color: "333333"
  },
  buy: {
    fontSize: 10,
    color: "333333",
  },
  buysell: {
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#1976D2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },



  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuButton: {
    // padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginLeft: -20, // Adjust this value to center the title
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },

  brandCoverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },


  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(500px)",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 400,
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  sellerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    marginTop: 16,
    color: "#1976D2",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  
  // Firestore rates styles
  firestoreRatesContainer: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  firestoreRatesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  firestoreRateCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  firestoreRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  firestoreRateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  firestoreRateBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  firestoreRateBadgeText: {
    fontSize: 10,
    color: '#666',
  },
  firestoreRateValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 6,
  },
  firestoreRateChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  firestoreChangeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  firestoreIncreaseText: {
    color: '#E53935',
  },
  firestoreDecreaseText: {
    color: '#43A047',
  },
  firestoreNoChangeText: {
    color: '#757575',
  },
});


