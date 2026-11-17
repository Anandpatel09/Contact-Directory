// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';

// import type { ReactNode } from 'react';
// import { Alert } from 'react-native';

// import type { Contact } from '../Components/ContactForm';

// import { getContacts, getUsers, searchUsers } from '../services/api';

// import { getDeletedContactIds, saveDeletedContactIds } from '../utils/storage';

// // Number of contacts fetched in one API request
// const LIMIT = 10;

// // Context type
// type ContactContextType = {
//   contacts: Contact[];
//   apiContacts: Contact[];
//   deletedContactIds: string[];

//   searchResults: Contact[];
//   isSearching: boolean;

//   isLoading: boolean;
//   isRefreshing: boolean;
//   isLoadingMore: boolean;
//   hasMore: boolean;
//   error: string;

//   searchContacts: (query: string) => Promise<void>;
//   clearSearchResults: () => void;
//   loadMoreContacts: () => Promise<void>;
//   refreshContacts: () => Promise<void>;
//   deleteContact: (contact: Contact) => Promise<void>;
// };

// // Create Context
// const ContactContext = createContext<ContactContextType | undefined>(undefined);

// type Props = {
//   children: ReactNode;
// };

// // Contact Provider
// export const ContactProvider = ({ children }: Props) => {
//   // API contacts from DummyJSON
//   const [apiContacts, setApiContacts] = useState<Contact[]>([]);

//   // API contacts from JSONPlaceholder
//   const [jsonPlaceholderContacts, setJsonPlaceholderContacts] = useState<
//     Contact[]
//   >([]);

//   // IDs of API contacts deleted by the user
//   const [deletedContactIds, setDeletedContactIds] = useState<string[]>([]);

//   // Loading states
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);

//   // Error state
//   const [error, setError] = useState('');

//   // Pagination state
//   const [hasMore, setHasMore] = useState(true);

//   // Search state
//   const [searchResults, setSearchResults] = useState<Contact[]>([]);
//   const [isSearching, setIsSearching] = useState(false);

//   // Keep track of pagination
//   const skipRef = useRef(0);
//   const hasMoreRef = useRef(true);

//   // Prevent duplicate API requests
//   const requestInProgressRef = useRef(false);

//   // Search query and pagination
//   const searchQueryRef = useRef('');
//   const searchSkipRef = useRef(0);
//   const searchHasMoreRef = useRef(true);
//   const searchRequestRef = useRef(false);

//   // Convert DummyJSON users into Contact objects
//   const formatDummyJSONContacts = (users: any[]): Contact[] => {
//     return users.map(user => ({
//       id: String(user.id),
//       name: `${user.firstName} ${user.lastName}`,
//       phone: user.phone,
//       email: user.email,
//       image: user.image,
//     }));
//   };

//   // Convert JSONPlaceholder users into Contact objects
//   const formatJSONPlaceholderContacts = (users: any[]): Contact[] => {
//     return users.map(user => ({
//       id: `users_${user.id}`,
//       name: user.name,
//       phone: user.phone,
//       email: user.email,
//       image: null,
//     }));
//   };

//   // Fetch first page of DummyJSON contacts
//   const fetchApiContacts = useCallback(async () => {
//     const response = await getUsers(LIMIT, 0);

//     const formattedContacts = formatDummyJSONContacts(response.users);

//     setApiContacts(formattedContacts);

//     skipRef.current = response.users.length;

//     const moreAvailable = skipRef.current < response.total;

//     setHasMore(moreAvailable);
//     hasMoreRef.current = moreAvailable;
//   }, []);

//   // Fetch JSONPlaceholder contacts
//   const fetchJSONPlaceholderContacts = useCallback(async () => {
//     const response = await getContacts();

//     const formattedContacts = formatJSONPlaceholderContacts(response);

//     setJsonPlaceholderContacts(formattedContacts);
//   }, []);

//   // Initialize Context data
//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         // Restore deleted API contact IDs
//         const savedDeletedIds = await getDeletedContactIds();

//         setDeletedContactIds(savedDeletedIds);

//         // Fetch data from both APIs
//         await Promise.all([fetchApiContacts(), fetchJSONPlaceholderContacts()]);
//       } catch (error) {
//         console.log('Initialization error:', error);
//         setError('Unable to load contacts. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     initializeApp();
//   }, [fetchApiContacts, fetchJSONPlaceholderContacts]);

//   // Search contacts
//   const searchContacts = useCallback(async (query: string) => {
//     const searchText = query.trim();

//     // Save the latest search query
//     searchQueryRef.current = searchText;

//     // Reset search pagination
//     searchSkipRef.current = 0;
//     searchHasMoreRef.current = true;

//     // Clear previous results
//     setSearchResults([]);

//     if (searchText === '') {
//       setIsSearching(false);
//       return;
//     }

//     setIsSearching(true);
//     setError('');

//     try {
//       const response = await searchUsers(searchText, LIMIT, 0);

//       // Ignore results from an older search
//       if (searchQueryRef.current !== searchText) {
//         return;
//       }

