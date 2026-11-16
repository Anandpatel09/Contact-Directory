
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

import ContactCard from '../Components/ContactCard';
import ContactForm from '../Components/ContactForm';

import type { Contact } from '../Components/ContactForm';

import { useContacts } from '../context/ContactContext';

import {
  useAppDispatch,
  useAppSelector,
} from '../hooks/reduxHooks';

import {
  addContact as addContactAction,
  deleteContact as deleteContactAction,
  toggleFavorite as toggleFavoriteAction,
  updateContact as updateContactAction,
} from '../redux/contactSlice';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ContactList'
>;

const ContactListScreen = ({ navigation }: Props) => {
  // Context: API-related data and functionality
  const {
    contacts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isSearching,
    hasMore,
    error,
    searchResults,
    searchContacts,
    clearSearchResults,
    deleteContact: deleteApiContact,
    refreshContacts,
    loadMoreContacts,
  } = useContacts();

  // Redux dispatch
  const dispatch = useAppDispatch();

  // Get local contacts from Redux
  const localContacts = useAppSelector(
    state => state.contacts.localContacts,
  );

  // Get favorite IDs from Redux
  const favorites = useAppSelector(
    state => state.contacts.favorites,
  );

  // Remove locally added contacts from Context.
  // Redux is the source of truth for local contacts.
  const apiContacts = contacts.filter(
    contact => !contact.id.startsWith('local_'),
  );

  // Combine Redux local contacts and API contacts
  const allContacts: Contact[] = [
    ...localContacts,
    ...apiContacts,
  ];

  // Search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Add/Edit form states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] =
    useState<Contact | null>(null);

  // Debounce the user's input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Search the API after the debounce delay
  useEffect(() => {
    if (debouncedSearch === '') {
      clearSearchResults();
      return;
    }

    searchContacts(debouncedSearch);
  }, [debouncedSearch]);

  // Search locally available contacts
  const localSearchResults = allContacts.filter(contact => {
    const query = debouncedSearch.toLowerCase();

    if (query === '') {
      return true;
    }

    // Search by name
    const nameMatch = contact.name
      .toLowerCase()
      .includes(query);

    // Search by email
    const emailMatch = contact.email
      .toLowerCase()
      .includes(query);

    // Search by phone number
    const phoneQuery = debouncedSearch.replace(/\D/g, '');

    const contactPhone = contact.phone.replace(/\D/g, '');

    const phoneMatch =
      phoneQuery.length > 0 &&
      contactPhone.includes(phoneQuery);

    return nameMatch || emailMatch || phoneMatch;
  });

  // Combine local search results and API search results
  // Map prevents duplicate contacts based on ID
  const displayedContacts =
    debouncedSearch === ''
      ? allContacts
      : [
          ...new Map(
            [...localSearchResults, ...searchResults].map(
              contact => [contact.id, contact],
            ),
          ).values(),
        ];

  // Open add contact form
  const handleAddContact = () => {
    setEditingContact(null);
    setModalVisible(true);
  };

  // Open edit contact form
  const handleEditContact = (contact: Contact) => {
    if (!contact.id.startsWith('local_')) {
      Alert.alert(
        'Edit Contact',
        'Only locally added contacts can be edited.',
      );

      return;
    }

    setEditingContact(contact);
    setModalVisible(true);
  };

  // Delete contact with confirmation
  const handleDeleteContact = (contact: Contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              if (contact.id.startsWith('local_')) {
                // Delete local contact using Redux
                dispatch(deleteContactAction(contact.id));
              } else {
                // Delete API contact using Context
                await deleteApiContact(contact);
              }
            } catch (deleteError) {
              Alert.alert(
                'Error',
                'Unable to delete the contact.',
              );
            }
          },
        },
      ],
    );
  };

  // Toggle favorite using Redux
  const handleToggleFavorite = (id: string) => {
    dispatch(toggleFavoriteAction(id));
  };

  // Close add/edit form
  const handleCloseForm = () => {
    setModalVisible(false);
    setEditingContact(null);
  };

  // Save contact using Redux
  const handleSaveContact = async (contact: Contact) => {
    if (editingContact) {
      // Update existing local contact
      dispatch(updateContactAction(contact));
    } else {
      // Add new local contact
      dispatch(addContactAction(contact));
    }
  };

  // Initial loading indicator
  // Show it only when there are no local contacts to display
  if (isLoading && allContacts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2196F3"
        />

        <Text style={styles.loadingText}>
          Loading contacts...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <View style={styles.container}>
        {/* Screen Heading */}
        <Text style={styles.title}>
          Contact Directory
        </Text>

        <Text style={styles.subtitle}>
          All your contacts in one place
        </Text>

        {/* Total favorites from Redux */}
        <Text style={styles.favoriteCount}>
          Total Favorites: {favorites.length}
        </Text>

        {/* Search input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone or email"
          placeholderTextColor="#777777"
          value={search}
          onChangeText={setSearch}
        />

        {/* Add Contact button */}
        <Pressable
          style={styles.addButton}
          onPress={handleAddContact}
        >
          <Text style={styles.buttonText}>
            + Add Contact
          </Text>
        </Pressable>

        {/* Favorites button */}
        <Pressable
          style={styles.favoritesButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.buttonText}>
            View Favorites
          </Text>
        </Pressable>

        {/* API error */}
        {error !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={refreshContacts}
            >
              <Text style={styles.buttonText}>
                Retry
              </Text>
            </Pressable>
          </View>
        )}

        {/* Contact list */}
        <FlatList
          data={displayedContacts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ContactCard
              id={item.id}
              name={item.name}
              phone={item.phone}
              isFavorite={favorites.includes(item.id)}

              // Open contact details
              onPress={() =>
                navigation.navigate('ContactDetails', {
                  contactId: item.id,
                })
              }

              // Favorite / unfavorite
              onFavoriteButton={() =>
                handleToggleFavorite(item.id)
              }

              // Edit local contact
              onEditContact={
                item.id.startsWith('local_')
                  ? () => handleEditContact(item)
                  : undefined
              }

              // Delete contact
              onDeleteContact={() =>
                handleDeleteContact(item)
              }
            />
          )}

          // Infinite scrolling
          onEndReached={() => {
            // Do not load more while API search is running
            if (
              debouncedSearch !== '' &&
              isSearching
            ) {
              return;
            }

            // Load more API contacts only when not searching
            if (
              debouncedSearch === '' &&
              hasMore &&
              !isLoadingMore
            ) {
              loadMoreContacts();
            }
          }}
          onEndReachedThreshold={0.5}

          // Pull-to-refresh
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshContacts}
            />
          }

          // Footer loading indicator
          ListFooterComponent={
            isSearching || isLoadingMore ? (
              <View style={styles.footerContainer}>
                <ActivityIndicator
                  size="large"
                  color="#2196F3"
                />

                <Text style={styles.footerText}>
                  {isSearching
                    ? 'Searching contacts...'
                    : 'Loading more contacts...'}
                </Text>
              </View>
            ) : debouncedSearch === '' &&
              !hasMore &&
              allContacts.length > 0 ? (
              <Text style={styles.noMoreText}>
                No more contacts
              </Text>
            ) : undefined
          }

          // Empty list message
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {isSearching
                ? 'Searching contacts...'
                : debouncedSearch !== ''
                  ? 'No contacts match your search.'
                  : error !== ''
                    ? 'No contacts available. Please retry.'
                    : 'No contacts found.'}
            </Text>
          }

          contentContainerStyle={styles.listContent}
        />

        {/* Add/Edit Contact Form */}
        <ContactForm
          visible={modalVisible}
          contacts={allContacts}
          editingContact={editingContact}
          onClose={handleCloseForm}
          onSave={handleSaveContact}
        />
      </View>
    </SafeAreaView>
  );
};

export default ContactListScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#555',
    marginTop: 12,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#222',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  favoriteCount: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#222',
  },

  searchInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#0b0a0a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    color: '#070404',
  },

  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },

  favoritesButton: {
    backgroundColor: '#650b29',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },

  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 35,
    fontSize: 16,
  },

  errorContainer: {
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  errorText: {
    color: '#B00020',
    marginBottom: 8,
  },

  retryButton: {
    backgroundColor: '#D9534F',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },

  footerContainer: {
    padding: 20,
    alignItems: 'center',
  },

  footerText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },

  noMoreText: {
    textAlign: 'center',
    color: '#777',
    padding: 20,
    fontSize: 14,
  },
});
