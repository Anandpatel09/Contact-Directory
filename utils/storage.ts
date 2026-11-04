import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Contact } from '../Components/ContactForm';

const FAVORITES_KEY = '@contact_directory_favorites';

const LOCAL_CONTACTS_KEY = '@contact_directory_local_contacts';

const DELETED_CONTACTS_KEY = '@contact_directory_deleted_contacts';

// Safely read JSON data
const getStoredData = async (key: string): Promise<unknown> => {
  try {
    const value = await AsyncStorage.getItem(key);

    if (value === null) {
      return [];
    }

    return JSON.parse(value);
  } catch (error) {
    console.log('Storage read error:', error);
    return [];
  }
};

// Validate stored contacts
const isValidContact = (item: unknown): item is Contact => {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const contact = item as Record<string, unknown>;

  return (
    typeof contact.id === 'string' &&
    typeof contact.name === 'string' &&
    typeof contact.phone === 'string' &&
    (contact.email === undefined ||
      typeof contact.email === 'string') &&
    (contact.image === null ||
      typeof contact.image === 'string')
  );
};

//FAVORITES 

export const saveFavorites = async (
  favorites: string[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(favorites),
    );
  } catch (error) {
    console.log('Error saving favorites:', error);
    throw error;
  }
};

export const getFavorites = async (): Promise<string[]> => {
  const data = await getStoredData(FAVORITES_KEY);

  if (!Array.isArray(data)) {
    return [];
  }

  return Array.from(
    new Set(
      data.filter(
        (item): item is string => typeof item === 'string',
      ),
    ),
  );
};

// LOCAL CONTACTS 

export const saveLocalContacts = async (
  contacts: Contact[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      LOCAL_CONTACTS_KEY,
      JSON.stringify(contacts),
    );
  } catch (error) {
    console.log('Error saving local contacts:', error);
    throw error;
  }
};

export const getLocalContacts = async (): Promise<Contact[]> => {
  const data = await getStoredData(LOCAL_CONTACTS_KEY);

  if (!Array.isArray(data)) {
    return [];
  }

  const validContacts = data.filter(isValidContact);

  // Remove duplicate contact IDs
  return Array.from(
    new Map(
      validContacts.map(contact => [contact.id, contact]),
    ).values(),
  );
};

// DELETED API CONTACTS 

export const saveDeletedContactIds = async (
  ids: string[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      DELETED_CONTACTS_KEY,
      JSON.stringify(ids),
    );
  } catch (error) {
    console.log('Error saving deleted IDs:', error);
    throw error;
  }
};


export const getDeletedContactIds = async (): Promise<string[]> => {
  const data = await getStoredData(DELETED_CONTACTS_KEY);

  if (!Array.isArray(data)) {
    return [];
  }

  return Array.from(
    new Set(
      data.filter(
        (item): item is string => typeof item === 'string',
      ),
    ),
  );
};