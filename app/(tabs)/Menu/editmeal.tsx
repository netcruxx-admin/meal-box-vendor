import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { useGetWeeklyMenuQuery, useSaveWeeklyMenuMutation } from "@/services/vendorMenuApi";

type MealType = 'breakfast' | 'lunch' | 'dinner';

const capitalize = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const formatTime = (date: Date): string => {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const parseTime = (timeStr: string): Date => {
  const date = new Date();
  if (!timeStr) return date;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return date;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  date.setHours(h, m, 0, 0);
  return date;
};

const EditBreakfast = () => {
  const router = useRouter();

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
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [saveMenu] = useSaveWeeklyMenuMutation();

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
  const addItem = () => setMenuItems((prev) => [...prev, '']);

  const removeItem = (index: number) =>
    setMenuItems((prev) => prev.filter((_, i) => i !== index));

  const updateItem = (index: number, value: string) =>
    setMenuItems((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });

  /* ---------- Time picker ---------- */
  const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setPickerTarget(null);
    if (_event.type === 'dismissed') { setPickerTarget(null); return; }
    if (selectedDate) {
      const formatted = formatTime(selectedDate);
      if (pickerTarget === 'start') setStartTime(formatted);
      else if (pickerTarget === 'end') setEndTime(formatted);
    }
  };

  const pickerValue =
    pickerTarget === 'start' ? parseTime(startTime) : parseTime(endTime);

  /* ---------- Save ---------- */
  const handleSave = async () => {
    const menuData = data?.menu;

    const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const updatedMenu: Record<string, any> = {};
    DAY_KEYS.forEach((d) => {
      updatedMenu[d] = d === day
        ? {
            ...menuData?.[d],
            [meal]: {
              mealName,
              items: menuItems.filter(Boolean),
              deliveryTime: { start: startTime, end: endTime },
              description,
            },
          }
        : menuData?.[d];
    });

    try {
      await saveMenu(updatedMenu).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Saved!',
        text2: `${capitalize(day)} ${capitalize(meal)} updated successfully.`,
        visibilityTime: 2000,
        onHide: () => router.back(),
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Something went wrong. Please try again.',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Edit {capitalize(meal)}</Text>
          <Text style={styles.subTitle}>{capitalize(day)}</Text>
        </View>
      </View>

      {/* Meal Name */}
      <Text style={styles.label}>Meal Name</Text>
      <TextInput
        style={styles.input}
        placeholder={`e.g. ${capitalize(day)} Special ${capitalize(meal)}`}
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
          <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(index)}>
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
        {/* Start time button */}
        <TouchableOpacity
          style={styles.timeBtn}
          onPress={() => setPickerTarget('start')}
        >
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={[styles.timeBtnText, !startTime && styles.timePlaceholder]}>
            {startTime || 'Start time'}
          </Text>
        </TouchableOpacity>

        {/* End time button */}
        <TouchableOpacity
          style={styles.timeBtn}
          onPress={() => setPickerTarget('end')}
        >
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={[styles.timeBtnText, !endTime && styles.timePlaceholder]}>
            {endTime || 'End time'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Android: inline native picker */}
      {Platform.OS === 'android' && pickerTarget !== null && (
        <DateTimePicker
          value={pickerValue}
          mode="time"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}

      {/* iOS: bottom-sheet modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={pickerTarget !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setPickerTarget(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {pickerTarget === 'start' ? 'Start Time' : 'End Time'}
                </Text>
                <TouchableOpacity onPress={() => setPickerTarget(null)}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerValue}
                mode="time"
                display="spinner"
                is24Hour={false}
                onChange={handleTimeChange}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      )}

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
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
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
  timeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  timeBtnText: {
    fontSize: 14,
    color: "#111827",
  },
  timePlaceholder: {
    color: "#9CA3AF",
  },
  /* iOS modal */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  doneText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
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
