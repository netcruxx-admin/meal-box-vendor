import { useRouter } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function MealCard({
  title,
  items,
  time,
  price,
}: {
  title: string;
  items: string[];
  time: string;
  price: string;
}) {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity
          onPress={router.push("/(tabs)/Menu/subscriptionPlans")}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        {items.map((item, i) => (
          <Text key={i} style={styles.itemText}>
            {item}
          </Text>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.timeText}>Delivery: {time}</Text>
        <Text style={styles.priceText}>{price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  editText: {
    fontSize: 13,
    color: "#2563eb",
  },

  cardBody: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 6,
    gap: 4,
  },

  itemText: {
    fontSize: 13,
    color: "#111827",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  timeText: {
    fontSize: 12,
    color: "#374151",
  },

  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "red",
  },
});
