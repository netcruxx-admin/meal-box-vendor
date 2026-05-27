import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import ScreenScrollView from "@/components/ScreenScrollView";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useGetPlansQuery, useUpdatePlansMutation } from "@/services/vendorPlanApi";
import { useGetWeeklyMenuQuery } from "@/services/vendorMenuApi";
import GoBack from "@/components/GoBack";
import AppText from "@/components/AppText";
import Button from "@/components/Button";

/* ---------- Types ---------- */
type MealType =
  | "breakfast_only"
  | "lunch_only"
  | "dinner_only"
  | "breakfast_lunch"
  | "breakfast_dinner"
  | "lunch_dinner"
  | "full_day";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast_only: "Breakfast Only",
  lunch_only: "Lunch Only",
  dinner_only: "Dinner Only",
  breakfast_lunch: "Breakfast + Lunch",
  breakfast_dinner: "Breakfast + Dinner",
  lunch_dinner: "Lunch + Dinner",
  full_day: "Breakfast + Lunch + Dinner",
};

const MEAL_GROUPS: { label: string; meals: MealType[] }[] = [
  { label: "1 Time Meal", meals: ["breakfast_only", "lunch_only", "dinner_only"] },
  { label: "2 Times Meal", meals: ["breakfast_lunch", "breakfast_dinner", "lunch_dinner"] },
  { label: "3 Times Meal", meals: ["full_day"] },
];

const ALL_MEALS = MEAL_GROUPS.flatMap((g) => g.meals);

type MealPriceMap = Record<MealType, string>;

const emptyPrices = (): MealPriceMap =>
  Object.fromEntries(ALL_MEALS.map((m) => [m, ""])) as MealPriceMap;

/* ---------- Meal Combination Row ---------- */
const MealRow = ({
  mealType,
  price,
  onChangePrice,
  disabled,
  error,
  isLast,
}: {
  mealType: MealType;
  price: string;
  onChangePrice: (v: string) => void;
  disabled: boolean;
  error?: string;
  isLast?: boolean;
}) => (
  <View style={[rowStyles.container, !isLast && rowStyles.containerBorder]}>
    <Text style={rowStyles.label}>{MEAL_LABELS[mealType]}</Text>
    <View style={rowStyles.right}>
      <View style={[rowStyles.inputWrapper, !!error && rowStyles.inputWrapperError, disabled && rowStyles.inputWrapperDisabled]}>
        <Text style={rowStyles.rupee}>₹</Text>
        <TextInput
          style={[rowStyles.input, disabled && rowStyles.inputDisabled]}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
          value={price}
          onChangeText={(v) => onChangePrice(v.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          editable={!disabled}
        />
      </View>
      {!!error && <Text style={rowStyles.errorText}>{error}</Text>}
    </View>
  </View>
);

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  containerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  label: { fontSize: 13, color: "#374151", fontWeight: "500", flex: 1, marginRight: 10 },
  right: { alignItems: "flex-end" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    width: 110,
  },
  inputWrapperError: { borderColor: "#EF4444" },
  inputWrapperDisabled: { backgroundColor: "#F9FAFB" },
  rupee: { fontSize: 14, color: "#6B7280", marginRight: 4 },
  input: { flex: 1, paddingVertical: 8, fontSize: 14, color: "#111827", textAlign: "right" },
  inputDisabled: { color: "#9CA3AF" },
  errorText: { fontSize: 10, color: "#EF4444", marginTop: 3 },
});

