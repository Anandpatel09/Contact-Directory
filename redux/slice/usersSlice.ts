
import { createSlice } from '@reduxjs/toolkit';

import {
  fetchUsers,
  User,
} from '../usersThunks';

interface UsersState {
  users: User[];
  total: number;
  skip: number;
  limit: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  loadingMore: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  total: 0,
  skip: 0,
  limit: 10,
  status: 'idle',
  loadingMore: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',

  initialState,

  reducers: {

    // Reset all users

    resetUsers: state => {
      state.users = [];
      state.total = 0;
      state.skip = 0;
      state.limit = 10;
      state.status = 'idle';
      state.loadingMore = false;
      state.error = null;
    },

  },

  extraReducers: builder => {

    builder

      // PENDING

      .addCase(fetchUsers.pending, (state, action) => {

        if (action.meta.arg.skip === 0) {

          // Initial API request

          state.status = 'loading';
          state.error = null;

        } else {

          // Loading next page

          state.loadingMore = true;
          state.error = null;

        }

      })


      // FULFILLED

      .addCase(fetchUsers.fulfilled, (state, action) => {

        const {
          users,
          total,
          skip,
          limit,
        } = action.payload;

        if (skip === 0) {

          // First page: replace users

          state.users = users;

        } else {

          // Next pages: append new users

          const existingIds = new Set(
            state.users.map(user => user.id),
          );

          const newUsers = users.filter(
            user => !existingIds.has(user.id),
          );

          state.users = [
            ...state.users,
            ...newUsers,
          ];

        }

        // Update pagination information

        state.total = total;

        state.skip = skip + users.length;

        state.limit = limit;

        // Update loading states

        state.status = 'succeeded';

        state.loadingMore = false;

        state.error = null;

      })


      // REJECTED

      .addCase(fetchUsers.rejected, (state, action) => {

        const errorMessage =
          action.payload || 'Unable to fetch users';

        if (action.meta.arg.skip === 0) {

          // Initial API error

          state.status = 'failed';

        } else {

          // Pagination API error

          state.loadingMore = false;

        }

        state.error = errorMessage;

      });

  },

});

export const { resetUsers } = usersSlice.actions;

export default usersSlice.reducer;