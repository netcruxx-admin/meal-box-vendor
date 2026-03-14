import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

type MealCardProps = {
  title: string;
  items: string[];
  time: string;
  price: string;
  day: string;
};

export default function MealCard({
  title,
  items,
  time,
  price,
  day,
}: MealCardProps) {
  const router = useRouter();

  const isEmpty = !items || items.length === 0;

  const handleEdit = () =>
    router.push({
      pathname: '/(tabs)/Menu/editmeal',
      params: {
        meal: title.toLowerCase(),
        day: day.toLowerCase(),
      },
    });

  return (
    <View style={[styles.card, isEmpty && styles.cardEmpty]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        <TouchableOpacity style={styles.emptyBody} onPress={handleEdit}>
          <Ionicons name="add-circle-outline" size={28} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No items added</Text>
          <Text style={styles.emptySubtitle}>Tap Edit to set up this meal</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.cardBody}>
            {items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.dot} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.cardFooter}>
            {time ? (
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={13} color="#6B7280" />
                <Text style={styles.timeText}>{time}</Text>
              </View>
            ) : (
              <Text style={styles.noTimeText}>No delivery time set</Text>
            )}
            {!!price && <Text style={styles.priceText}>{price}</Text>}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  cardEmpty: {
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "500",
  },

  /* Empty state */
  emptyBody: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#CBD5E1",
  },

  /* Filled state */
  cardBody: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#6B7280",
  },
  itemText: {
    fontSize: 13,
    color: "#374151",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#6B7280",
  },
  noTimeText: {
    fontSize: 12,
    color: "#CBD5E1",
    fontStyle: "italic",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
});
