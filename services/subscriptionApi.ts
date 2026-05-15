

import { baseApi } from "./baseApi";

export const vendorSubscriptionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getVendorOverview: builder.query({
            query: () => "/subscriptions/vendor/overview",
            providesTags: ["Subscriptions"],
        }),

        getVendorSubscriptions: builder.query({
            query: () => "/subscriptions/vendor",
            providesTags: ["Subscriptions"],
        }),

        acceptSubscription: builder.mutation({
            query: (id) => ({
                url: `/subscriptions/${id}/accept`,
                method: "PATCH",
            }),
            invalidatesTags: ["Subscriptions"],
        }),

        rejectSubscription: builder.mutation({
            query: (id) => ({
                url: `/subscriptions/${id}/reject`,
                method: "PATCH",
            }),
            invalidatesTags: ["Subscriptions"],
        }),
    }),
});

export const {
    useGetVendorOverviewQuery,
    useGetVendorSubscriptionsQuery,
    useAcceptSubscriptionMutation,
    useRejectSubscriptionMutation
} = vendorSubscriptionApi;


