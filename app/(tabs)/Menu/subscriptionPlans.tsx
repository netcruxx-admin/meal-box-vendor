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

const SubscriptionPlans = () => {
  const [weeklyDiscount, setWeeklyDiscount] = useState("10");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={22} />
        <Text style={styles.headerTitle}>Subscription Plans</Text>
      </View>

      <View style={styles.cardActive}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Weekly Plan</Text>
          <Text style={styles.editText}>Edit</Text>
        </View>

        <Text style={styles.label}>Plan Type</Text>
        <TextInput
          style={styles.input}
          value="Full Day (Breakfast + Lunch + Dinner)"
          editable={false}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duration</Text>
            <TextInput style={styles.input} value="7 days" editable={false} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Price</Text>
            <TextInput style={styles.input} value="₹840" editable={false} />
          </View>
        </View>

        <Text style={styles.label}>Discount %</Text>
        <TextInput
          style={styles.input}
          value={weeklyDiscount}
          onChangeText={setWeeklyDiscount}
          keyboardType="numeric"
        />

        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            Base Price: <Text style={styles.bold}>₹120/day × 7 = ₹840</Text>
          </Text>
          <Text style={styles.summaryText}>
            Discount (10%): <Text style={styles.discount}>-₹84</Text>
          </Text>
          <Text style={styles.finalPrice}>Final Price: ₹756/week</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Monthly Plan</Text>
          <Text style={styles.editText}>Edit</Text>
        </View>

        <Text style={styles.label}>Plan Type</Text>
        <TextInput
          style={styles.input}
          value="Full Day (Breakfast + Lunch + Dinner)"
          editable={false}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duration</Text>
            <TextInput style={styles.input} value="30 days" editable={false} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Price</Text>
            <TextInput style={styles.input} value="₹3240" editable={false} />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.cta}>
        <Text style={styles.ctaText}>Update Pricing</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SubscriptionPlans;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardActive: {
    backgroundColor: "#F0F6FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2563EB",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  editText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
  label: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  summaryBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  summaryText: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "600",
  },
  discount: {
    color: "#DC2626",
    fontWeight: "500",
  },
  finalPrice: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  cta: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
