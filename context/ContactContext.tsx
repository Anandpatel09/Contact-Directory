import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import type { Contact } from '../Components/ContactForm';

import { getContacts } from '../services/api';

import {
  getFavorites,
  getLocalContacts,
  getDeletedContactIds,
  saveFavorites,
  saveLocalContacts,
  saveDeletedContactIds,
} from '../utils/storage';

type ContactContextType = {
  contacts: Contact[];
  apiContacts: Contact[];
  localContacts: Contact[];
  favorites: string[];
  deletedContactIds: string[];

  isLoading: boolean;
  isRefreshing: boolean;
  error: string;

  toggleFavorite: (id: string) => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  updateContact: (contact: Contact) => Promise<void>;
  deleteContact: (contact: Contact) => Promise<void>;
  clearFavorites: () => Promise<void>;
  refreshContacts: () => Promise<void>;
};

const ContactContext = createContext<
  ContactContextType | undefined
>(undefined);

type Props = {
  children: ReactNode;
};

export const ContactProvider = ({ children }: Props) => {
  const [apiContacts, setApiContacts] = useState<Contact[]>([]);
  const [localContacts, setLocalContacts] = useState<Contact[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [deletedContactIds, setDeletedContactIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Fetch API contacts
  const fetchApiContacts = async () => {
    const response = await getContacts();

    const formattedContacts: Contact[] = response.map(user => ({
      id: String(user.id),
      name: user.name,
      phone: user.phone,
      email: user.email,
      image: null,
    }));

    setApiContacts(formattedContacts);
    setError('');
  };

  // Initialize application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Restore saved data first
        const [
          savedFavorites,
          savedLocalContacts,
          savedDeletedIds,
        ] = await Promise.all([
          getFavorites(),
          getLocalContacts(),
          getDeletedContactIds(),
        ]);

        setFavorites(savedFavorites);
        setLocalContacts(savedLocalContacts);
        setDeletedContactIds(savedDeletedIds);

        // Then fetch API contacts
        try {
          await fetchApiContacts();
        } catch (apiError) {
          console.log('API initialization error:', apiError);
          setError(
            'Unable to load contacts. Please check your internet connection.',
          );
        }
      } catch (storageError) {
        console.log('Initialization error:', storageError);
        setError('Unable to restore saved contact data.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // API retry and pull-to-refresh
  const refreshContacts = async () => {
    try {
      setIsRefreshing(true);
      setError('');

      await fetchApiContacts();
    } catch (apiError) {
      console.log('Refresh error:', apiError);
      setError(
        'Unable to refresh contacts. Please try again.',
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Display API and local contacts together
  const visibleApiContacts = apiContacts.filter(
    contact => !deletedContactIds.includes(contact.id),
  );

  const contacts = [
    ...new Map(
      [...visibleApiContacts, ...localContacts].map(contact => [
        contact.id,
        contact,
      ]),
    ).values(),
  ];

  // Favorite functionality
  const toggleFavorite = async (id: string) => {
    const updatedFavorites = favorites.includes(id)
      ? favorites.filter(item => item !== id)
      : [...favorites, id];

    setFavorites(updatedFavorites);

    await saveFavorites(updatedFavorites);
  };

  // Add contact
  const addContact = async (contact: Contact) => {
    const updatedContacts = [
      contact,
      ...localContacts.filter(item => item.id !== contact.id),
    ];

    setLocalContacts(updatedContacts);

    await saveLocalContacts(updatedContacts);
  };

  // Update contact
  const updateContact = async (updatedContact: Contact) => {
    const updatedContacts = localContacts.map(contact =>
      contact.id === updatedContact.id
        ? updatedContact
        : contact,
    );

    setLocalContacts(updatedContacts);

    await saveLocalContacts(updatedContacts);
  };

  // Delete local or API contact
  const deleteContact = async (contact: Contact) => {
    if (contact.id.startsWith('local_')) {
      const updatedContacts = localContacts.filter(
        item => item.id !== contact.id,
      );

      setLocalContacts(updatedContacts);

      await saveLocalContacts(updatedContacts);
    } else {
      const updatedDeletedIds = [
        ...new Set([...deletedContactIds, contact.id]),
      ];

      setDeletedContactIds(updatedDeletedIds);

      await saveDeletedContactIds(updatedDeletedIds);
    }

    // Remove deleted contact from favorites
    const updatedFavorites = favorites.filter(
      id => id !== contact.id,
    );

    setFavorites(updatedFavorites);

    await saveFavorites(updatedFavorites);
  };

  // Clear favorites
  const clearFavorites = async () => {
    setFavorites([]);

    await saveFavorites([]);
  };

  return (
    <ContactContext.Provider
      value={{
        contacts,
        apiContacts,
        localContacts,
        favorites,
        deletedContactIds,
        isLoading,
        isRefreshing,
        error,
        toggleFavorite,
        addContact,
        updateContact,
        deleteContact,
        clearFavorites,
        refreshContacts,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);

  if (!context) {
    throw new Error(
      'useContacts must be used inside ContactProvider',
    );
  }

  return context;
};