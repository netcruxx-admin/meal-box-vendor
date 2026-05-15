import { removeToken } from "@/utils/authStorage";
import { useRouter } from "expo-router";
import { BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatsCard from "@/components/StatsCard";
import ActionItem from "@/components/ActionItem";
import { useGetProfileQuery } from "@/services/userApi";
import { useGetVendorOverviewQuery } from "@/services/subscriptionApi";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const router = useRouter();

  // Exit the app on Android back press instead of navigating to auth screens
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        BackHandler.exitApp();
        return true;
      });
      return () => sub.remove();
    }, [])
  );
  const { data } = useGetProfileQuery(undefined);
  const { data: overviewData, isLoading: overviewLoading } = useGetVendorOverviewQuery(undefined);

  const businessName = data?.vendor?.businessName;
  const ownerName = data?.vendor?.user?.name;
  const overview = overviewData?.overview;
  const fmt = (val: number | undefined) => overviewLoading ? "—" : (val ?? "—");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>
              {ownerName ? `Hi, ${ownerName} 👋` : 'Welcome back 👋'}
            </Text>
            <Text style={styles.title}>
              {businessName || 'Your Kitchen'}
            </Text>
          </View>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.push("/(tabs)/Profile")}>
            <Ionicons name="settings-outline" size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            title="Active Subscribers"
            value={String(fmt(overview?.activeSubscribers))}
            meta="Current active plans"
            variant="blue"
          />
          <StatsCard
            title="Pending Requests"
            value={String(fmt(overview?.pendingRequests))}
            meta="Awaiting your approval"
            variant="orange"
          />
          <StatsCard
            title="Avg Rating"
            value={String(fmt(overview?.avgRating))}
            meta={overview?.totalReviews ? `${overview.totalReviews} reviews` : "No reviews yet"}
            variant="purple"
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <ActionItem
          icon="restaurant-outline"
          title="Manage Menu"
          color="#dbeafe"
          onPress={() => router.push("/(tabs)/Menu")}
        />
        <ActionItem
          icon="cash-outline"
          title="Subscription Pricing"
          color="#dcfce7"
          onPress={() => router.push("/(tabs)/Plans")}
        />
        <ActionItem
          icon="cube-outline"
          title="Subscriptions"
          color="#ffedd5"
          onPress={() => router.push("/(tabs)/Subscriptions")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  content: {
    padding: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greeting: { fontSize: 13, color: "#64748B", marginBottom: 2 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  iconCircle: { backgroundColor: "#e5e7eb", borderRadius: 20, padding: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 16 },
});