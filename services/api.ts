// import axios from 'axios';
// import type { ApiContact } from '../types/contact';

// const api = axios.create({
//   baseURL: 'https://jsonplaceholder.typicode.com',
//   // timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export const getContacts = async (): Promise<ApiContact[]> => {
//   const response = await api.get<ApiContact[]>('/users');

//   // Check HTTP response
//   if (response.status !== 200) {
//     throw new Error('Failed to fetch contacts');
//   }
//   return response.data;
// };

// export default api;

import axios from 'axios';

export type ApiContact = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
};

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 15000,
});

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
    console.log('API Error:', error);
    throw error;
  }
};
