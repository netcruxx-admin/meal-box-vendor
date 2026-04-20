import AppText from "@/components/AppText";
import Button from "@/components/Button";
import { useDeleteAccountMutation, useGetProfileQuery } from "@/services/userApi";
import { removeToken } from "@/utils/authStorage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const router = useRouter();
  const { data, isLoading } = useGetProfileQuery(undefined);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const vendor = data?.vendor;
  const user = vendor?.user;

  const handleLogout = async () => {
    await removeToken();
    router.replace("/welcome");
  };

  const confirmDelete = async () => {
    try {
      await deleteAccount(undefined).unwrap();
      await removeToken();
      setShowDeleteModal(false);
      Toast.show({
        type: "success",
        text1: "Account deleted successfully",
        visibilityTime: 2000,
      });
      setTimeout(() => router.replace("/welcome"), 2000);
    } catch (err: unknown) {
      setShowDeleteModal(false);
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      Toast.show({
        type: "error",
        text1: message || "Failed to delete account",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
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
            <AppText style={styles.businessName} weight="medium">
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
            <AppText weight="medium" style={styles.sectionTitle}>Business Address</AppText>

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
        <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={styles.deleteLink}>
          <Text style={styles.deleteLinkText}>
            Want to delete your account?{" "}
            <Text style={styles.deleteLinkAction}>Delete Account</Text>
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>

      {/* DELETE CONFIRMATION MODAL — outside SafeAreaView to cover full screen */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🗑️</Text>
            </View>

            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                <Text style={styles.deleteText}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
  },
  scrollContent: {},
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
  deleteLink: {
    alignItems: "center",
    paddingVertical: 4,
  },
  deleteLinkText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
  deleteLinkAction: {
    color: "#EF4444",
    fontWeight: "600",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  deleteBtnDisabled: {
    backgroundColor: "#FCA5A5",
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
