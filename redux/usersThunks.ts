
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
}

export interface UsersApiResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

type FetchUsersParams = {
  skip: number;
  limit: number;
};

export const fetchUsers = createAsyncThunk<
  UsersApiResponse,
  FetchUsersParams,
  { rejectValue: string }
>('users/fetchUsers', async ({ skip, limit }, { rejectWithValue }) => {
  try {
    const response = await axios.get<UsersApiResponse>(
      'https://dummyjson.com/users',
      {
        params: {
          limit,
          skip,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Unable to fetch users',
      );
    }

    return rejectWithValue('Something went wrong');
  }
});
