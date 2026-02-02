
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
import { useGetWeeklyMenuQuery, useSaveWeeklyMenuMutation } from "@/services/vendorMenuApi";
import Button from "@/components/Button";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

export default function WeeklyScreen() {
  const [activeDay, setActiveDay] = useState("Monday");

  const { data, isLoading } = useGetWeeklyMenuQuery(undefined);
  const [saveMenu] = useSaveWeeklyMenuMutation();

  const menu = data?.menu;
  const dayKey = activeDay.toLowerCase();
  const dayMenu = menu?.[dayKey];

  const handleSave = async () => {
    await saveMenu(menu).unwrap();
    alert('Menu saved');
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

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
            >{day}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meals */}
      <View>
        {MEALS.map((meal) => {
          const mealData = dayMenu?.[meal];
          return (
            <MealCard
              key={meal}
              title={meal.toUpperCase()}
              items={mealData?.items || []}
              time={
                mealData?.deliveryTime
                  ? `${mealData.deliveryTime.start} - ${mealData.deliveryTime.end}`
                  : ''
              }
              price=""
              day={activeDay}
            />
          );
        })}
      </View>


      <View style={styles.footer}>
        <Button
          title="Save Changes"
          variant="fill"
          fullWidth
          onPress={handleSave}
        />
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
