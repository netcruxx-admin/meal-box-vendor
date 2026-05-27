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
import Button from "@/components/Button";

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

const VALID_CHAR_REGEX = /^[a-zA-Z0-9\s,&.()-]*$/;
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

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
  const [mealNameError, setMealNameError] = useState('');
  const [itemsError, setItemsError] = useState('');
  const [addItemError, setAddItemError] = useState('');
  const [itemErrorIndexes, setItemErrorIndexes] = useState<number[]>([]);
  const [descriptionError, setDescriptionError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [sameForAllWeeks, setSameForAllWeeks] = useState(false);
  const [dayOverrides, setDayOverrides] = useState<Record<string, { start: string; end: string }>>({});
  const [editingPreviewDay, setEditingPreviewDay] = useState<string | null>(null);
  const [pickerDay, setPickerDay] = useState<string | null>(null);

  const defaultMealName = `${capitalize(day)} ${capitalize(meal)}`;

  useEffect(() => {
    if (mealData) {
      setMealName(mealData.mealName || defaultMealName);
      setMenuItems(mealData.items || []);
      setStartTime(mealData.deliveryTime?.start || '');
      setEndTime(mealData.deliveryTime?.end || '');
      setDescription(mealData.description || '');
      setSameForAllWeeks(!!mealData.sameForAllWeeks);
    } else {
      setMealName(defaultMealName);
    }
  }, [mealData]);

  /* ---------- Menu items handlers ---------- */
  const addItem = () => {
    const lastIndex = menuItems.length - 1;
    const lastItem = menuItems[lastIndex];
    if (menuItems.length > 0 && lastItem.trim() === '') {
      setAddItemError('Please enter the item first');
      setItemErrorIndexes((prev) => prev.includes(lastIndex) ? prev : [...prev, lastIndex]);
      return;
    }
    setAddItemError('');
    setItemsError('');
    setItemErrorIndexes([]);
    setMenuItems((prev) => [...prev, '']);
  };

  const removeItem = (index: number) => {
    setMenuItems((prev) => prev.filter((_, i) => i !== index));
    setItemErrorIndexes((prev) => prev.filter((i) => i !== index).map((i) => i > index ? i - 1 : i));
    setAddItemError('');
  };

  const updateItem = (index: number, value: string) => {
    // Only allow valid characters
    const filteredValue = value.split('').filter(char => VALID_CHAR_REGEX.test(char)).join('');
    
    setMenuItems((prev) => {
      const updated = [...prev];
      updated[index] = filteredValue;
      return updated;
    });
    if (filteredValue.trim() !== '') {
      setAddItemError('');
      setItemErrorIndexes((prev) => prev.filter((i) => i !== index));
    }
  };

  /* ---------- Time picker ---------- */
  const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') { setPickerTarget(null); setPickerDay(null); }
    if (_event.type === 'dismissed') { setPickerTarget(null); setPickerDay(null); return; }
    if (selectedDate) {
      let dateToUse = selectedDate;
      if (meal === 'breakfast' && selectedDate.getHours() >= 12) {
        dateToUse = new Date(selectedDate);
        dateToUse.setHours(selectedDate.getHours() - 12);
      }
      const formatted = formatTime(dateToUse);
      if (pickerDay) {
        // Save to per-day override
        setDayOverrides((prev) => ({
          ...prev,
          [pickerDay]: {
            start: pickerTarget === 'start' ? formatted : (prev[pickerDay]?.start || startTime),
            end: pickerTarget === 'end' ? formatted : (prev[pickerDay]?.end || endTime),
          },
        }));
      } else {
        if (pickerTarget === 'start') {
          setStartTime(formatted);
          if (endTime) setTimeError('');
        } else if (pickerTarget === 'end') {
          setEndTime(formatted);
          if (startTime) setTimeError('');
        }
      }
    }
  };

  const pickerValue = pickerDay
    ? parseTime(pickerTarget === 'start'
        ? (dayOverrides[pickerDay]?.start || startTime)
        : (dayOverrides[pickerDay]?.end || endTime))
    : (pickerTarget === 'start' ? parseTime(startTime) : parseTime(endTime));

  /* ---------- Save ---------- */
  const handleSave = async () => {
    let hasError = false;

    if (!mealName.trim()) {
      setMealNameError('Meal name is required');
      hasError = true;
    } else if (mealName.trim().length < 3) {
      setMealNameError('Meal name must be at least 3 characters');
      hasError = true;
    } else if (mealName.trim().length > 50) {
      setMealNameError('Meal name must not exceed 50 characters');
      hasError = true;
    } else {
      setMealNameError('');
    }

    const emptyIndexes = menuItems.reduce<number[]>((acc, item, i) => {
      if (item.trim() === '') acc.push(i);
      return acc;
    }, []);

    const tooShortIndexes = menuItems.reduce<number[]>((acc, item, i) => {
        if (item.trim().length > 0 && item.trim().length < 2) acc.push(i);
        return acc;
    }, []);

    const tooLongIndexes = menuItems.reduce<number[]>((acc, item, i) => {
        if (item.trim().length > 50) acc.push(i);
        return acc;
    }, []);

    if (menuItems.length === 0 || menuItems.every((i) => i.trim() === '')) {
      setItemsError('At least 1 item is required');
      setItemErrorIndexes(emptyIndexes);
      hasError = true;
    } else if (emptyIndexes.length > 0) {
      setAddItemError('Please enter the item first');
      setItemErrorIndexes(emptyIndexes);
      hasError = true;
    } else if (tooShortIndexes.length > 0) {
        setAddItemError('Items must be at least 2 characters');
        setItemErrorIndexes(tooShortIndexes);
        hasError = true;
    } else if (tooLongIndexes.length > 0) {
        setAddItemError('Items must not exceed 50 characters');
        setItemErrorIndexes(tooLongIndexes);
        hasError = true;
    } else {
      setItemsError('');
      setAddItemError('');
      setItemErrorIndexes([]);
    }

    if (!startTime || !endTime) {
        setTimeError('Delivery start and end times are required');
        hasError = true;
    } else {
        setTimeError('');
    }

    if (description.length > 200) {
        setDescriptionError('Description must not exceed 200 characters');
        hasError = true;
    } else {
        setDescriptionError('');
    }

    if (hasError) return;

    const menuData = data?.menu || {};
    const updatedMenu: Record<string, any> = {};

    DAY_KEYS.forEach((d) => {
      // Start with a copy of existing day data
      const existingDayData = menuData[d] || {};
      
      if (sameForAllWeeks) {
        const override = dayOverrides[d];
        const dayStart = override?.start || startTime;
        const dayEnd = override?.end || endTime;
        updatedMenu[d] = {
          ...existingDayData,
          [meal]: {
            ...existingDayData[meal],
            ...(d === day ? { mealName, items: menuItems.filter(Boolean), description } : {}),
            deliveryTime: { start: dayStart, end: dayEnd },
            sameForAllWeeks: true,
          },
        };
      } else if (d === day) {
        // Single update logic: Only update the specific day and meal being edited
        updatedMenu[d] = {
          ...existingDayData,
          [meal]: {
            mealName,
            items: menuItems.filter(Boolean),
            deliveryTime: { start: startTime, end: endTime },
            description,
            sameForAllWeeks: false,
          },
        };
      } else {
        // No change for other days
        updatedMenu[d] = existingDayData;
      }
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
        style={[styles.input, mealNameError ? styles.inputError : null]}
        placeholder={`e.g. ${capitalize(day)} Special ${capitalize(meal)}`}
        value={mealName}
        onChangeText={(text) => { 
            const filtered = text.split('').filter(char => VALID_CHAR_REGEX.test(char)).join('');
            setMealName(filtered); 
            if (filtered.trim()) setMealNameError(''); 
        }}
      />
      {mealNameError ? <Text style={styles.errorText}>{mealNameError}</Text> : null}

      {/* Menu Items */}
      <Text style={styles.label}>Menu Items</Text>
      {menuItems.map((item, index) => (
        <View key={index} style={styles.menuRow}>
          <TextInput
            style={[styles.input, { flex: 1 }, itemErrorIndexes.includes(index) ? styles.inputError : null]}
            value={item}
            placeholder="Enter item"
            onChangeText={(text) => updateItem(index, text)}
          />
          <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(index)}>
            <Ionicons name="close" size={18} color="#FF4D4F" />
          </TouchableOpacity>
        </View>
      ))}
      {addItemError ? <Text style={styles.errorText}>{addItemError}</Text> : null}

      <TouchableOpacity style={styles.addBtn} onPress={addItem}>
        <Text style={styles.addText}>+ Add Item</Text>
      </TouchableOpacity>
      {itemsError ? <Text style={styles.errorText}>{itemsError}</Text> : null}

      {/* Delivery Time */}
      <Text style={styles.label}>Delivery Time</Text>
      <View style={styles.row}>
        {/* Start time button */}
        <TouchableOpacity
          style={[styles.timeBtn, timeError ? styles.inputError : null]}
          onPress={() => setPickerTarget('start')}
        >
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={[styles.timeBtnText, !startTime && styles.timePlaceholder]}>
            {startTime || 'Start time'}
          </Text>
        </TouchableOpacity>

        {/* End time button */}
        <TouchableOpacity
          style={[styles.timeBtn, timeError ? styles.inputError : null]}
          onPress={() => setPickerTarget('end')}
        >
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={[styles.timeBtnText, !endTime && styles.timePlaceholder]}>
            {endTime || 'End time'}
          </Text>
        </TouchableOpacity>
      </View>
      {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}

      {/* Same for all weeks checkbox */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setSameForAllWeeks((prev) => !prev)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={sameForAllWeeks ? "checkbox" : "square-outline"}
          size={20}
          color={sameForAllWeeks ? "#2563EB" : "#6B7280"}
        />
        <Text style={styles.checkboxLabel}>Same for all weeks</Text>
      </TouchableOpacity>

      {/* Synced days preview — visible only when checkbox is checked */}
      {sameForAllWeeks && (
        <View style={styles.syncPreview}>
          <Text style={styles.syncPreviewTitle}>
            Applied to all days ({capitalize(meal)}):
          </Text>
          {DAY_KEYS.map((d) => {
            const isSource = d === day;
            const override = dayOverrides[d];
            const rowStart = override?.start || startTime;
            const rowEnd = override?.end || endTime;
            const isEditing = editingPreviewDay === d;

            return (
              <View key={d}>
                <View style={styles.syncPreviewRow}>
                  <Text style={[styles.syncPreviewDay, isSource && styles.syncPreviewDaySource]}>
                    {capitalize(d)}{isSource ? ' (this)' : ''}
                  </Text>
                  <View style={styles.syncPreviewTimes}>
                    {isEditing ? (
                      <>
                        <TouchableOpacity
                          style={[styles.timeBtn, styles.timeBtnEditable]}
                          onPress={() => { setPickerTarget('start'); setPickerDay(d); }}
                        >
                          <Ionicons name="time-outline" size={14} color="#2563EB" />
                          <Text style={styles.timeBtnTextEditable}>{rowStart || 'Start'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.timeBtn, styles.timeBtnEditable]}
                          onPress={() => { setPickerTarget('end'); setPickerDay(d); }}
                        >
                          <Ionicons name="time-outline" size={14} color="#2563EB" />
                          <Text style={styles.timeBtnTextEditable}>{rowEnd || 'End'}</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <View style={[styles.timeBtn, styles.timeBtnDisabled]}>
                          <Ionicons name="time-outline" size={14} color={override ? "#2563EB" : "#9CA3AF"} />
                          <Text style={[styles.timeBtnTextDisabled, override && styles.timeBtnTextOverride]}>
                            {rowStart || '—'}
                          </Text>
                        </View>
                        <View style={[styles.timeBtn, styles.timeBtnDisabled]}>
                          <Ionicons name="time-outline" size={14} color={override ? "#2563EB" : "#9CA3AF"} />
                          <Text style={[styles.timeBtnTextDisabled, override && styles.timeBtnTextOverride]}>
                            {rowEnd || '—'}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                  {/* Edit / reset controls — not shown for the source day */}
                  {!isSource && (
                    <View style={styles.syncPreviewActions}>
                      <TouchableOpacity
                        onPress={() => setEditingPreviewDay(isEditing ? null : d)}
                        style={styles.syncPreviewIconBtn}
                      >
                        <Ionicons
                          name={isEditing ? "checkmark-circle" : "create-outline"}
                          size={18}
                          color={isEditing ? "#16A34A" : "#2563EB"}
                        />
                      </TouchableOpacity>
                      {override && !isEditing && (
                        <TouchableOpacity
                          onPress={() => {
                            setDayOverrides((prev) => {
                              const next = { ...prev };
                              delete next[d];
                              return next;
                            });
                          }}
                          style={styles.syncPreviewIconBtn}
                        >
                          <Ionicons name="refresh-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

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
        style={[styles.input, styles.textArea, descriptionError ? styles.inputError : null]}
        value={description}
        onChangeText={(text) => {
            const filtered = text.split('').filter(char => VALID_CHAR_REGEX.test(char)).join('');
            setDescription(filtered);
            if (descriptionError) setDescriptionError('');
        }}
        multiline
        placeholder="Meal description (max 200 characters)"
      />
      {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}

      {/* Actions */}
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Save"
            variant="fill"
            onPress={handleSave}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default EditBreakfast;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
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
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  timeBtnDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    opacity: 0.75,
  },
  timeBtnTextDisabled: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  syncPreview: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    padding: 10,
    gap: 6,
  },
  syncPreviewTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D4ED8",
    marginBottom: 4,
  },
  syncPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  syncPreviewDay: {
    fontSize: 12,
    color: "#6B7280",
    width: 80,
  },
  syncPreviewDaySource: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  syncPreviewTimes: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  syncPreviewActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 4,
  },
  syncPreviewIconBtn: {
    padding: 2,
  },
  timeBtnEditable: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  timeBtnTextEditable: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "500",
  },
  timeBtnTextOverride: {
    color: "#2563EB",
    fontWeight: "500",
  },
});
