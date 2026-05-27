import AppText from "@/components/AppText";
import Button from "@/components/Button";
import { useDeleteAccountMutation, useGetProfileQuery } from "@/services/userApi";
import { useGetVendorReviewsQuery } from "@/services/reviewApi";
import { removeToken } from "@/utils/authStorage";
import { baseApi } from "@/services/baseApi";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useDispatch } from "react-redux";
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
import { colors } from "@/constants/theme";

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.star, i <= rating ? styles.starFilled : styles.starEmpty]}>★</Text>
      ))}
    </View>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data, isLoading } = useGetProfileQuery(undefined);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  const vendorId = data?.vendor?._id;
  const { data: reviewData, isLoading: reviewsLoading, isFetching: reviewsFetching } = useGetVendorReviewsQuery(
    { vendorId, page: reviewPage, limit: 10 },
    { skip: !vendorId }
  );

  const reviews = reviewData?.reviews || [];
  const totalPages = reviewData?.totalPages || 1;
  const totalReviews = reviewData?.totalReviews || 0;
  const averageRating = reviewData?.averageRating || 0;

  const vendor = data?.vendor;
  const user = vendor?.user;

  const handleLogout = async () => {
    dispatch(baseApi.util.resetApiState());
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

          {/* REVIEWS */}
          <AppText weight="medium" style={styles.sectionTitle}>Reviews</AppText>

          {reviewsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.avgRating}>{averageRating.toFixed(1)}</Text>
                  <StarRating rating={Math.round(averageRating)} />
                  <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRight}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r: any) => r.rating === star).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <View key={star} style={styles.barRow}>
                        <Text style={styles.barLabel}>{star}★</Text>
                        <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: `${pct}%` as any }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {reviews.length === 0 ? (
                <View style={styles.emptyReviews}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyTitle}>No reviews yet</Text>
                  <Text style={styles.emptySubtitle}>Reviews from customers will appear here</Text>
                </View>
              ) : (
                reviews.map((review: any) => (
                  <View key={review._id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View style={styles.reviewHeaderText}>
                        <Text style={styles.reviewerName}>{review.user?.name || 'Anonymous'}</Text>
                        <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                      </View>
                      <StarRating rating={review.rating} />
                    </View>
                    {!!review.comment && (
                      <Text style={styles.comment}>{review.comment}</Text>
                    )}
                  </View>
                ))
              )}

              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[styles.pageBtn, reviewPage === 1 && styles.pageBtnDisabled]}
                    onPress={() => setReviewPage((p) => Math.max(1, p - 1))}
                    disabled={reviewPage === 1 || reviewsFetching}
                  >
                    <Text style={styles.pageBtnText}>← Prev</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>{reviewPage} / {totalPages}</Text>
                  <TouchableOpacity
                    style={[styles.pageBtn, reviewPage === totalPages && styles.pageBtnDisabled]}
                    onPress={() => setReviewPage((p) => Math.min(totalPages, p + 1))}
                    disabled={reviewPage === totalPages || reviewsFetching}
                  >
                    <Text style={styles.pageBtnText}>Next →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
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

  /* Reviews */
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  avgRating: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 44,
  },
  totalReviews: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 14,
  },
  summaryRight: {
    flex: 2,
    justifyContent: 'center',
    gap: 5,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barLabel: {
    fontSize: 11,
    color: '#6b7280',
    width: 22,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 14,
  },
  starFilled: {
    color: '#f59e0b',
  },
  starEmpty: {
    color: '#d1d5db',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewerName: {
    fontWeight: '600',
    fontSize: 13,
    color: '#111827',
  },
  reviewDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 1,
  },
  comment: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  emptySubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 13,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  pageBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pageBtnDisabled: {
    backgroundColor: '#e5e7eb',
  },
  pageBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  pageInfo: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
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
