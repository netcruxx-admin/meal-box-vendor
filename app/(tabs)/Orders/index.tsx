import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Placeholder order type — replace with real API data when ready
type Order = {
  id: string;
  customerName: string;
  meal: string;
  status: "pending" | "preparing" | "delivered";
  date: string;
};

const STATUS_COLOR: Record<Order["status"], string> = {
  pending: "#F59E0B",
  preparing: "#3B82F6",
  delivered: "#10B981",
};

export default function OrdersScreen() {
  // Replace with useGetOrdersQuery() when the API is ready
  const orders: Order[] = [];

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Orders</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubText}>
            New customer orders will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.customerName}>{item.customerName}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: STATUS_COLOR[item.status] + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: STATUS_COLOR[item.status] },
                  ]}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.mealText}>{item.meal}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 16,
    color: "#111",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: "#CBD5E1",
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  mealText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
