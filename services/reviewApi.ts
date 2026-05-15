import { baseApi } from './baseApi';

export const reviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getVendorReviews: builder.query<any, { vendorId: string; page?: number; limit?: number }>({
            query: ({ vendorId, page = 1, limit = 10 }) =>
                `/reviews/vendor/${vendorId}?page=${page}&limit=${limit}`,
        }),
    }),
});

export const { useGetVendorReviewsQuery } = reviewApi;
