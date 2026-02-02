import { View, Text } from "react-native";
import { StyleSheet } from "react-native";

export default function StatsCard({ title, value, meta, variant }: any) {
  return (
    <View style={[styles.statCard, styles[`${variant}Card`]]}>
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text
        style={variant === "purple" ? styles.statMuted : styles.statPositive}
      >
        {meta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: { width: "48%", borderRadius: 16, padding: 14 },
  blueCard: { backgroundColor: "#eff6ff" },
  greenCard: { backgroundColor: "#ecfdf5" },
  orangeCard: { backgroundColor: "#fff7ed" },
  purpleCard: { backgroundColor: "#faf5ff" },
  statLabel: { fontSize: 13, color: "#334155" },
  statValue: { fontSize: 26, fontWeight: "700", marginVertical: 6 },
  statPositive: { color: "#16a34a", fontSize: 12 },
  statMuted: { color: "#475569", fontSize: 12 },
});