/* ---------- Duration Card ---------- */
const DurationCard = ({
  title,
  durationLabel,
  prices,
  discount,
  onChangePrice,
  onChangeDiscount,
  errors,
}: {
  title: string;
  durationLabel: string;
  prices: MealPriceMap;
  discount: string;
  onChangePrice: (meal: MealType, v: string) => void;
  onChangeDiscount: (v: string) => void;
  errors: Partial<Record<MealType | "discount", string>>;
}) => {
  const discNum = Math.min(Math.max(Number(discount) || 0, 0), 100);
  const filledCount = ALL_MEALS.filter((m) => Number(prices[m]) > 0).length;
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (label: string) =>
    setOpenGroup((prev) => (prev === label ? null : label));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSub}>
            {durationLabel} · {filledCount} combination{filledCount !== 1 ? "s" : ""} set
          </Text>
        </View>
      </View>

      {/* Discount */}
      <View style={styles.discountRow}>
        <Text style={styles.discountLabel}>Global Discount %</Text>
        <View style={[styles.discountInputWrapper, errors.discount ? styles.inputError : null]}>
          <TextInput
            style={styles.discountInput}
            value={discount}
            onChangeText={(v) => onChangeDiscount(v.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.discountPct}>%</Text>
        </View>
      </View>
      {discNum > 0 && <Text style={styles.discountHint}>Save {discNum}% shown to users on all combinations</Text>}
      {errors.discount && <Text style={rowStyles.errorText}>{errors.discount}</Text>}

      {/* Meal Groups */}
      {MEAL_GROUPS.map((group) => {
        const isOpen = openGroup === group.label;
        const groupFilled = group.meals.filter((m) => Number(prices[m]) > 0).length;
        return (
          <View key={group.label} style={styles.group}>
            <TouchableOpacity
              style={[styles.groupHeader, isOpen && styles.groupHeaderOpen]}
              onPress={() => toggleGroup(group.label)}
              activeOpacity={0.7}
            >
              <View style={styles.groupHeaderLeft}>
                <Text style={[styles.groupLabel, isOpen && styles.groupLabelOpen]}>
                  {group.label}
                </Text>
                {groupFilled > 0 && (
                  <View style={styles.groupBadge}>
                    <Text style={styles.groupBadgeText}>{groupFilled} set</Text>
                  </View>
                )}
              </View>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={isOpen ? "#2563EB" : "#9CA3AF"}
              />
            </TouchableOpacity>

            {isOpen && (
              <View>
                {group.meals.map((meal, i) => (
                  <MealRow
                    key={meal}
                    mealType={meal}
                    price={prices[meal]}
                    onChangePrice={(v) => onChangePrice(meal, v)}
                    disabled={false}
                    error={errors[meal]}
                    isLast={i === group.meals.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}

      <Text style={styles.hint}>Leave blank to not offer a combination to users.</Text>
    </View>
  );
};

/* ---------- Screen ---------- */
export default function PlansScreen() {
  const router = useRouter();
  const { data, isLoading } = useGetPlansQuery(undefined);
  const { data: menuData, isLoading: isMenuLoading } = useGetWeeklyMenuQuery(undefined);
  const [updatePlans, { isLoading: isUpdating }] = useUpdatePlansMutation();

  const [weeklyPrices, setWeeklyPrices] = useState<MealPriceMap>(emptyPrices());
  const [weeklyDiscount, setWeeklyDiscount] = useState("0");

  const [monthlyPrices, setMonthlyPrices] = useState<MealPriceMap>(emptyPrices());
  const [monthlyDiscount, setMonthlyDiscount] = useState("0");

  const [errors, setErrors] = useState<{
    weekly: Partial<Record<MealType | "discount", string>>;
    monthly: Partial<Record<MealType | "discount", string>>;
  }>({ weekly: {}, monthly: {} });

  /* Load saved plans */
  useEffect(() => {
    if (data?.plans) {
      const p = data.plans;
      if (p.weekly) {
        if (p.weekly.mealPlans) {
          const wp = emptyPrices();
          Object.entries(p.weekly.mealPlans).forEach(([k, v]) => {
            if (k in wp) wp[k as MealType] = String(v ?? "");
          });
          setWeeklyPrices(wp);
        }
        setWeeklyDiscount(String(p.weekly.discount ?? "0"));
      }
      if (p.monthly) {
        if (p.monthly.mealPlans) {
          const mp = emptyPrices();
          Object.entries(p.monthly.mealPlans).forEach(([k, v]) => {
            if (k in mp) mp[k as MealType] = String(v ?? "");
          });
          setMonthlyPrices(mp);
        }
        setMonthlyDiscount(String(p.monthly.discount ?? "0"));
      }
    }
  }, [data]);

  /* Menu completeness check */
  const getMissingDays = () => {
    if (!menuData?.menu) return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    return days
      .filter((day) => {
        const d = menuData.menu[day];
        return !(d?.breakfast?.mealName || d?.lunch?.mealName || d?.dinner?.mealName);
      })
      .map((d) => d.charAt(0).toUpperCase() + d.slice(1));
  };

  const missingDays = getMissingDays();
  const menuIsComplete = missingDays.length === 0;

  const validatePrices = (prices: MealPriceMap, discount: string) => {
    const errs: Partial<Record<MealType | "discount", string>> = {};
    const hasAny = ALL_MEALS.some((m) => Number(prices[m]) > 0);
    if (!hasAny) {
      errs.full_day = "Set at least one combination price";
    }
    ALL_MEALS.forEach((m) => {
      const v = Number(prices[m]);
      if (prices[m] && v < 100) errs[m] = "Min ₹100";
      else if (prices[m] && v > 100000) errs[m] = "Max ₹1,00,000";
    });
    if (Number(discount) > 100) errs.discount = "Max 100%";
    return errs;
  };

  const handleUpdate = async () => {
    if (!menuIsComplete) {
      Toast.show({
        type: "error",
        text1: "Menu Incomplete",
        text2: `Please add meals for ${missingDays.join(", ")} before updating plans.`,
      });
      return;
    }

    const wErrs = validatePrices(weeklyPrices, weeklyDiscount);
    const mErrs = validatePrices(monthlyPrices, monthlyDiscount);
    if (Object.keys(wErrs).length > 0 || Object.keys(mErrs).length > 0) {
      setErrors({ weekly: wErrs, monthly: mErrs });
      return;
    }
    setErrors({ weekly: {}, monthly: {} });

    const buildMealPlans = (prices: MealPriceMap) =>
      Object.fromEntries(
        ALL_MEALS
          .filter((m) => Number(prices[m]) > 0)
          .map((m) => [m, Number(prices[m])])
      );

    try {
      await updatePlans({
        weekly: {
          duration: 7,
          discount: Math.min(Math.max(Number(weeklyDiscount) || 0, 0), 100),
          mealPlans: buildMealPlans(weeklyPrices),
        },
        monthly: {
          duration: 30,
          discount: Math.min(Math.max(Number(monthlyDiscount) || 0, 0), 100),
          mealPlans: buildMealPlans(monthlyPrices),
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
    <ScreenScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GoBack />
        <AppText weight="semiBold">Subscription Plans</AppText>
      </View>

      {!menuIsComplete && !isMenuLoading && (
        <TouchableOpacity style={styles.warningBox} onPress={() => router.push("/(tabs)/Menu")}>
          <Ionicons name="warning" size={18} color="#92400E" style={{ marginRight: 8 }} />
          <Text style={styles.warningText}>
            Your weekly menu is incomplete. Please add at least one meal for each day to enable subscriptions.
          </Text>
        </TouchableOpacity>
      )}

      <DurationCard
        title="Weekly Plan"
        durationLabel="7 days"
        prices={weeklyPrices}
        discount={weeklyDiscount}
        onChangePrice={(meal, v) => {
          setWeeklyPrices((prev) => ({ ...prev, [meal]: v }));
          setErrors((e) => ({ ...e, weekly: { ...e.weekly, [meal]: undefined } }));
        }}
        onChangeDiscount={(v) => {
          setWeeklyDiscount(v);
          setErrors((e) => ({ ...e, weekly: { ...e.weekly, discount: undefined } }));
        }}
        errors={errors.weekly}
      />

      <DurationCard
        title="Monthly Plan"
        durationLabel="30 days"
        prices={monthlyPrices}
        discount={monthlyDiscount}
        onChangePrice={(meal, v) => {
          setMonthlyPrices((prev) => ({ ...prev, [meal]: v }));
          setErrors((e) => ({ ...e, monthly: { ...e.monthly, [meal]: undefined } }));
        }}
        onChangeDiscount={(v) => {
          setMonthlyDiscount(v);
          setErrors((e) => ({ ...e, monthly: { ...e.monthly, discount: undefined } }));
        }}
        errors={errors.monthly}
      />

      <Button
        title={isUpdating ? "Updating..." : "Update Pricing"}
        variant="fill"
        fullWidth
        onPress={handleUpdate}
        // disabled={isUpdating || !menuIsComplete}                            
        disabled={isUpdating}
      />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  discountLabel: { fontSize: 13, color: "#374151", fontWeight: "600" },
  discountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    width: 90,
  },
  discountInput: { flex: 1, paddingVertical: 7, fontSize: 14, color: "#111827", textAlign: "right" },
  discountPct: { fontSize: 14, color: "#6B7280", marginLeft: 4 },
  discountHint: { fontSize: 11, color: "#16A34A", marginBottom: 6 },
  inputDisabled: { backgroundColor: "#F9FAFB", color: "#9CA3AF" },
  inputError: { borderColor: "#EF4444" },

  group: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#F9FAFB",
  },
  groupHeaderOpen: {
    backgroundColor: "#EFF6FF",
    borderBottomWidth: 1,
    borderBottomColor: "#DBEAFE",
  },
  groupHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  groupLabelOpen: {
    color: "#2563EB",
  },
  groupBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  groupBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#16A34A",
  },

  hint: { fontSize: 11, color: "#9CA3AF", marginTop: 10, textAlign: "center" },

  warningBox: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
  },
  warningText: { color: "#92400E", fontSize: 12, flex: 1, lineHeight: 18 },
});
