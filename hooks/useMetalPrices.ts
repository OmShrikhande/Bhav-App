import { useState, useEffect, useRef } from "react";
import axios from "axios"; // Import axios
import AsyncStorage from '@react-native-async-storage/async-storage';

// Error function to check if there's an error with the API
const Error = () => {
  // For now, just return false to indicate no error
  // In a real implementation, this would check for actual error conditions
  return false;
}

export const useMetalPrices = () => {
  const [prices, setPrices] = useState<{
    gold: { buy: String, sell: String, comex: string; inr: string; change: string; isUp: boolean; high: string; low: string; open: string; close: string } | null;

    spotGold: { spot: string; inr: string; change: string; isUp: boolean; high: string; low: string; open: string; close: string } | null;

    silver: { buy: String, sell: String, comex: string; inr: string; change: string; isUp: boolean; high: string; low: string; open: string; close: string } | null;
    lastUpdated: string | null;

    spotSilver: { comex: string; inr: string; change: string; isUp: boolean; high: string; low: string; open: string; close: string } | null;

    usdinr: { comex: string; inr: string; change: string; isUp: boolean; high: string; low: string; open: string; close: string } | null;
  }>
  ({
    gold: { buy: "Loading...", sell: "Loading...", comex: "Loading...", inr: "Loading...", change: "0", isUp: false, high: "Loading...", low: "Loading...", open: "Loading...", close: "Loading..." },

    spotGold: { spot: "Loading...", inr: "Loading...", change: "0", isUp: false, high: "Loading...", low: "Loading...", open: "Loading...", close: "Loading..." },

    silver: { buy: "Loading...", sell: "Loading...", comex: "Loading...", inr: "Loading...", change: "0", isUp: false, high: "Loading...", low: "Loading...", open: "Loading...", close: "Loading..." },

    spotSilver: { comex: "Loading...", inr: "Loading...", change: "0", isUp: false, high: "Loading...", low: "Loading...", open: "Loading...", close: "Loading..." },

    usdinr: { comex: "Loading...", inr: "Loading...", change: "0", isUp: false, high: "Loading...", low: "Loading...", open: "Loading...", close: "Loading..." },
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Base values for generating random fluctuations
  const baseValues = useRef({
    gold: 2345.67,
    usdinr: 83.45,
    spotGold: 2342.30,
    silver: 29.75,
    spotSilver: 29.60
  });

  // Function to fetch updated prices from the API
  const refreshPrices = async () => {
    // Check if user is logged out
    try {
      const logoutState = await AsyncStorage.getItem('logout-in-progress');
      if (logoutState === 'true') {
        console.log("User logged out, stopping price updates");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsUserLoggedIn(false);
        return;
      }
    } catch (error) {
      console.error("Error checking logout state:", error);
    }

    setLoading(true);

    try {
      // Generate random fluctuations for more realistic price movements
      const goldFluctuation = (Math.random() - 0.5) * 5; // Random change between -2.5 and 2.5
      const usdinrFluctuation = (Math.random() - 0.5) * 0.2; // Random change between -0.1 and 0.1
      const spotGoldFluctuation = (Math.random() - 0.5) * 4; // Random change between -2 and 2
      const silverFluctuation = (Math.random() - 0.5) * 0.3; // Random change between -0.15 and 0.15
      const spotSilverFluctuation = (Math.random() - 0.5) * 0.25; // Random change between -0.125 and 0.125
      
      // Update base values with fluctuations
      baseValues.current = {
        gold: baseValues.current.gold + goldFluctuation,
        usdinr: baseValues.current.usdinr + usdinrFluctuation,
        spotGold: baseValues.current.spotGold + spotGoldFluctuation,
        silver: baseValues.current.silver + silverFluctuation,
        spotSilver: baseValues.current.spotSilver + spotSilverFluctuation
      };
      
      // Generate mock data with the updated base values
      const mockData = [
        {
          symb: "GOLD",
          rate: baseValues.current.gold.toFixed(2),
          chg: goldFluctuation.toFixed(2),
          high: (baseValues.current.gold + 15).toFixed(2),
          low: (baseValues.current.gold - 15).toFixed(2),
          open: (baseValues.current.gold - goldFluctuation).toFixed(2),
          close: baseValues.current.gold.toFixed(2),
          buy: (baseValues.current.gold - 5).toFixed(2),
          sell: (baseValues.current.gold + 5).toFixed(2)
        },
        {
          symb: "USDINR",
          rate: baseValues.current.usdinr.toFixed(2),
          chg: usdinrFluctuation.toFixed(2),
          high: (baseValues.current.usdinr + 0.22).toFixed(2),
          low: (baseValues.current.usdinr - 0.24).toFixed(2),
          open: (baseValues.current.usdinr - usdinrFluctuation).toFixed(2),
          close: baseValues.current.usdinr.toFixed(2),
          buy: (baseValues.current.usdinr - 0.1).toFixed(2),
          sell: (baseValues.current.usdinr + 0.1).toFixed(2)
        },
        {
          symb: "SPOTGold",
          rate: baseValues.current.spotGold.toFixed(2),
          chg: spotGoldFluctuation.toFixed(2),
          high: (baseValues.current.spotGold + 12.9).toFixed(2),
          low: (baseValues.current.spotGold - 17.2).toFixed(2),
          open: (baseValues.current.spotGold - spotGoldFluctuation).toFixed(2),
          close: baseValues.current.spotGold.toFixed(2),
          buy: (baseValues.current.spotGold - 3.9).toFixed(2),
          sell: (baseValues.current.spotGold + 3.9).toFixed(2)
        },
        {
          symb: "SILVER",
          rate: baseValues.current.silver.toFixed(2),
          chg: silverFluctuation.toFixed(2),
          high: (baseValues.current.silver + 0.35).toFixed(2),
          low: (baseValues.current.silver - 0.35).toFixed(2),
          open: (baseValues.current.silver - silverFluctuation).toFixed(2),
          close: baseValues.current.silver.toFixed(2),
          buy: (baseValues.current.silver - 0.1).toFixed(2),
          sell: (baseValues.current.silver + 0.3).toFixed(2)
        },
        {
          symb: "SPOTSilver",
          rate: baseValues.current.spotSilver.toFixed(2),
          chg: spotSilverFluctuation.toFixed(2),
          high: (baseValues.current.spotSilver + 0.35).toFixed(2),
          low: (baseValues.current.spotSilver - 0.3).toFixed(2),
          open: (baseValues.current.spotSilver - spotSilverFluctuation).toFixed(2),
          close: baseValues.current.spotSilver.toFixed(2),
          buy: (baseValues.current.spotSilver - 0.05).toFixed(2),
          sell: (baseValues.current.spotSilver + 0.25).toFixed(2)
        }
      ];

      // Extract data for GOLD and SILVER
      const goldData = mockData.find((item) => item.symb === "GOLD");
      const usdinr = mockData.find((item) => item.symb === "USDINR");
      const SpotGoldData = mockData.find((item) => item.symb === "SPOTGold");
      const silverData = mockData.find((item) => item.symb === "SILVER");
      const spotSilverData = mockData.find((item) => item.symb === "SPOTSilver");

      // // Log the mock data for debugging
      // console.log("Mock data generated:", {
      //   gold: goldData,
      //   silver: silverData,
      //   spotGold: SpotGoldData,
      //   spotSilver: spotSilverData,
      //   usdinr: usdinr
      // });
      
      // Update state with fetched data
      setPrices({
        usdinr: {
          comex: usdinr?.rate || "Loading...",
          inr: usdinr?.buy || "Loading...", // Add INR property
          change: usdinr?.chg || "0",
          isUp: usdinr ? Number(usdinr.chg) > 0 : false,
          high: usdinr?.high || "Loading...", // Add high property
          low: usdinr?.low || "Loading...", // Add low property
          open: usdinr?.open || "Loading...", // Add open price
          close: usdinr?.close || "Loading...", // Add open price
        },
        gold: {
          buy: goldData?.buy || "Loading...",
          sell: goldData?.sell || "Loading...", 
          comex: goldData?.buy || "Loading...",
          inr: goldData?.buy || "Loading...", // Add INR property
          change: goldData?.chg || "0",
          isUp: goldData ? Number(goldData.chg) > 0 : false,
          high: goldData?.high || "Loading...", // Add high property
          low: goldData?.low || "Loading...", // Add low property
          open: goldData?.open || "Loading...", // Add open price
          close: goldData?.close || "Loading...", // Add open price
        },
        spotGold: {
          spot: SpotGoldData?.buy || "Loading...",
          inr: SpotGoldData?.buy || "Loading...", // Add INR property
          change: SpotGoldData?.chg || "0",
          isUp: SpotGoldData ? Number(SpotGoldData.chg) > 0 : false,
          high: SpotGoldData?.high || "Loading...", // Add high property
          low: SpotGoldData?.low || "Loading...", // Add low property
          open: SpotGoldData?.open || "Loading...", // Add open price
          close: SpotGoldData?.close || "Loading...", // Add open price
        },
        silver: {
          buy: silverData?.buy || "Loading...",
          sell: silverData?.sell || "Loading...", 
          comex: silverData?.buy || "Loading...",
          inr: silverData?.buy ||  "Loading...", // Add INR property
          change: silverData?.chg || "0",
          isUp: silverData ? Number(silverData.chg) > 0 : false,
          high: silverData?.high || "Loading...", // Add high property
          low: silverData?.low || "Loading...", // Add low property
          open: silverData?.open || "Loading...", // Add open price
          close: silverData?.close || "Loading...", // Add open price
        },
        spotSilver: {
          comex: spotSilverData?.buy || "Loading...",
          inr: spotSilverData?.buy ||  "Loading...", // Add INR property
          change: spotSilverData?.chg || "0",
          isUp: spotSilverData ? Number(spotSilverData.chg) > 0 : false,
          high: spotSilverData?.high || "Loading...", // Add high property
          low: spotSilverData?.low || "Loading...", // Add low property
          open: spotSilverData?.open || "Loading...", // Add open price
          close: spotSilverData?.close || "Loading...", // Add open price
        },
        lastUpdated: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
      });
    } catch (error) {
      console.error("Error fetching metal prices:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check login status and start/stop updates accordingly
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const logoutState = await AsyncStorage.getItem('logout-in-progress');
        setIsUserLoggedIn(logoutState !== 'true');
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsUserLoggedIn(true); // Default to true if we can't check
      }
    };

    checkLoginStatus();

    // Set up a listener for logout events
    const logoutListener = setInterval(async () => {
      try {
        const logoutState = await AsyncStorage.getItem('logout-in-progress');
        const newLoginState = logoutState !== 'true';
        
        // If login state changed from logged in to logged out
        if (isUserLoggedIn && !newLoginState) {
          console.log("User logged out, stopping price updates");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } 
        // If login state changed from logged out to logged in
        else if (!isUserLoggedIn && newLoginState) {
          console.log("User logged in, starting price updates");
          // Start updates if they're not already running
          if (!intervalRef.current) {
            refreshPrices();
            intervalRef.current = setInterval(refreshPrices, 2000);
          }
        }
        
        setIsUserLoggedIn(newLoginState);
      } catch (error) {
        console.error("Error in logout listener:", error);
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(logoutListener);
    };
  }, [isUserLoggedIn]);

  // Start/stop price updates based on login status
  useEffect(() => {
    // Only start updates if user is logged in
    if (isUserLoggedIn) {
      console.log("Starting price updates");
      // Initial fetch
      refreshPrices();
      
      // Set up interval for updates
      intervalRef.current = setInterval(() => {
        refreshPrices();
      }, 2000); // Update every 2 seconds
    } else {
      console.log("User not logged in, not starting price updates");
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        console.log("Cleaning up price update interval");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isUserLoggedIn]);

  return { prices, loading, refreshPrices, Error };
};