//       const formattedContacts: Contact[] = response.users.map(user => ({
//         id: String(user.id),
//         name: `${user.firstName} ${user.lastName}`,
//         phone: user.phone,
//         email: user.email,
//         image: user.image,
//       }));

//       setSearchResults(formattedContacts);

//       searchSkipRef.current = response.skip + response.users.length;

//       searchHasMoreRef.current = searchSkipRef.current < response.total;
//     } catch (error) {
//       if (searchQueryRef.current === searchText) {
//         console.log('Search error:', error);
//         setError('Unable to search contacts. Please try again.');
//       }
//     } finally {
//       if (searchQueryRef.current === searchText) {
//         setIsSearching(false);
//       }
//     }
//   }, []);

//   // Clear search results
//   const clearSearchResults = useCallback(() => {
//     searchQueryRef.current = '';

//     setSearchResults([]);
//     setIsSearching(false);

//     searchSkipRef.current = 0;
//     searchHasMoreRef.current = true;
//   }, []);

//   // Load more contacts
//   const loadMoreContacts = useCallback(async () => {
//     const currentQuery = searchQueryRef.current;

//     // SEARCH PAGINATION
//     if (currentQuery !== '') {
//       if (searchRequestRef.current || !searchHasMoreRef.current) {
//         return;
//       }

//       searchRequestRef.current = true;
//       setIsLoadingMore(true);

//       try {
//         const response = await searchUsers(
//           currentQuery,
//           LIMIT,
//           searchSkipRef.current,
//         );

//         // Ignore outdated search response
//         if (searchQueryRef.current !== currentQuery) {
//           return;
//         }

//         const formattedContacts: Contact[] = response.users.map(user => ({
//           id: String(user.id),
//           name: `${user.firstName} ${user.lastName}`,
//           phone: user.phone,
//           email: user.email,
//           image: user.image,
//         }));

//         // Avoid duplicate contacts
//         setSearchResults(previousContacts => {
//           const existingIds = new Set(
//             previousContacts.map(contact => contact.id),
//           );

//           const newContacts = formattedContacts.filter(
//             contact => !existingIds.has(contact.id),
//           );

//           return [...previousContacts, ...newContacts];
//         });

//         searchSkipRef.current = response.skip + response.users.length;

//         searchHasMoreRef.current = searchSkipRef.current < response.total;
//       } catch (error) {
//         console.log('Search pagination error:', error);
//       } finally {
//         searchRequestRef.current = false;
//         setIsLoadingMore(false);
//       }

//       return;
//     }

//     // NORMAL CONTACT PAGINATION
//     if (requestInProgressRef.current || !hasMoreRef.current || isLoading) {
//       return;
//     }

//     requestInProgressRef.current = true;
//     setIsLoadingMore(true);

//     try {
//       const response = await getUsers(LIMIT, skipRef.current);

//       const formattedContacts = formatDummyJSONContacts(response.users);

//       // Append contacts without duplicates
//       setApiContacts(previousContacts => {
//         const existingIds = new Set(
//           previousContacts.map(contact => contact.id),
//         );

//         const newContacts = formattedContacts.filter(
//           contact => !existingIds.has(contact.id),
//         );

//         return [...previousContacts, ...newContacts];
//       });

//       // Update pagination
//       skipRef.current += response.users.length;

//       const moreAvailable = skipRef.current < response.total;

//       setHasMore(moreAvailable);
//       hasMoreRef.current = moreAvailable;
//     } catch (error) {
//       console.log('Load more contacts error:', error);
//     } finally {
//       requestInProgressRef.current = false;
//       setIsLoadingMore(false);
//     }
//   }, [isLoading]);

//   // Pull to refresh
//   const refreshContacts = useCallback(async () => {
//     if (requestInProgressRef.current) {
//       return;
//     }

//     requestInProgressRef.current = true;
//     setIsRefreshing(true);

//     try {
//       const [dummyResponse, jsonResponse] = await Promise.all([
//         getUsers(LIMIT, 0),
//         getContacts(),
//       ]);

//       // Update DummyJSON contacts
//       const formattedDummyContacts = formatDummyJSONContacts(
//         dummyResponse.users,
//       );

//       // Update JSONPlaceholder contacts
//       const formattedJsonContacts = formatJSONPlaceholderContacts(jsonResponse);

//       setApiContacts(formattedDummyContacts);
//       setJsonPlaceholderContacts(formattedJsonContacts);

//       // Reset pagination
//       skipRef.current = dummyResponse.users.length;

//       const moreAvailable = skipRef.current < dummyResponse.total;

//       setHasMore(moreAvailable);
//       hasMoreRef.current = moreAvailable;

//       setError('');
//     } catch (error) {
//       console.log('Refresh error:', error);

//       setError(
//         'Unable to refresh contacts. Please check your internet connection.',
//       );

//       Alert.alert(
//         'Refresh Failed',
//         'Unable to refresh contacts. Please check your internet connection.',
//       );
//     } finally {
//       requestInProgressRef.current = false;
//       setIsRefreshing(false);
//     }
//   }, []);

