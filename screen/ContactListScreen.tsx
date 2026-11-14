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

type Props = NativeStackScreenProps<RootStackParamList, 'ContactList'>;

const ContactListScreen = ({ navigation }: Props) => {
  const {
    contacts,
    favorites,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isSearching,
    hasMore,
    error,
    searchResults,
    searchContacts,
    clearSearchResults,
    toggleFavorite,
    addContact,
    updateContact,
    deleteContact,
    refreshContacts,
    loadMoreContacts,
    dispatch,
  } = useContacts();
  const [search, setSearch] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  //Debounce the users input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  //Search the API after the debounce
  useEffect(() => {
    if (debouncedSearch === '') {
      clearSearchResults();
      return;
    }

    searchContacts(debouncedSearch);
  }, [debouncedSearch]);

  // Search already loaded and locally added contacts
  const localSearchResults = contacts.filter(contact => {
    const query = debouncedSearch.toLowerCase();

    if (query === '') {
      return true;
    }

    const nameMatch = contact.name.toLowerCase().includes(query);

    const emailMatch = contact.email.toLowerCase().includes(query);

    const phoneQuery = debouncedSearch.replace(/\D/g, '');
    const contactPhone = contact.phone.replace(/\D/g, '');

    const phoneMatch =
      phoneQuery.length > 0 && contactPhone.includes(phoneQuery);

    return nameMatch || emailMatch || phoneMatch;
  });

  //Combine local results and API search results
  const displayedContacts =
    debouncedSearch === ''
      ? contacts
      : [
          ...new Map(
            [...localSearchResults, ...searchResults].map(contact => [
              contact.id,
              contact,
            ]),
          ).values(),
        ];

  // Open add contact form
  const handleAddContact = () => {
    setEditingContact(null);
    setModalVisible(true);
  };

  //contact to be displayed

  // Open edit form
  const handleEditContact = (contact: Contact) => {
    if (!contact.id.startsWith('local_')) {
      Alert.alert('Edit Contact', 'Only locally added contacts can be edited.');

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
                dispatch({
                  type: 'DELETE_CONTACT',
                  payload: contact.id,
                });
              } else {
                await deleteContact(contact);
              }
            } catch (deleteError) {
              Alert.alert('Error', 'Unable to save the deleted contact.');
            }
          },
        },
      ],
    );
  };

  // Close add/edit form
  const handleCloseForm = () => {
    setModalVisible(false);
    setEditingContact(null);
  };

  // Initial loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />

        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }
  //handle favorite
  const handleToggleFavorite = (id: string) => {
    dispatch({
      type: 'TOGGLE_FAVORITE',
      payload: id,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Contact Directory</Text>

        <Text style={styles.subtitle}>All your contacts in one place</Text>

        <Text style={styles.favoriteCount}>
          Total Favorites: {favorites.length}
        </Text>

        {/* Search input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone"
          placeholderTextColor="#777777"
          value={search}
          onChangeText={setSearch}
        />

        {/* Add Contact button */}
        <Pressable style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.buttonText}>+ Add Contact</Text>
        </Pressable>

        {/* Favorites button */}
        <Pressable
          style={styles.favoritesButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.buttonText}>View Favorites</Text>
        </Pressable>

        {/* API error */}
        {error !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>

            <Pressable style={styles.retryButton} onPress={refreshContacts}>
              <Text style={styles.buttonText}>Retry</Text>
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
             
              onFavoriteButton={() => handleToggleFavorite(item.id)}
              // Edit contact
              onEditContact={
                item.id.startsWith('local_')
                  ? () => handleEditContact(item)
                  : undefined
              }
              // Delete contact
              onDeleteContact={() => handleDeleteContact(item)}
            />
          )}
          // Infinite scrolling

          onEndReached={() => {
            // Wait for the first API search to finish
            if (debouncedSearch !== '' && isSearching) {
              return;
            }

            loadMoreContacts();
          }}
          onEndReachedThreshold={0.5}
          // Pull-to-refresh
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshContacts}
            />
          }
          ListFooterComponent={
            isSearching || isLoadingMore ? (
              <View style={styles.footerContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.footerText}>
                  {isSearching
                    ? 'Searching contacts...'
                    : 'Loading more contacts...'}
                </Text>
              </View>
            ) : debouncedSearch === '' && !hasMore && contacts.length > 0 ? (
              <Text style={styles.noMoreText}>No more contacts</Text>
            ) : undefined
          }
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
          contacts={contacts}
          editingContact={editingContact}
          onClose={handleCloseForm}
        
            onSave={async contact => {
    if (editingContact) {
      await updateContact(contact);
    } else {
      await addContact(contact);
    }   
  }}
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
