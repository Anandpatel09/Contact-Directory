import axios from 'axios';
import type { ApiContact, Contact } from '../types/contact';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getContacts = async (): Promise<Contact[]> => {
  const response = await api.get<ApiContact[]>('/users');

  // Check HTTP response
  if (response.status < 200 || response.status >= 300) {
    throw new Error('Failed to fetch contacts');
  }

  // Convert API data into the Contact format used by our app
  const contacts: Contact[] = response.data.map(user => ({
    id: String(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: null,
  }));

  return contacts;
};

export default api;
