// import AppText from "@/components/AppText";
// import GoBack from "@/components/GoBack";
// import { Ionicons } from "@expo/vector-icons";
// import { StyleSheet, TouchableOpacity, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function WeeklyScreen() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <View>
//         <TouchableOpacity
//           style={{
//             padding: 10,
//             backgroundColor: "white",
//             borderRadius: 50,
//             alignSelf: "flex-start",
//           }}
//         >
//           <Ionicons name="arrow-back-outline" size={25} style={{}} />
//         </TouchableOpacity>

//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "red",
//     flex: 1,
//     borderWidth: 2,
//     borderColor: 'blue',
//     padding: 0,
//     justifyContent: 'flex-start'
//   },
//   text: {
//     fontSize: 20,
//     fontWeight: "600",
//   },
// });
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MealCard from "@/components/MealCard";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MEAL_CARDS = [
  {
    id: "breakfast",
    title: "Breakfast",
    items: ["Aloo Paratha (2 pcs)", "Curd (1 bowl)", "Pickle"],
    deliveryTime: "8:00 AM - 9:00 AM",
    price: "40",
  },
  {
    id: "lunch",
    title: "Lunch",
    items: ["Roti (3 pcs)", "Dal Makhani", "Mix Veg", "Rice (1 bowl)"],
    deliveryTime: "12:00 PM - 1:00 PM",
    price: "60",
  },
  {
    id: "dinner",
    title: "Dinner",
    items: ["Roti (4 pcs)", "Rajma", "Salad", "Rice (1 bowl)"],
    deliveryTime: "7:00 PM - 8:00 PM",
    price: "60",
  },

  // Tuesday: [],
  // Wednesday: [],
  // Thursday: [],
];
export default function WeeklyScreen() {
  const [activeDay, setActiveDay] = useState("Monday");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Weekly Menu</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayTabs}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => setActiveDay(day)}
            style={[styles.dayChip, activeDay === day && styles.dayChipActive]}
          >
            <Text
              style={[
                styles.dayChipText,
                activeDay === day && styles.dayChipTextActive,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {MEAL_CARDS.map((e, i) => {
          return (
            <MealCard
              key={i}
              title={e.title}
              time={e.deliveryTime}
              price={e.price}
              items={e.items}
            />
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },

  addDayBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },

  addDayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },

  dayTabs: {
    paddingHorizontal: 16,
    gap: 10,
  },

  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },

  dayChipActive: {
    backgroundColor: "#1d4ed8",
  },

  dayChipText: {
    fontSize: 13,
    color: "#111827",
  },

  dayChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  content: {
    padding: 16,
    gap: 16,
  },

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
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
  },

  saveBtn: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
