import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './navigation/AppNavigator';
import { ContactProvider } from './context/ContactContext';
import type { Contact } from './Components/ContactForm';

// Initial contacts
const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'Anand Patel',
    phone: '9876543210',
    image: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '2',
    name: 'Ankit Verma',
    phone: '9876543211',
    image: 'https://i.pravatar.cc/150?img=13',
  },
  {
    id: '3',
    name: 'Suyash Singh',
    phone: '9876582320',
    image: 'https://i.pravatar.cc/150?img=14',
  },
  {
    id: '4',
    name: 'Raj Mishra',
    phone: '9876508211',
    image: null,
  },
  {
    id: '5',
    name: 'Dhruv Gond',
    phone: '9976054321',
    image: null,
  },
  {
    id: '6',
    name: 'Sneha Joshi',
    phone: '9776543201',
    image: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: '7',
    name: 'Shahi Ankit',
    phone: '9845653210',
    image: 'https://i.pravatar.cc/150?img=51',
  },
  {
    id: '8',
    name: 'Anuj Yadav',
    phone: '9876543881',
    image: 'https://i.pravatar.cc/150?img=60',
  },
];

const App = () => {
  // Store all contacts
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  // Store favorite contact IDs
  const [favorites, setFavorites] = useState<string[]>([]);

  return (
    <ContactProvider
      contacts={contacts}
      setContacts={setContacts}
      favorites={favorites}
      setFavorites={setFavorites}
    >
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ContactProvider>
  );
};

export default App;
