import AppText from '@/components/AppText';
import { colors } from '@/constants/theme';
import { useGetProfileQuery } from '@/services/userApi';
import { useGetVendorReviewsQuery } from '@/services/reviewApi';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

function StarRating({ rating }: { rating: number }) {
    return (
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Text key={i} style={[styles.star, i <= rating ? styles.starFilled : styles.starEmpty]}>
                    ★
                </Text>
            ))}
        </View>
    );
}

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReviewsScreen() {
    const [page, setPage] = useState(1);
    const { data: profileData, isLoading: profileLoading } = useGetProfileQuery(undefined);
    const vendorId = profileData?.vendor?._id;

    const { data, isLoading, isFetching } = useGetVendorReviewsQuery(
        { vendorId, page, limit: 10 },
        { skip: !vendorId }
    );

    if (profileLoading || (!data && isLoading)) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const reviews = data?.reviews || [];
    const totalPages = data?.totalPages || 1;
    const totalReviews = data?.totalReviews || 0;
    const averageRating = data?.averageRating || 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <AppText weight="semiBold" type="subTitle" style={styles.title}>
                Reviews
            </AppText>

            {/* Summary */}
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
                                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Review list */}
            {reviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyTitle}>No reviews yet</Text>
                    <Text style={styles.emptySubtitle}>Reviews from customers will appear here</Text>
                </View>
            ) : (
                reviews.map((review: any) => (
                    <View key={review._id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </Text>
                            </View>
                            <View style={styles.cardHeaderText}>
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

            {/* Pagination */}
            {totalPages > 1 && (
                <View style={styles.pagination}>
                    <TouchableOpacity
                        style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                        onPress={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isFetching}
                    >
                        <Text style={styles.pageBtnText}>← Prev</Text>
                    </TouchableOpacity>

                    <Text style={styles.pageInfo}>
                        {page} / {totalPages}
                    </Text>

                    <TouchableOpacity
                        style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                        onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isFetching}
                    >
                        <Text style={styles.pageBtnText}>Next →</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: 16,
    },

    // Summary card
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 1,
    },
    summaryLeft: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    avgRating: {
        fontSize: 40,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 48,
    },
    totalReviews: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 16,
    },
    summaryRight: {
        flex: 2,
        justifyContent: 'center',
        gap: 6,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    barLabel: {
        fontSize: 12,
        color: '#6b7280',
        width: 24,
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

    // Stars
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    star: {
        fontSize: 16,
    },
    starFilled: {
        color: '#f59e0b',
    },
    starEmpty: {
        color: '#d1d5db',
    },

    // Review card
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    cardHeaderText: {
        flex: 1,
    },
    reviewerName: {
        fontWeight: '600',
        fontSize: 14,
        color: '#111827',
    },
    reviewDate: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 1,
    },
    comment: {
        marginTop: 10,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },

    // Empty state
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        color: '#111827',
    },
    emptySubtitle: {
        color: '#6b7280',
        textAlign: 'center',
    },

    // Pagination
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginTop: 20,
    },
    pageBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },
    pageBtnDisabled: {
        backgroundColor: '#e5e7eb',
    },
    pageBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    pageInfo: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },
});
