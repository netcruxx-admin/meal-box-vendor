import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetWeeklyMenuQuery, vendorMenuApi } from "@/services/vendorMenuApi";
import { AppDispatch } from "@/store";

type MealType = 'breakfast' | 'lunch' | 'dinner';

const EditBreakfast = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { meal, day } = useLocalSearchParams<{
    meal: MealType;
    day: string;
  }>();
  const { data } = useGetWeeklyMenuQuery(undefined);

  const mealData = data?.menu?.[day]?.[meal];
  const [mealName, setMealName] = useState('');
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (mealData) {
      setMealName(mealData.mealName || '');
      setMenuItems(mealData.items || []);
      setStartTime(mealData.deliveryTime?.start || '');
      setEndTime(mealData.deliveryTime?.end || '');
      setDescription(mealData.description || '');
    }
  }, [mealData]);

  /* ---------- Menu items handlers ---------- */
  const addItem = () => {
    setMenuItems((prev) => [...prev, '']);
  };

  const removeItem = (index: number) => {
    setMenuItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    setMenuItems((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSave = () => {
    dispatch(
      vendorMenuApi.util.updateQueryData(
        'getWeeklyMenu',
        undefined,
        (draft: any) => {
          // 🔥 If no menu exists yet, create structure
          if (!draft.menu) {
            draft.menu = {};
          }
  
          if (!draft.menu[day]) {
            draft.menu[day] = {};
          }
  
          draft.menu[day][meal] = {
            mealName,
            items: menuItems.filter(Boolean),
            deliveryTime: {
              start: startTime,
              end: endTime,
            },
            description,
          };
        }
      )
    );
  
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>
            Edit {meal?.charAt(0).toUpperCase() + meal?.slice(1)}
          </Text>
          <Text style={styles.subTitle}>
            {day?.charAt(0).toUpperCase() + day?.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.label}>Meal Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Monday Special Breakfast"
        value={mealName}
        onChangeText={setMealName}
      />

      {/* Menu Items */}
      <Text style={styles.label}>Menu Items</Text>

      {menuItems.map((item, index) => (
        <View key={index} style={styles.menuRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={item}
            placeholder="Enter item"
            onChangeText={(text) => updateItem(index, text)}
          />
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeItem(index)}
          >
            <Ionicons name="close" size={18} color="#FF4D4F" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={addItem}>
        <Text style={styles.addText}>+ Add Item</Text>
      </TouchableOpacity>

      {/* Delivery Time */}
      <Text style={styles.label}>Delivery Time</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Start time (e.g. 08:00 AM)"
          value={startTime}
          onChangeText={setStartTime}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="End time (e.g. 09:00 AM)"
          value={endTime}
          onChangeText={setEndTime}
        />
      </View>

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Meal description"
      />

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditBreakfast;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subTitle: {
    fontSize: 12,
    color: "#777",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 12,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  removeBtn: {
    backgroundColor: "#FFE4E6",
    padding: 10,
    borderRadius: 8,
  },
  addBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "500",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#1D4ED8",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
