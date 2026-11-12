import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import type { Contact } from '../Components/ContactForm';

import { getContacts, getUsers, searchUsers } from '../services/api';
import {
  getFavorites,
  getLocalContacts,
  getDeletedContactIds,
  saveFavorites,
  saveLocalContacts,
  saveDeletedContactIds,
} from '../utils/storage';
import { Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

type ContactContextType = {
  contacts: Contact[];
  apiContacts: Contact[];
  localContacts: Contact[];
  favorites: string[];
  deletedContactIds: string[];
  searchResults: Contact[];
  isSearching: boolean;

  isLoading: boolean;
  isRefreshing: boolean;
  error: string;
  isLoadingMore: boolean;
  hasMore: boolean;

  clearSearchResults: () => void;
  searchContacts: (query: string) => Promise<void>;
  loadMoreContacts: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  updateContact: (contact: Contact) => Promise<void>;
  deleteContact: (contact: Contact) => Promise<void>;
  clearFavorites: () => Promise<void>;
  refreshContacts: () => Promise<void>;
};

const ContactContext = createContext<ContactContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const ContactProvider = ({ children }: Props) => {
  const [apiContacts, setApiContacts] = useState<Contact[]>([]);
  const [localContacts, setLocalContacts] = useState<Contact[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [deletedContactIds, setDeletedContactIds] = useState<string[]>([]);
  const [jsonPlaceholderContacts, setJsonPlaceholderContacts] = useState<
    Contact[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Stores how many API users have already been fetched
  const skipRef = useRef(0);

  // Prevents multiple API requests at the same time
  const requestInProgressRef = useRef(false);

  // Keeps the latest hasMore value available to callbacks
  const hasMoreRef = useRef(true);

  const LIMIT = 10;

  // Current search query
  const searchQueryRef = useRef('');

  // Search pagination
  const searchSkipRef = useRef(0);
  const searchHasMoreRef = useRef(true);

  // Prevent duplicate search pagination requests
  const searchRequestRef = useRef(false);

  // Fetch API contacts from user end point api

  const fetchContactsUsersApi = async () => {
    try {
      const response = await getContacts();

      const formattedContacts: Contact[] = response.map(user => ({
        id: `users_${user.id}`,
        name: user.name,
        phone: user.phone,
        email: user.email,
        image: null,
      }));

      setJsonPlaceholderContacts(formattedContacts);
    } catch (error) {
      console.log('JSONPlaceholder API error:', error);
      throw error;
    }
  };

  // search function
  const searchContacts = async (query: string) => {
    // const searchText = query.trim();
    console.log('queryhuhcjd cndjc dcndncd cdcd cdncndcdc d', query);
    const searchText = query.trim();
    console.log('Search Text cndjc dcndncd cdcd cdncndcdc d', searchText);

    searchQueryRef.current = searchText;

    // Reset search pagination
    searchSkipRef.current = 0;
    searchHasMoreRef.current = true;

    // Remove previous search results
    setSearchResults([]);

    if (searchText === '') {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await searchUsers(searchText, LIMIT, 0);

      // Ignore results from an older search query
      if (searchQueryRef.current !== searchText) {
        return;
      }
      const mappedContacts: Contact[] = response.users.map(user => ({
        id: String(user.id),
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        email: user.email,
        image: user.image,
      }));

      setSearchResults(mappedContacts);

      searchSkipRef.current = response.skip + response.users.length;

      searchHasMoreRef.current = searchSkipRef.current < response.total;
    } catch (error) {
      if (searchQueryRef.current === searchText) {
        console.log('Search failed:', error);
        setError('Unable to search contacts. Please try again.');
      }
    } finally {
      if (searchQueryRef.current === searchText) {
        setIsSearching(false);
      }
    }
  };

  // Fetch first 10 users from DummyJSON
  const fetchApiContacts = async () => {
    if (requestInProgressRef.current) {
      return;
    }

    requestInProgressRef.current = true;

    try {
      const response = await getUsers(LIMIT, 0);

      const formattedContacts: Contact[] = response.users.map(user => ({
        id: String(user.id),
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        email: user.email,
        image: user.image,
      }));

      // Replace API contacts with the first page
      setApiContacts(formattedContacts);

      // Update pagination information
      skipRef.current = response.users.length;

      const moreAvailable = skipRef.current < response.total;

      setHasMore(moreAvailable);
      hasMoreRef.current = moreAvailable;
    } catch (error) {
      console.log('API Error:', error);
      throw error;
    } finally {
      requestInProgressRef.current = false;
    }
  };
  const visibleJsonPlaceholderContacts = jsonPlaceholderContacts.filter(
    contact => !deletedContactIds.includes(contact.id),
  );

  // Fetch next 10 users when FlatList reaches the bottom

  const loadMoreContacts = async () => {
    // Check whether the user is searching
    const currentQuery = searchQueryRef.current;

    // SEARCH PAGINATION

    if (currentQuery !== '') {
      // Prevent duplicate search requests
      if (searchRequestRef.current || !searchHasMoreRef.current) {
        return;
      }

      searchRequestRef.current = true;
      setIsLoadingMore(true);

      try {
        // Fetch the next page of search results
        const response = await searchUsers(
          currentQuery,
          LIMIT,
          searchSkipRef.current,
        );

        // Ignore response if the search query has changed
        if (searchQueryRef.current !== currentQuery) {
          return;
        }

        // Convert API users into Contact objects
        const formattedContacts: Contact[] = response.users.map(user => ({
          id: String(user.id),
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          email: user.email,
          image: user.image,
        }));

        // Append new results and avoid duplicate IDs
        setSearchResults(previousContacts => {
          const existingIds = new Set(
            previousContacts.map(contact => contact.id),
          );

          const newContacts = formattedContacts.filter(
            contact => !existingIds.has(contact.id),
          );

          return [...previousContacts, ...newContacts];
        });

        // Update search pagination
        searchSkipRef.current = response.skip + response.users.length;

        // Check whether more search results are available
        searchHasMoreRef.current = searchSkipRef.current < response.total;
      } catch (error) {
        console.log('Search pagination error:', error);
      } finally {
        searchRequestRef.current = false;
        setIsLoadingMore(false);
      }

      return;
    }

    // NORMAL CONTACT PAGINATION

    // Prevent duplicate normal requests
    if (requestInProgressRef.current || !hasMoreRef.current || isLoading) {
      return;
    }

    requestInProgressRef.current = true;
    setIsLoadingMore(true);

    try {
      // Fetch the next page of normal contacts
      const response = await getUsers(LIMIT, skipRef.current);

      // Convert API users into Contact objects
      const formattedContacts: Contact[] = response.users.map(user => ({
        id: String(user.id),
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        email: user.email,
        image: user.image,
      }));

      // Append new contacts and avoid duplicate IDs
      setApiContacts(previousContacts => {
        const existingIds = new Set(
          previousContacts.map(contact => contact.id),
        );

        const newContacts = formattedContacts.filter(
          contact => !existingIds.has(contact.id),
        );

        return [...previousContacts, ...newContacts];
      });

      // Update normal pagination
      skipRef.current += response.users.length;

      // Check whether more contacts are available
      const moreAvailable = skipRef.current < response.total;

      setHasMore(moreAvailable);
      hasMoreRef.current = moreAvailable;
    } catch (error) {
      console.log('Load more contacts error:', error);
    } finally {
      setIsLoadingMore(false);
      requestInProgressRef.current = false;
    }
  };

  // Initialize application

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [savedFavorites, savedLocalContacts, savedDeletedIds] =
          await Promise.all([
            getFavorites(),
            getLocalContacts(),
            getDeletedContactIds(),
          ]);

        setFavorites(savedFavorites);
        setLocalContacts(savedLocalContacts);
        setDeletedContactIds(savedDeletedIds);

        // Fetch data from both APIs
        await Promise.all([fetchApiContacts(), fetchContactsUsersApi()]);
      } catch (error) {
        console.log('Initialization error:', error);
        setError('Unable to initialize contacts.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Pull-to-refresh: fetch the first page again

  const refreshContacts = async () => {
    if (requestInProgressRef.current) {
      return;
    }

    requestInProgressRef.current = true;
    setIsRefreshing(true);
    // setError('');

    try {
      const [dummyResponse, jsonResponse] = await Promise.all([
        getUsers(LIMIT, 0),
        getContacts(),
      ]);

      // Format DummyJSON contacts
      const formattedDummyContacts: Contact[] = dummyResponse.users.map(
        user => ({
          id: String(user.id),
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          email: user.email,
          image: user.image,
        }),
      );

      // Format JSONPlaceholder contacts
      const formattedJsonContacts: Contact[] = jsonResponse.map(user => ({
        id: `users_${user.id}`,
        name: user.name,
        phone: user.phone,
        email: user.email,
        image: null,
      }));

      // Replace old API data
      setApiContacts(formattedDummyContacts);
      setJsonPlaceholderContacts(formattedJsonContacts);
      // Clear error only after both APIs succeed
      setError('');
      // Reset pagination
      skipRef.current = dummyResponse.users.length;

      const moreAvailable = skipRef.current < dummyResponse.total;

      setHasMore(moreAvailable);
      hasMoreRef.current = moreAvailable;
    } catch (error) {
      console.log('Refresh error:', error);

      setError(
        'Unable to refresh contacts. Please check your internet connection.',
      );

      Alert.alert(
        'Refresh Failed',
        'Unable to refresh contacts. Please check your internet connection.',
      );
    } finally {
      requestInProgressRef.current = false;
      setIsRefreshing(false);
    }
  };

  // Display API and local contacts together
  const visibleApiContacts = apiContacts.filter(
    contact => !deletedContactIds.includes(contact.id),
  );

  const contacts = [
    ...new Map(
      [
        ...localContacts,
        ...visibleJsonPlaceholderContacts,
        ...visibleApiContacts,
      ].map(contact => [contact.id, contact]),
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
      contact.id === updatedContact.id ? updatedContact : contact,
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
    const updatedFavorites = favorites.filter(id => id !== contact.id);

    setFavorites(updatedFavorites);

    await saveFavorites(updatedFavorites);
  };
  // cleare search
  const clearSearchResults = () => {
    // Clear the current search query
    searchQueryRef.current = '';

    // Remove previous search results
    setSearchResults([]);

    // Reset search loading state
    setIsSearching(false);

    // Reset search pagination
    searchSkipRef.current = 0;
    searchHasMoreRef.current = true;
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
        isLoadingMore,
        hasMore,
        searchResults,
        isSearching,
        searchContacts,
        clearSearchResults,
        loadMoreContacts,
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
    throw new Error('useContacts must be used inside ContactProvider');
  }

  return context;
};
