import axios from 'axios';
import { useEffect } from 'react';

// JSONPlaceholder contact type
export type ApiContact = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
};

// DummyJSON user type
export type ApiUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
};

// DummyJSON pagination response
type UsersResponse = {
  users: ApiUser[];
  total: number;
  skip: number;
  limit: number;
};

// JSONPlaceholder API instance
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  // timeout: 15000,
});

// DummyJSON API instance
const dummyApi = axios.create({
  baseURL: 'https://dummyjson.com',
  // timeout: 15000,
});

// Fetch contacts from JSONPlaceholder
export const getContacts = async (): Promise<ApiContact[]> => {
  try {
    const response = await api.get<ApiContact[]>('/users');

    if (response.status !== 200) {
      throw new Error('Unable to fetch contacts');
    }

    if (!Array.isArray(response.data)) {
      throw new Error('Invalid API response');
    }

    return response.data;
  } catch (error) {
    console.log('Contact API Error:', error);
    throw error;
  }
};

// Fetch paginated users from DummyJSON
export const getUsers = async (
  limit: number,
  skip: number,
): Promise<UsersResponse> => {
  try {
    const response = await dummyApi.get<UsersResponse>('/users', {
      params: {
        limit: limit,
        skip: skip,
      },
    });

    return response.data;
  } catch (error) {
    console.log('Users API Error:', error);
    throw error;
  }
};

// search api

export const searchUsers = async (
  query: string,
  limit: number,
  skip: number,
): Promise<UsersResponse> => {
  try {
    const response = await dummyApi.get<UsersResponse>('/users/search', {
      params: {
        q: query,
        limit: limit,
        skip: skip,
      },
    });

    return response.data;
  } catch (error) {
    console.log('Search API Error:', error);
    throw error;
  }
};
