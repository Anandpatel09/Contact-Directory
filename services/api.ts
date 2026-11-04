import axios from 'axios';
import type { ApiContact, Contact } from '../types/contact';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  // timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getContacts = async (): Promise<Contact[]> => {
  const response = await api.get<Contact[]>('/users');
  console.log('res', response);

  // Check HTTP response
  if (response.status !== 200) {
    throw new Error('Failed to fetch contacts');
  }
  return response.data;
};

export default api;
