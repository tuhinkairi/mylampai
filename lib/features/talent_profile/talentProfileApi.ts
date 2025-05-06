/*NOT USING THIS APPROACH CURRENTLY*/

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setId, setBio, setTitle } from './talentProfileSlice';

export const profileApi = createApi({
  reducerPath: 'talentProfileApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: (userId) => `/profiles/${userId}`,
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update Redux store with fetched profile data
          dispatch(setId(data.id));
          dispatch(setBio(data.bio));
          // Dispatch other actions to update store
        } catch (err) {
          // Handle error
        }
      }
    }),
    updateProfile: builder.mutation({
      query: (profile) => ({
        url: `/profiles/${profile.id}`,
        method: 'PUT',
        body: profile,
      }),
      // Optional: Optimistic updates
      async onQueryStarted(profile, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          // Handle error, potentially roll back optimistic updates
        }
      }
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;