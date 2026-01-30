import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EditBreakfast = () => {
  const [mealName, setMealName] = useState("Monday Special Breakfast");
  const [menuItems, setMenuItems] = useState([
    "Aloo Paratha (2 pcs)",
    "Curd (1 bowl)",
    "Pickle",
  ]);
  const [price, setPrice] = useState("40");
  const [calories, setCalories] = useState("450");
  const [startTime, setStartTime] = useState("08:00 AM");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState(
    "Fresh homemade parathas with creamy curd and tangy pickle",
  );

  const removeItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setMenuItems([...menuItems, ""]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={22} color="#000" />
        <View>
          <Text style={styles.title}>Edit Breakfast</Text>
          <Text style={styles.subTitle}>Monday</Text>
        </View>
      </View>

      {/* Meal Name */}
      <Text style={styles.label}>Meal Name</Text>
      <TextInput
        style={styles.input}
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
            onChangeText={(text) => {
              const updated = [...menuItems];
              updated[index] = text;
              setMenuItems(updated);
            }}
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

      {/* Price & Calories */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={`₹${price}`}
            onChangeText={(v) => setPrice(v.replace("₹", ""))}
            keyboardType="numeric"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Calories</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Delivery Time */}
      <Text style={styles.label}>Delivery Time</Text>
      <View style={styles.row}>
        <View style={styles.timeInput}>
          <Text>{startTime}</Text>
          <Ionicons name="time-outline" size={18} color="#666" />
        </View>

        <View style={styles.timeInput}>
          <TextInput style={styles.input}>{endTime}</TextInput>
          <Ionicons name="time-outline" size={18} color="#666" />
        </View>
      </View>

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn}>
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
