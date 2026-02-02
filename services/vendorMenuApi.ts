import { baseApi } from "./baseApi";

export const vendorMenuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWeeklyMenu: builder.query({
            query: () => '/vendors/menu',
            providesTags: ['Menu'],
        }),

        saveWeeklyMenu: builder.mutation({
            query: (data) => ({
                url: '/vendors/menu',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Menu'],
        }),
    }),
});

export const {
    useGetWeeklyMenuQuery,
    useSaveWeeklyMenuMutation,
} = vendorMenuApi;
