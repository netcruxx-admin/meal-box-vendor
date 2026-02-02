import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
export default function BottomTab() {
  return (
    <View style={styles.bottomTab}>
      <Tab icon="home" label="Dashboard" active />
      <Tab icon="restaurant" label="Menu" />
      <Tab icon="cube" label="Orders" />
      <Tab icon="person" label="Profile" />
    </View>
  );
}

function Tab({ icon, label, active = false }: any) {
  return (
    <View style={styles.tabItem}>
      <Ionicons name={icon} size={22} color={active ? "#1d4ed8" : "#9ca3af"} />
      <Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  bottomTab: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  tabItem: { alignItems: "center" },
  tabLabel: { fontSize: 12, color: "#9ca3af" },
  tabActive: { color: "#1d4ed8", fontWeight: "600" },
});
