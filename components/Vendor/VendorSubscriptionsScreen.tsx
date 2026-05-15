import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Linking,
} from "react-native";
import {
    useGetVendorSubscriptionsQuery,
    useAcceptSubscriptionMutation,
    useRejectSubscriptionMutation,
} from "@/services/subscriptionApi";
import Toast from "react-native-toast-message";
import { colors } from "@/constants/theme";
import GoBack from "../GoBack";
import AppText from "../AppText";

const MEAL_LABELS: Record<string, string> = {
    breakfast_only: "Breakfast Only",
    lunch_only: "Lunch Only",
    dinner_only: "Dinner Only",
    breakfast_lunch: "Breakfast + Lunch",
    breakfast_dinner: "Breakfast + Dinner",
    lunch_dinner: "Lunch + Dinner",
    full_day: "Breakfast + Lunch + Dinner",
};

export default function VendorSubscriptionsScreen() {
    const { data, isLoading } = useGetVendorSubscriptionsQuery(undefined);
    const [filter, setFilter] = useState<"pending" | "accepted" | "rejected" | "paused">("pending");
    const [acceptSubscription] = useAcceptSubscriptionMutation();
    const [rejectSubscription] = useRejectSubscriptionMutation();

    if (isLoading) return <Text>Loading...</Text>;

    const subs = data?.subscriptions || [];
    const filteredSubs = subs.filter((sub: any) => sub.status === filter);

    const handleCall = (phone: string) => {
        if (!phone) return;

        Linking.openURL(`tel:+91${phone}`);
    };

    const handleAccept = async (id: string) => {
        try {
            await acceptSubscription(id).unwrap();

            Toast.show({
                type: "success",
                text1: "Subscription accepted",
            });
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: err?.data?.message || "Failed to accept",
            });
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectSubscription(id).unwrap();

            Toast.show({
                type: "success",
                text1: "Subscription rejected",
            });
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: err?.data?.message || "Failed to reject",
            });
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <GoBack />
                <AppText weight='semiBold'>Subscription Requests</AppText>
            </View>
            <View style={styles.filterContainer}>
                {["pending", "accepted", "paused", "rejected"].map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => setFilter(item as any)}
                        style={[
                            styles.filterBtn,
                            filter === item && (item === "paused" ? styles.filterActivePaused : styles.filterActive),
                        ]}
                    >
                        <Text
                            style={
                                filter === item ? styles.filterTextActive : styles.filterText
                            }
                        >
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {filteredSubs.length > 0 ? (
                <>
                    {filteredSubs.map((sub: any) => (
                        <View
                            key={sub._id}
                            style={[
                                styles.card,
                                sub.status === "accepted" && styles.cardAccepted,
                                sub.status === "pending" && styles.cardPending,
                                sub.status === "rejected" && styles.cardRejected,
                                sub.status === "paused" && styles.cardPaused,
                            ]}
                        >
                            {/* HEADER */}
                            <View style={styles.headerRow}>
                                <View>
                                    <Text style={styles.customer}>{sub.user?.name}</Text>
                                    <Text style={styles.phone}>+91 {sub.user?.phone}</Text>
                                </View>

                                <View
                                    style={[
                                        styles.badge,
                                        sub.status === "accepted" && styles.badgeAccepted,
                                        sub.status === "pending" && styles.badgePending,
                                        sub.status === "rejected" && styles.badgeRejected,
                                        sub.status === "paused" && styles.badgePaused,
                                    ]}
                                >
                                    <Text style={styles.badgeText}>
                                        {sub.status === "accepted"
                                            ? "Accepted"
                                            : sub.status === "pending"
                                                ? "Pending"
                                                : sub.status === "paused"
                                                    ? "Paused"
                                                    : "Rejected"}
                                    </Text>
                                </View>
                            </View>

                            {/* PLAN */}
                            <Text style={styles.plan}>
                                {(sub.planDuration ?? sub.planType) === "weekly"
                                    ? "Weekly Plan • 7 Days"
                                    : "Monthly Plan • 30 Days"}
                                {sub.mealType ? ` · ${MEAL_LABELS[sub.mealType] ?? sub.mealType}` : ""}
                            </Text>

                            {/* ADDRESS */}
                            {(sub.status === "accepted" || sub.status === "paused") && sub.user?.address ? (
                                <Text style={styles.address}>
                                    {sub.user.address.line1}, {sub.user.address.city},{" "}
                                    {sub.user.address.state}
                                </Text>
                            ) : (
                                <Text style={styles.addressHint}>
                                    Address visible after accepting
                                </Text>
                            )}

                            {/* PAUSED INFO */}
                            {sub.status === "paused" && (() => {
                                const last = sub.pauseHistory?.[sub.pauseHistory.length - 1];
                                return (
                                    <View style={styles.pauseBox}>
                                        <Text style={styles.pauseTitle}>Subscription is currently paused</Text>
                                        {sub.endDate && (
                                            <Text style={styles.pauseMeta}>New end date: {new Date(sub.endDate).toLocaleDateString()}</Text>
                                        )}
                                        {last && (
                                            <>
                                                <Text style={styles.pauseMeta}>Paused from: {new Date(last.pauseStartDate).toLocaleDateString()}</Text>
                                                <Text style={styles.pauseMeta}>Paused until: {new Date(last.pauseEndDate).toLocaleDateString()}</Text>
                                                <Text style={styles.pauseMeta}>Days paused: {last.pausedDays}</Text>
                                            </>
                                        )}
                                    </View>
                                );
                            })()}

                            {/* ACTION ROW */}
                            <View style={styles.bottomRow}>
                                {/* CALL BUTTON */}
                                <TouchableOpacity
                                    style={styles.callBtn}
                                    onPress={() => handleCall(sub.user?.phone)}
                                >
                                    <Text style={styles.callText}>📞 Call</Text>
                                </TouchableOpacity>

                                <Text style={styles.price}>₹{sub.finalPrice ?? sub.price}</Text>
                            </View>

                            {/* ACTION BUTTONS */}
                            {sub.status === "pending" && (
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.acceptBtn}
                                        onPress={() => handleAccept(sub._id)}
                                    >
                                        <Text style={styles.btnText}>Accept</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.rejectBtn}
                                        onPress={() => handleReject(sub._id)}
                                    >
                                        <Text style={styles.btnText}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                    }
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyTitle}>No data found</Text>
                    <Text style={styles.emptySubtitle}>
                        {filter === "pending"
                            ? "No pending subscription requests"
                            : filter === "accepted"
                                ? "No accepted subscriptions yet"
                                : filter === "paused"
                                    ? "No paused subscriptions"
                                    : "No rejected subscriptions"}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 10,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 10
    },
    filterContainer: {
        flexDirection: "row",
        marginBottom: 16,
    },

    filterBtn: {
        flex: 1,
        padding: 10,
        backgroundColor: "#e5e7eb",
        borderRadius: 10,
        alignItems: "center",
        marginRight: 10,
    },

    filterActive: {
        backgroundColor: colors.primary,
    },

    filterActivePaused: {
        backgroundColor: "#f59e0b",
    },

    filterText: {
        color: "#374151",
        fontWeight: "600",
    },

    filterTextActive: {
        color: "#fff",
        fontWeight: "600",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    cardAccepted: {
        borderLeftWidth: 4,
        borderLeftColor: "#22c55e",
    },

    cardPending: {
        borderLeftWidth: 4,
        borderLeftColor: "#f97316",
    },

    cardRejected: {
        borderLeftWidth: 4,
        borderLeftColor: "#ef4444",
    },

    cardPaused: {
        borderLeftWidth: 4,
        borderLeftColor: "#f59e0b",
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    customer: {
        fontSize: 16,
        fontWeight: "700",
    },

    phone: {
        color: "#6b7280",
        fontSize: 13,
    },

    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },

    badgeAccepted: {
        backgroundColor: "#22c55e",
    },

    badgePending: {
        backgroundColor: "#f97316",
    },

    badgeRejected: {
        backgroundColor: "#ef4444",
    },

    badgePaused: {
        backgroundColor: "#f59e0b",
    },

    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },

    plan: {
        marginTop: 10,
        fontWeight: "600",
        color: "#374151",
    },

    address: {
        marginTop: 6,
        color: "#4b5563",
    },

    addressHint: {
        marginTop: 6,
        color: "#9ca3af",
        fontStyle: "italic",
    },

    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
    },

    callBtn: {
        backgroundColor: "#e0f2fe",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },

    callText: {
        color: "#0284c7",
        fontWeight: "600",
    },

    price: {
        fontWeight: "700",
        fontSize: 15,
    },

    actions: {
        flexDirection: "row",
        marginTop: 14,
    },

    acceptBtn: {
        flex: 1,
        backgroundColor: "#22c55e",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        marginRight: 10,
    },

    rejectBtn: {
        flex: 1,
        backgroundColor: "#ef4444",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },

    btnText: {
        color: "#fff",
        fontWeight: "600",
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: "center",
    },

    emptyIcon: {
        fontSize: 40,
        marginBottom: 10,
    },

    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },

    emptySubtitle: {
        color: "#6b7280",
        textAlign: "center",
    },

    pauseBox: {
        marginTop: 10,
        backgroundColor: "#fef3c7",
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: "#f59e0b",
    },

    pauseTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#92400e",
        marginBottom: 4,
    },

    pauseMeta: {
        fontSize: 12,
        color: "#78350f",
        marginTop: 2,
    },
});
