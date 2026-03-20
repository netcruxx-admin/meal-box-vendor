
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import MealCard from "@/components/MealCard";
import { useGetWeeklyMenuQuery, useSaveWeeklyMenuMutation } from "@/services/vendorMenuApi";
import Button from "@/components/Button";
import GoBack from "@/components/GoBack";
import Toast from "react-native-toast-message";
import AppText from "@/components/AppText";

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
    if (!menu) return;
    // Only send day keys — exclude MongoDB metadata (_id, vendor, __v, etc.)
    const menuToSave: Record<string, any> = {};
    DAYS.forEach((d) => {
      menuToSave[d.toLowerCase()] = menu[d.toLowerCase()];
    });
    try {
      await saveMenu(menuToSave).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Saved!',
        text2: 'Menu saved successfully.',
        visibilityTime: 2500,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Failed to save menu. Please try again.',
        visibilityTime: 3000,
      });
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <GoBack />
        <AppText weight='semiBold'>Weekly Menu</AppText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.dayTabs}
        persistentScrollbar={true}
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
      <View style={{marginTop: 20, gap: 4 }}>
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
    padding: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10
  },

  dayTabs: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 6,
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

  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
  }
});