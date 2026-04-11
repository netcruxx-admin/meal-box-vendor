import AppText from "@/components/AppText";
import Button from "@/components/Button";
import { useGetProfileQuery } from "@/services/userApi";
import { removeToken } from "@/utils/authStorage";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { data, isLoading } = useGetProfileQuery(undefined);

  const vendor = data?.vendor;
  const user = vendor?.user;

  const handleLogout = async () => {
    await removeToken();
    router.replace("/welcome");
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* TITLE */}
          <AppText type="subTitle" style={styles.header}>
            Profile
          </AppText>

          {/* BUSINESS CARD */}
          <View style={styles.card}>
            <AppText style={styles.businessName}  weight="medium">
              {vendor?.businessName}
            </AppText>

            <View style={styles.row}>
              <AppText style={styles.label}>Owner</AppText>
              <AppText style={styles.value}>{user?.name}</AppText>
            </View>

            <View style={styles.row}>
              <AppText style={styles.label}>Phone</AppText>
              <AppText style={styles.value}>+91 {user?.phone}</AppText>
            </View>

            <View style={styles.row}>
              <AppText style={styles.label}>Food Type</AppText>
              <View style={styles.foodBadge}>
                <AppText style={styles.foodText}>
                  {vendor?.foodType
                    ? vendor.foodType
                      .split("-")
                      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join("-")
                    : ""}
                </AppText>
              </View>
            </View>
          </View>

          {/* ABOUT */}
          <View style={styles.card}>
            <AppText weight="medium" style={styles.sectionTitle}>About Business</AppText>
            <AppText style={styles.description}>
              {vendor?.description || "No description added"}
            </AppText>
          </View>

          {/* ADDRESS */}
          <View style={styles.card}>
            <AppText  weight="medium" style={styles.sectionTitle}>Business Address</AppText>

            {vendor?.address ? (
              <AppText style={styles.address}>
                {vendor.address.line1}
                {"\n"}
                {vendor.address.city}, {vendor.address.state}{" "}
                {vendor.address.pincode}
              </AppText>
            ) : (
              <AppText style={styles.emptyText}>No address added</AppText>
            )}
          </View>
        </View>
      </ScrollView>

      {/* FIXED BUTTONS */}
      <View style={styles.buttonContainer}>
        <Button
          title="Edit Profile"
          variant="outline"
          fullWidth
          onPress={() => router.push("/(tabs)/Profile/EditProfileScreen")}
        />
        <Button
          title="Logout"
          variant="fill"
          fullWidth
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    // backgroundColor: "#f9fafb",
    flex: 1,
  },
  scrollContent: {
    // padding: 16,
    // paddingBottom: 100,
  },
  header: {
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 14,
    borderRadius: 14,
    // borderBottomWidth: 1,
    // borderBottomColor: "#222"
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  businessName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    color: "#6b7280",
    fontSize: 13,
  },
  value: {
    fontWeight: "600",
    fontSize: 14,
  },
  foodBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  foodText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 12,
  },

  description: {
    color: "#374151",
    lineHeight: 20,
  },

  address: {
    color: "#374151",
    lineHeight: 20,
  },

  emptyText: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  buttonContainer: {
    gap: 10,
    flexDirection: "column",
  },
});
