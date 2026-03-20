

import { baseApi } from "./baseApi";

export const vendorSubscriptionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
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
    useGetVendorSubscriptionsQuery,
    useAcceptSubscriptionMutation,
    useRejectSubscriptionMutation
} = vendorSubscriptionApi;


