import { baseApi } from "./baseApi";

export const vendorPlanApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPlans: builder.query({
            query: () => "/vendors/plans",
            providesTags: ["Plans"],
        }),

        updatePlans: builder.mutation({
            query: (data) => ({
                url: "/vendors/plans",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Plans"],
        }),
    }),
});

export const { useGetPlansQuery, useUpdatePlansMutation } = vendorPlanApi;