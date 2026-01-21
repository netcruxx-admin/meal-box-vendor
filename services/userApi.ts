import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query({
            query: () => '/vendors/me',
            providesTags: ['User'],
        }),

        updateProfile: builder.mutation({
            query: (data) => ({
                url: '/vendors/me',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'], // 🔥 auto refetch profile
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
} = userApi;
