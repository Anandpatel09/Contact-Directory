

import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './navigation/AppNavigator';
import { ContactProvider } from './context/ContactContext';
import type { Contact } from './Components/ContactForm';
import { getContacts } from './services/api';

const App = () => {
  // API contacts
  const [apiContacts, setApiContacts] = useState<Contact[]>([]);

  // Locally added contacts
  const [localContacts, setLocalContacts] = useState<Contact[]>([]);

  // Favorite contact IDs
  const [favorites, setFavorites] = useState<string[]>([]);

  // Loading and error
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // LOAD API CONTACTS

  const refreshContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getContacts();

      const formattedContacts: Contact[] = response.map(user => ({
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: null,
      }));

      setApiContacts(formattedContacts);
    } catch (err) {
      console.log('API Error:', err);
      setError('Unable to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // LOAD FAVORITES

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favoriteContacts');

      if (savedFavorites !== null) {
        const favoriteIds: string[] = JSON.parse(savedFavorites);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };

  // SAVE FAVORITES

  const toggleFavorite = async (contactId: string) => {
    let updatedFavorites: string[];

    if (favorites.includes(contactId)) {
      updatedFavorites = favorites.filter(id => id !== contactId);
    } else {
      updatedFavorites = [...favorites, contactId];
    }

    setFavorites(updatedFavorites);

    try {
      await AsyncStorage.setItem(
        'favoriteContacts',
        JSON.stringify(updatedFavorites),
      );
    } catch (error) {
      console.log('Error saving favorites:', error);
    }
  };

  // LOAD LOCAL CONTACTS

  const loadLocalContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('localContacts');

      if (savedContacts !== null) {
        const parsedContacts: Contact[] = JSON.parse(savedContacts);

        setLocalContacts(parsedContacts);
      }
    } catch (error) {
      console.log('Error loading local contacts:', error);
    }
  };

  // SAVE LOCAL CONTACTS

  const saveLocalContacts = async (updatedContacts: Contact[]) => {
    try {
      await AsyncStorage.setItem(
        'localContacts',
        JSON.stringify(updatedContacts),
      );

      console.log('Local contacts saved successfully');
    } catch (error) {
      console.log('Error saving local contacts:', error);
      throw error;
    }
  };

  // ADD LOCAL CONTACT

  const addContact = async (newContact: Contact) => {
    try {
      const phoneExists = [...apiContacts, ...localContacts].some(
        contact => contact.phone === newContact.phone,
      );

      if (phoneExists) {
        Alert.alert('Error', 'This phone number already exists');
        return;
      }

      const updatedContacts = [...localContacts, newContact];

      // Save first, then update state
      await saveLocalContacts(updatedContacts);

      setLocalContacts(updatedContacts);
    } catch (error) {
      console.log('Error adding contact:', error);

      Alert.alert('Error', 'Unable to save contact. Please try again.');
    }
  };

  // UPDATE LOCAL CONTACT

  const updateContact = async (updatedContact: Contact) => {
    try {
      const phoneExists = [...apiContacts, ...localContacts].some(
        contact =>
          contact.phone === updatedContact.phone &&
          contact.id !== updatedContact.id,
      );

      if (phoneExists) {
        Alert.alert('Error', 'This phone number already exists');
        return;
      }

      const updatedContacts = localContacts.map(contact =>
        contact.id === updatedContact.id ? updatedContact : contact,
      );

      await saveLocalContacts(updatedContacts);

      setLocalContacts(updatedContacts);
    } catch (error) {
      console.log('Error updating contact:', error);

      Alert.alert('Error', 'Unable to update contact.');
    }
  };

  // DELETE LOCAL CONTACT
  const deleteContact = async (contactId: string) => {
    try {
      const updatedContacts = localContacts.filter(
        contact => contact.id !== contactId,
      );

      const updatedFavorites = favorites.filter(id => id !== contactId);

      await saveLocalContacts(updatedContacts);

      await AsyncStorage.setItem(
        'favoriteContacts',
        JSON.stringify(updatedFavorites),
      );

      setLocalContacts(updatedContacts);
      setFavorites(updatedFavorites);
    } catch (error) {
      console.log('Error deleting contact:', error);
    }
  };

  // COMBINE API AND LOCAL CONTACTS

  const allContacts = [
    ...new Map(
      [...apiContacts, ...localContacts].map(contact => [
        contact.phone,
        contact,
      ]),
    ).values(),
  ];

  // LOAD ALL DATA WHEN APP OPENS

  useEffect(() => {
    refreshContacts();
    loadFavorites();
    loadLocalContacts();
  }, []);

  // PROVIDER

  return (
    <ContactProvider
      contacts={allContacts}
      favorites={favorites}
      loading={loading}
      error={error}
      addContact={addContact}
      updateContact={updateContact}
      deleteContact={deleteContact}
      toggleFavorite={toggleFavorite}
      refreshContacts={refreshContacts}
    >
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ContactProvider>
  );
};

export default App;