//   // Delete or hide an API contact
//   const deleteContact = useCallback(
//     async (contact: Contact) => {
//       const updatedDeletedIds = [
//         ...new Set([...deletedContactIds, contact.id]),
//       ];

//       setDeletedContactIds(updatedDeletedIds);

//       try {
//         await saveDeletedContactIds(updatedDeletedIds);
//       } catch (error) {
//         console.log('Error saving deleted contact IDs:', error);
//       }
//     },
//     [deletedContactIds],
//   );

//   // Remove deleted contacts from API results
//   const visibleApiContacts = useMemo(() => {
//     return apiContacts.filter(
//       contact => !deletedContactIds.includes(contact.id),
//     );
//   }, [apiContacts, deletedContactIds]);

//   const visibleJSONPlaceholderContacts = useMemo(() => {
//     return jsonPlaceholderContacts.filter(
//       contact => !deletedContactIds.includes(contact.id),
//     );
//   }, [jsonPlaceholderContacts, deletedContactIds]);

//   // Combine API contacts and avoid duplicate IDs
//   const contacts = useMemo(() => {
//     const combinedContacts = [
//       ...visibleJSONPlaceholderContacts,
//       ...visibleApiContacts,
//     ];

//     return [
//       ...new Map(
//         combinedContacts.map(contact => [contact.id, contact]),
//       ).values(),
//     ];
//   }, [visibleJSONPlaceholderContacts, visibleApiContacts]);

//   return (
//     <ContactContext.Provider
//       value={{
//         contacts,
//         apiContacts: visibleApiContacts,
//         deletedContactIds,

//         searchResults,
//         isSearching,

//         isLoading,
//         isRefreshing,
//         isLoadingMore,
//         hasMore,
//         error,

//         searchContacts,
//         clearSearchResults,
//         loadMoreContacts,
//         refreshContacts,
//         deleteContact,
//       }}
//     >
//       {children}
//     </ContactContext.Provider>
//   );
// };

// // Custom hook
// export const useContacts = () => {
//   const context = useContext(ContactContext);

//   if (!context) {
//     throw new Error('useContacts must be used inside ContactProvider');
//   }

//   return context;
// };

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import type { Contact } from '../Components/ContactForm';

import { getContacts } from '../services/api';

import {
  getDeletedContactIds,
  saveDeletedContactIds,
} from '../utils/storage';

type ContactContextType = {
  contacts: Contact[];
  apiContacts: Contact[];
  deletedContactIds: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string;
  refreshContacts: () => Promise<void>;
  deleteContact: (contact: Contact) => Promise<void>;
};

const ContactContext = createContext<ContactContextType | undefined>(
  undefined,
);

type Props = {
  children: ReactNode;
};

export const ContactProvider = ({ children }: Props) => {
  const [apiContacts, setApiContacts] = useState<Contact[]>([]);

  const [deletedContactIds, setDeletedContactIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState('');

  // Fetch JSONPlaceholder contacts
  const fetchContacts = useCallback(async () => {
    try {
      const response = await getContacts();

      // Convert API data into Contact format
      const formattedContacts: Contact[] = response.map(user => ({
        id: `users_${user.id}`,
        name: user.name,
        phone: user.phone,
        email: user.email,
        image: null,
      }));

      setApiContacts(formattedContacts);
    } catch (error) {
      console.log('Fetch contacts error:', error);
      throw error;
    }
  }, []);

  // Initial loading
  useEffect(() => {
    const initializeContext = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Get previously deleted contact IDs
        const savedDeletedIds = await getDeletedContactIds();

        setDeletedContactIds(savedDeletedIds);

        // Fetch JSONPlaceholder data
        await fetchContacts();
      } catch (error) {
        console.log('Context initialization error:', error);
        setError('Unable to load contacts.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeContext();
  }, [fetchContacts]);

  // Refresh JSONPlaceholder contacts
  const refreshContacts = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError('');

      await fetchContacts();
    } catch (error) {
      console.log('Refresh error:', error);
      setError('Unable to refresh contacts.');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchContacts]);

  // Delete API contact locally
  const deleteContact = useCallback(
    async (contact: Contact) => {
      const updatedIds = [
        ...new Set([...deletedContactIds, contact.id]),
      ];

      // Update state
      setDeletedContactIds(updatedIds);

      // Save deleted IDs in AsyncStorage
      try {
        await saveDeletedContactIds(updatedIds);
      } catch (error) {
        console.log('Delete storage error:', error);
      }
    },
    [deletedContactIds],
  );

  // Hide deleted contacts
  const visibleContacts = useMemo(() => {
    return apiContacts.filter(
      contact => !deletedContactIds.includes(contact.id),
    );
  }, [apiContacts, deletedContactIds]);

  return (
    <ContactContext.Provider
      value={{
        contacts: visibleContacts,
        apiContacts: visibleContacts,
        deletedContactIds,
        isLoading,
        isRefreshing,
        error,
        refreshContacts,
        deleteContact,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

// Custom hook
export const useContacts = () => {
  const context = useContext(ContactContext);

  if (!context) {
    throw new Error(
      'useContacts must be used inside ContactProvider',
    );
  }

  return context;
};
