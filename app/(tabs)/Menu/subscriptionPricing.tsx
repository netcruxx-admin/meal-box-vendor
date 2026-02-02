import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SubscriptionPricingScreen() {
  const [discount, setDiscount] = useState("10");

  const pricePerDay = 120;
  const weeklyDays = 7;

  const basePrice = pricePerDay * weeklyDays;
  const discountAmount = Math.round((basePrice * Number(discount || 0)) / 100);
  const finalPrice = basePrice - discountAmount;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>V5. Subscription Pricing</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <View style={styles.titleRow}>
          <Ionicons name="arrow-back" size={22} color="#000" />
          <Text style={styles.title}>Subscription Plans</Text>
        </View>

        {/* Weekly Plan */}
        <View style={[styles.card, styles.weeklyCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weekly Plan</Text>
            <Text style={styles.edit}>Edit</Text>
          </View>

          <Text style={styles.label}>Plan Type</Text>
          <View style={styles.inputBox}>
            <Text>Full Day (Breakfast + Lunch + Dinner)</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Duration</Text>
              <TextInput style={styles.input} value="7 days" editable={false} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={`₹${basePrice}`}
                editable={false}
              />
            </View>
          </View>

          <Text style={styles.label}>Discount %</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={discount}
            onChangeText={setDiscount}
          />

          {/* Price Breakdown */}
          <View style={styles.breakdown}>
            <View style={styles.breakRow}>
              <Text>Base Price:</Text>
              <Text>₹120/day × 7 = ₹{basePrice}</Text>
            </View>
            <View style={styles.breakRow}>
              <Text style={{ color: "green" }}>
                Discount ({discount || 0}%):
              </Text>
              <Text style={{ color: "green" }}>-₹{discountAmount}</Text>
            </View>
            <View style={[styles.breakRow, styles.finalRow]}>
              <Text style={styles.finalText}>Final Price:</Text>
              <Text style={styles.finalText}>₹{finalPrice}/week</Text>
            </View>
          </View>
        </View>

        {/* Monthly Plan */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Monthly Plan</Text>
            <Text style={styles.edit}>Edit</Text>
          </View>

          <Text style={styles.label}>Plan Type</Text>
          <View style={styles.inputBox}>
            <Text>Full Day (Breakfast + Lunch + Dinner)</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Duration</Text>
              <TextInput
                style={styles.input}
                value="30 days"
                editable={false}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Price</Text>
              <TextInput style={styles.input} value="₹3240" editable={false} />
            </View>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Update Pricing</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 14,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  weeklyCard: {
    borderWidth: 2,
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  edit: {
    color: "#2563eb",
    fontWeight: "500",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  col: {
    flex: 1,
  },
  breakdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  breakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  finalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  finalText: {
    fontWeight: "700",
    color: "#1d4ed8",
  },
  button: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
