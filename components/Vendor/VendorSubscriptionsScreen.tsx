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

export default function VendorSubscriptionsScreen() {
    const { data, isLoading } = useGetVendorSubscriptionsQuery(undefined);
    const [filter, setFilter] = useState<"pending" | "accepted" | "rejected">("pending");
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
                {["pending", "accepted", "rejected"].map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => setFilter(item as any)}
                        style={[
                            styles.filterBtn,
                            filter === item && styles.filterActive,
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
                                    ]}
                                >
                                    <Text style={styles.badgeText}>
                                        {sub.status === "accepted"
                                            ? "Accepted"
                                            : sub.status === "pending"
                                                ? "Pending"
                                                : "Rejected"}
                                    </Text>
                                </View>
                            </View>

                            {/* PLAN */}
                            <Text style={styles.plan}>
                                {sub.planType === "weekly"
                                    ? "Weekly Plan • 7 Days"
                                    : "Monthly Plan • 30 Days"}
                            </Text>

                            {/* ADDRESS */}
                            {sub.status === "accepted" && sub.user?.address ? (
                                <Text style={styles.address}>
                                    {sub.user.address.line1}, {sub.user.address.city},{" "}
                                    {sub.user.address.state}
                                </Text>
                            ) : (
                                <Text style={styles.addressHint}>
                                    Address visible after accepting
                                </Text>
                            )}

                            {/* ACTION ROW */}
                            <View style={styles.bottomRow}>
                                {/* CALL BUTTON */}
                                <TouchableOpacity
                                    style={styles.callBtn}
                                    onPress={() => handleCall(sub.user?.phone)}
                                >
                                    <Text style={styles.callText}>📞 Call</Text>
                                </TouchableOpacity>

                                <Text style={styles.price}>₹{sub.price}</Text>
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
});