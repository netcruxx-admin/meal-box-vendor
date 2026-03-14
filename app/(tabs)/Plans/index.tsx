import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useGetPlansQuery, useUpdatePlansMutation } from "@/services/vendorPlanApi";

/* ---------- Types ---------- */
type PlanType = "full_day" | "lunch_dinner" | "lunch_only";

const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  full_day: "Full Day (Breakfast + Lunch + Dinner)",
  lunch_dinner: "Lunch + Dinner",
  lunch_only: "Lunch Only",
};

const PLAN_TYPES: PlanType[] = ["full_day", "lunch_dinner", "lunch_only"];

/* ---------- Plan Type Dropdown ---------- */
const PlanTypeDropdown = ({
  value,
  onChange,
}: {
  value: PlanType;
  onChange: (v: PlanType) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(true)}>
        <Text style={styles.dropdownText}>{PLAN_TYPE_LABELS[value]}</Text>
        <Ionicons name="chevron-down" size={16} color="#6B7280" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.dropdownMenu}>
            {PLAN_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt}
                style={[styles.dropdownOption, value === pt && styles.dropdownOptionActive]}
                onPress={() => { onChange(pt); setOpen(false); }}
              >
                <Text style={[styles.dropdownOptionText, value === pt && styles.dropdownOptionTextActive]}>
                  {PLAN_TYPE_LABELS[pt]}
                </Text>
                {value === pt && <Ionicons name="checkmark" size={16} color="#2563EB" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default function PlansScreen() {
  const router = useRouter();
  const { data, isLoading } = useGetPlansQuery(undefined);
  const [updatePlans, { isLoading: isUpdating }] = useUpdatePlansMutation();

  const [activeCard, setActiveCard] = useState<"weekly" | "monthly">("weekly");

  const [weeklyPlanType, setWeeklyPlanType] = useState<PlanType>("full_day");
  const [weeklyPrice, setWeeklyPrice] = useState("");
  const [weeklyDiscount, setWeeklyDiscount] = useState("");

  const [monthlyPlanType, setMonthlyPlanType] = useState<PlanType>("full_day");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [monthlyDiscount, setMonthlyDiscount] = useState("");

  /* Load saved plans into form when API responds */
  useEffect(() => {
    if (data?.plans) {
      const p = data.plans;
      if (p.weekly) {
        setWeeklyPlanType(p.weekly.planType ?? "full_day");
        setWeeklyPrice(String(p.weekly.price ?? ""));
        setWeeklyDiscount(String(p.weekly.discount ?? "0"));
      }
      if (p.monthly) {
        setMonthlyPlanType(p.monthly.planType ?? "full_day");
        setMonthlyPrice(String(p.monthly.price ?? ""));
        setMonthlyDiscount(String(p.monthly.discount ?? "0"));
      }
    }
  }, [data]);

  /* Price calculations */
  const wBase = Number(weeklyPrice) || 0;
  const wDisc = Math.min(Math.max(Number(weeklyDiscount) || 0, 0), 100);
  const wDiscAmt = Math.round((wBase * wDisc) / 100);
  const wFinal = wBase - wDiscAmt;
  const wPerDay = wBase > 0 ? Math.round(wBase / 7) : 0;

  const mBase = Number(monthlyPrice) || 0;
  const mDisc = Math.min(Math.max(Number(monthlyDiscount) || 0, 0), 100);
  const mDiscAmt = Math.round((mBase * mDisc) / 100);
  const mFinal = mBase - mDiscAmt;
  const mPerDay = mBase > 0 ? Math.round(mBase / 30) : 0;

  const handleUpdate = async () => {
    try {
      await updatePlans({
        weekly: {
          planType: weeklyPlanType,
          duration: 7,
          price: wBase,       // save base price (before discount)
          discount: wDisc,
        },
        monthly: {
          planType: monthlyPlanType,
          duration: 30,
          price: mBase,       // save base price (before discount)
          discount: mDisc,
        },
      }).unwrap();

      Toast.show({
        type: "success",
        text1: "Pricing Updated",
        text2: "Subscription plans saved successfully.",
        visibilityTime: 2500,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err?.data?.message || "Could not save plans. Please try again.",
        visibilityTime: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
      </View>

      {/* Weekly Plan */}
      <View style={[styles.card, activeCard === "weekly" && styles.cardActive]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Weekly Plan</Text>
          <TouchableOpacity onPress={() => setActiveCard("weekly")}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Plan Type</Text>
        <PlanTypeDropdown value={weeklyPlanType} onChange={setWeeklyPlanType} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.staticField}>
              <Text style={styles.staticText}>7 days</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Total base price"
              value={weeklyPrice}
              onChangeText={(v) => setWeeklyPrice(v.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.label}>Discount %</Text>
        <TextInput
          style={styles.input}
          value={weeklyDiscount}
          onChangeText={(v) => setWeeklyDiscount(v.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          placeholder="0"
        />

        {wBase > 0 && (
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Base Price:</Text>
              <Text style={styles.summaryValue}>₹{wPerDay}/day × 7 = ₹{wBase}</Text>
            </View>
            {wDisc > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: "#16A34A" }]}>Discount ({wDisc}%):</Text>
                <Text style={[styles.summaryValue, { color: "#16A34A" }]}>-₹{wDiscAmt}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>Final Price:</Text>
              <Text style={styles.finalValue}>₹{wFinal}/week</Text>
            </View>
          </View>
        )}
      </View>

      {/* Monthly Plan */}
      <View style={[styles.card, activeCard === "monthly" && styles.cardActive]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Monthly Plan</Text>
          <TouchableOpacity onPress={() => setActiveCard("monthly")}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Plan Type</Text>
        <PlanTypeDropdown value={monthlyPlanType} onChange={setMonthlyPlanType} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.staticField}>
              <Text style={styles.staticText}>30 days</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Total base price"
              value={monthlyPrice}
              onChangeText={(v) => setMonthlyPrice(v.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.label}>Discount %</Text>
        <TextInput
          style={styles.input}
          value={monthlyDiscount}
          onChangeText={(v) => setMonthlyDiscount(v.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          placeholder="0"
        />

        {mBase > 0 && (
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Base Price:</Text>
              <Text style={styles.summaryValue}>₹{mPerDay}/day × 30 = ₹{mBase}</Text>
            </View>
            {mDisc > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: "#16A34A" }]}>Discount ({mDisc}%):</Text>
                <Text style={[styles.summaryValue, { color: "#16A34A" }]}>-₹{mDiscAmt}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>Final Price:</Text>
              <Text style={styles.finalValue}>₹{mFinal}/month</Text>
            </View>
          </View>
        )}
      </View>

      {/* Update Button */}
      <TouchableOpacity
        style={[styles.cta, isUpdating && { opacity: 0.6 }]}
        onPress={handleUpdate}
        disabled={isUpdating}
      >
        <Text style={styles.ctaText}>{isUpdating ? "Saving..." : "Update Pricing"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  /* Card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  editText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },

  /* Form fields */
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  staticField: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
  staticText: {
    fontSize: 14,
    color: "#6B7280",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },

  /* Dropdown */
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownOptionActive: {
    backgroundColor: "#EFF6FF",
  },
  dropdownOptionText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  dropdownOptionTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },

  /* Price summary */
  summaryBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  finalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    marginTop: 2,
    marginBottom: 0,
  },
  finalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  finalValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  /* CTA */
  cta: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
    marginTop: 4,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
