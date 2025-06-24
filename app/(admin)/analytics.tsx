import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  BarChart2,
  TrendingUp,
  Users as UsersIcon,
  DollarSign,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Map,
  Menu
} from "lucide-react-native";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 32;

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState("This Month");
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);

  const timeRangeOptions = [
    "Today",
    "This Week",
    "This Month",
    "Last 3 Months",
    "This Year",
    "All Time"
  ];

  const openDrawer = () => {
    router.push("/drawer");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={openDrawer}
          style={{ padding: 8, marginLeft: 8 }}
        >
          <Menu size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.timeRangeContainer}>
            <TouchableOpacity
              style={styles.timeRangeButton}
              onPress={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
            >
              <Text style={styles.timeRangeText}>{timeRange}</Text>
              <ChevronDown size={16} color="#1976D2" />
            </TouchableOpacity>

            {showTimeRangeDropdown && (
              <View style={styles.timeRangeDropdown}>
                {timeRangeOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.timeRangeOption}
                    onPress={() => {
                      setTimeRange(option);
                      setShowTimeRangeDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.timeRangeOptionText,
                      option === timeRange && styles.timeRangeOptionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <LinearGradient
              colors={["#1976D2", "#64B5F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <UsersIcon size={24} color="#ffffff" />
              </View>
              <Text style={styles.statValue}>1,245</Text>
              <Text style={styles.statLabel}>Total Users</Text>
              <View style={styles.statTrend}>
                <ArrowUpRight size={16} color="#ffffff" />
                <Text style={styles.statTrendText}>+12%</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["#F3B62B", "#F5D76E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <DollarSign size={24} color="#ffffff" />
              </View>
              <Text style={styles.statValue}>₹ 4.2M</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
              <View style={styles.statTrend}>
                <ArrowUpRight size={16} color="#ffffff" />
                <Text style={styles.statTrendText}>+8%</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <BarChart2 size={20} color="#1976D2" />
              <Text style={styles.chartTitle}>User Growth</Text>
            </View>
            <TouchableOpacity style={styles.chartFilterButton}>
              <Text style={styles.chartFilterText}>Filter</Text>
              <ChevronDown size={16} color="#1976D2" />
            </TouchableOpacity>
          </View>

          {/* Mock chart - in a real app, use a charting library */}
          <View style={styles.mockChart}>
            <View style={styles.mockChartYAxis}>
              <Text style={styles.mockChartYAxisLabel}>1000</Text>
              <Text style={styles.mockChartYAxisLabel}>750</Text>
              <Text style={styles.mockChartYAxisLabel}>500</Text>
              <Text style={styles.mockChartYAxisLabel}>250</Text>
              <Text style={styles.mockChartYAxisLabel}>0</Text>
            </View>
            <View style={styles.mockChartContent}>
              <View style={styles.mockChartBars}>
                <View style={[styles.mockChartBar, { height: 120 }]}>
                  <LinearGradient
                    colors={["#1976D2", "#64B5F6"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 180 }]}>
                  <LinearGradient
                    colors={["#1976D2", "#64B5F6"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 150 }]}>
                  <LinearGradient
                    colors={["#1976D2", "#64B5F6"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 220 }]}>
                  <LinearGradient
                    colors={["#1976D2", "#64B5F6"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 200 }]}>
                  <LinearGradient
                    colors={["#1976D2", "#64B5F6"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 250 }]}>
                  <LinearGradient
                    colors={["#1976D2", "#64B5F6"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
              </View>
              <View style={styles.mockChartXAxis}>
                <Text style={styles.mockChartXAxisLabel}>Jan</Text>
                <Text style={styles.mockChartXAxisLabel}>Feb</Text>
                <Text style={styles.mockChartXAxisLabel}>Mar</Text>
                <Text style={styles.mockChartXAxisLabel}>Apr</Text>
                <Text style={styles.mockChartXAxisLabel}>May</Text>
                <Text style={styles.mockChartXAxisLabel}>Jun</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <TrendingUp size={20} color="#F3B62B" />
              <Text style={[styles.chartTitle, { color: "#F3B62B" }]}>Revenue Trends</Text>
            </View>
            <TouchableOpacity style={styles.chartFilterButton}>
              <Text style={styles.chartFilterText}>Filter</Text>
              <ChevronDown size={16} color="#1976D2" />
            </TouchableOpacity>
          </View>

          {/* Mock chart - in a real app, use a charting library */}
          <View style={styles.mockChart}>
            <View style={styles.mockChartYAxis}>
              <Text style={styles.mockChartYAxisLabel}>₹5M</Text>
              <Text style={styles.mockChartYAxisLabel}>₹4M</Text>
              <Text style={styles.mockChartYAxisLabel}>₹3M</Text>
              <Text style={styles.mockChartYAxisLabel}>₹2M</Text>
              <Text style={styles.mockChartYAxisLabel}>₹1M</Text>
            </View>
            <View style={styles.mockChartContent}>
              <View style={styles.mockChartBars}>
                <View style={[styles.mockChartBar, { height: 100 }]}>
                  <LinearGradient
                    colors={["#F3B62B", "#F5D76E"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 150 }]}>
                  <LinearGradient
                    colors={["#F3B62B", "#F5D76E"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 200 }]}>
                  <LinearGradient
                    colors={["#F3B62B", "#F5D76E"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 180 }]}>
                  <LinearGradient
                    colors={["#F3B62B", "#F5D76E"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 220 }]}>
                  <LinearGradient
                    colors={["#F3B62B", "#F5D76E"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
                <View style={[styles.mockChartBar, { height: 250 }]}>
                  <LinearGradient
                    colors={["#F3B62B", "#F5D76E"]}
                    style={styles.mockChartBarGradient}
                  />
                </View>
              </View>
              <View style={styles.mockChartXAxis}>
                <Text style={styles.mockChartXAxisLabel}>Jan</Text>
                <Text style={styles.mockChartXAxisLabel}>Feb</Text>
                <Text style={styles.mockChartXAxisLabel}>Mar</Text>
                <Text style={styles.mockChartXAxisLabel}>Apr</Text>
                <Text style={styles.mockChartXAxisLabel}>May</Text>
                <Text style={styles.mockChartXAxisLabel}>Jun</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.regionContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Map size={20} color="#43A047" />
              <Text style={[styles.chartTitle, { color: "#43A047" }]}>Regional Distribution</Text>
            </View>
          </View>

          <View style={styles.regionStats}>
            <View style={styles.regionStatItem}>
              <View style={styles.regionStatBar}>
                <LinearGradient
                  colors={["#43A047", "#81C784"]}
                  style={[styles.regionStatBarFill, { width: "80%" }]}
                />
              </View>
              <View style={styles.regionStatInfo}>
                <Text style={styles.regionStatName}>Maharashtra</Text>
                <Text style={styles.regionStatValue}>32%</Text>
              </View>
            </View>

            <View style={styles.regionStatItem}>
              <View style={styles.regionStatBar}>
                <LinearGradient
                  colors={["#43A047", "#81C784"]}
                  style={[styles.regionStatBarFill, { width: "65%" }]}
                />
              </View>
              <View style={styles.regionStatInfo}>
                <Text style={styles.regionStatName}>Delhi</Text>
                <Text style={styles.regionStatValue}>26%</Text>
              </View>
            </View>

            <View style={styles.regionStatItem}>
              <View style={styles.regionStatBar}>
                <LinearGradient
                  colors={["#43A047", "#81C784"]}
                  style={[styles.regionStatBarFill, { width: "50%" }]}
                />
              </View>
              <View style={styles.regionStatInfo}>
                <Text style={styles.regionStatName}>Karnataka</Text>
                <Text style={styles.regionStatValue}>20%</Text>
              </View>
            </View>

            <View style={styles.regionStatItem}>
              <View style={styles.regionStatBar}>
                <LinearGradient
                  colors={["#43A047", "#81C784"]}
                  style={[styles.regionStatBarFill, { width: "35%" }]}
                />
              </View>
              <View style={styles.regionStatInfo}>
                <Text style={styles.regionStatName}>Tamil Nadu</Text>
                <Text style={styles.regionStatValue}>14%</Text>
              </View>
            </View>

            <View style={styles.regionStatItem}>
              <View style={styles.regionStatBar}>
                <LinearGradient
                  colors={["#43A047", "#81C784"]}
                  style={[styles.regionStatBarFill, { width: "20%" }]}
                />
              </View>
              <View style={styles.regionStatInfo}>
                <Text style={styles.regionStatName}>Others</Text>
                <Text style={styles.regionStatValue}>8%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.exportContainer}>
          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportButtonText}>Export Report</Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
    marginLeft: -40,
  },
  timeRangeContainer: {
    position: "relative",
    left: 250,
  },
  timeRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timeRangeText: {
    fontSize: 14,
    color: "#1976D2",
    marginRight: 4,
  },
  timeRangeDropdown: {
    position: "absolute",
    top: 36,
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    width: 150,
  },
  timeRangeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  timeRangeOptionText: {
    fontSize: 14,
    color: "#333333",
  },
  timeRangeOptionTextSelected: {
    color: "#1976D2",
    fontWeight: "600",
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
  },
  statTrend: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statTrendText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 2,
  },
  chartContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginLeft: 8,
  },
  chartFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chartFilterText: {
    fontSize: 14,
    color: "#1976D2",
    marginRight: 4,
  },
  mockChart: {
    height: 300,
    flexDirection: "row",
  },
  mockChartYAxis: {
    width: 40,
    height: 280,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  mockChartYAxisLabel: {
    fontSize: 10,
    color: "#9e9e9e",
  },
  mockChartContent: {
    flex: 1,
  },
  mockChartBars: {
    height: 250,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingBottom: 10,
  },
  mockChartBar: {
    width: 30,
    borderRadius: 4,
    overflow: "hidden",
  },
  mockChartBarGradient: {
    flex: 1,
  },
  mockChartXAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
  },
  mockChartXAxisLabel: {
    fontSize: 10,
    color: "#9e9e9e",
  },
  regionContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  regionStats: {
    marginTop: 8,
  },
  regionStatItem: {
    marginBottom: 16,
  },
  regionStatBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  regionStatBarFill: {
    height: 8,
    borderRadius: 4,
  },
  regionStatInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  regionStatName: {
    fontSize: 14,
    color: "#333333",
  },
  regionStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#43A047",
  },
  exportContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  exportButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
});