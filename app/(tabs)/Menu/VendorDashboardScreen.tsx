import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import StatsCard from "./components/StatsCard";
import ActionItem from "./components/ActionItem";
import BottomTab from "./components/BottomTab";

export default function VendorDashboardScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>V2. Vendor Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subTitle}>Sharma's Kitchen</Text>
          </View>
          <View style={styles.iconCircle}>
            <Ionicons name="settings-outline" size={18} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            title="Active Subscribers"
            value="156"
            meta="↑ 12% this week"
            variant="blue"
          />
          <StatsCard
            title="Today's Orders"
            value="89"
            meta="↑ 5 from yesterday"
            variant="green"
          />
          <StatsCard
            title="Revenue (Week)"
            value="₹45K"
            meta="↑ 8% growth"
            variant="orange"
          />
          <StatsCard
            title="Avg Rating"
            value="4.5"
            meta="250+ reviews"
            variant="purple"
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <ActionItem
          icon="restaurant-outline"
          title="Manage Menu"
          color="#dbeafe"
        />
        <ActionItem
          icon="cash-outline"
          title="Subscription Pricing"
          color="#dcfce7"
        />
        <ActionItem icon="cube-outline" title="View Orders" color="#ffedd5" />
        <ActionItem
          icon="bar-chart-outline"
          title="Analytics"
          color="#f3e8ff"
        />
      </ScrollView>

      <BottomTab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 14,
    alignItems: "center",
  },
  headerText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  content: { padding: 16, paddingBottom: 100 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "700" },
  subTitle: { fontSize: 14, color: "#475569" },
  iconCircle: { backgroundColor: "#e5e7eb", borderRadius: 20, padding: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 16 },
});
