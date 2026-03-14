import { removeToken } from "@/utils/authStorage";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatsCard from "@/components/StatsCard";
import ActionItem from "@/components/ActionItem";
import { useGetProfileQuery } from "@/services/userApi";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { data } = useGetProfileQuery(undefined);

  const businessName = data?.vendor?.businessName;
  const ownerName = data?.vendor?.user?.name;

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
          title="View Orders"
          color="#ffedd5"
          onPress={() => router.push("/(tabs)/Orders")}
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
  header: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 14,
    alignItems: "center",
  },
  content: { padding: 16, paddingBottom: 100 },
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