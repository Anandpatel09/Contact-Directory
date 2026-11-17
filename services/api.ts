
import axios from 'axios';

// JSONPlaceholder contact type
export type ApiContact = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
};

// JSONPlaceholder API instance
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 15000,
});

// Fetch contacts from JSONPlaceholder
export const getContacts = async (): Promise<ApiContact[]> => {
  try {
    const response = await api.get<ApiContact[]>('/users');

    if (!Array.isArray(response.data)) {
      throw new Error('Invalid API response');
    }

    return response.data;
  } catch (error) {
    console.log('JSONPlaceholder API Error:', error);
    throw error;
  }
};
