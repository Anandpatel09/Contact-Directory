import React, { useEffect, useRef, useState } from 'react';

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

import { fetchUsers } from '../redux/usersThunks';

import { toggleTheme, setDisplayMode } from '../redux/slice/settingsSlice';

import {
  addContact as addContactAction,
  deleteContact as deleteContactAction,
  toggleFavorite as toggleFavoriteAction,
  updateContact as updateContactAction,
} from '../redux/slice/contactSlice';

import { useAppDispatch, useAppSelector } from '../redux/hooks/reduxHooks';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactList'>;

const ContactListScreen = ({ navigation }: Props) => {
  // CONTEXT: JSONPLACEHOLDER API

  const {
    contacts: contextContacts,
    isLoading,
    isRefreshing,
    error: contactError,
    deleteContact: deleteApiContact,
    refreshContacts,
  } = useContacts();

  // REDUX

  const dispatch = useAppDispatch();

  const localContacts = useAppSelector(state => state.contacts.localContacts);

  const favorites = useAppSelector(state => state.contacts.favorites);

  const theme = useAppSelector(state => state.settings.theme);

  const displayMode = useAppSelector(state => state.settings.displayMode);

  // DummyJSON users from Redux

  const {
    users,
    status: usersStatus,
    error: usersError,
    loadingMore,
    total,
    skip,
  } = useAppSelector(state => state.users);

  // LOCAL STATES

  const [deletedReduxUserIds, setDeletedReduxUserIds] = useState<string[]>([]);

  const [search, setSearch] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [modalVisible, setModalVisible] = useState(false);

  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Prevent duplicate pagination requests

  const loadingMoreRef = useRef(false);

  // THEME COLORS

  const isDark = theme === 'dark';

  const backgroundColor = isDark ? '#171717' : '#FFFFFF';

  const textColor = isDark ? '#FFFFFF' : '#222222';

  const cardColor = isDark ? '#292929' : '#F2F2F2';

  const borderColor = isDark ? '#555555' : '#CCCCCC';

  // INITIAL API REQUEST

  useEffect(() => {
    if (usersStatus === 'idle') {
      dispatch(
        fetchUsers({
          skip: 0,
          limit: 10,
        }),
      );
    }
  }, [dispatch, usersStatus]);

  // CONVERT DUMMYJSON USERS TO CONTACT

  const reduxUsers: Contact[] = users
    .filter(user => !deletedReduxUserIds.includes(String(user.id)))
    .map(user => ({
      id: String(user.id),
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email,
      image: user.image,
    }));

  // JSONPLACEHOLDER CONTACTS

  const jsonPlaceholderContacts = contextContacts.filter(contact =>
    contact.id.startsWith('users_'),
  );

  // COMBINE ALL CONTACTS

  const allContacts: Contact[] = [
    ...localContacts,
    ...reduxUsers,
    ...jsonPlaceholderContacts,
  ];

  // DEBOUNCING

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // SEARCH ALL CONTACTS

  const displayedContacts = allContacts.filter(contact => {
    const query = debouncedSearch.toLowerCase();

    if (query === '') {
      return true;
    }

    const nameMatch = contact.name.toLowerCase().includes(query);

    const emailMatch = (contact.email || '').toLowerCase().includes(query);

    const phoneQuery = debouncedSearch.replace(/\D/g, '');

    const contactPhone = contact.phone.replace(/\D/g, '');

    const phoneMatch =
      phoneQuery.length > 0 && contactPhone.includes(phoneQuery);

    return nameMatch || emailMatch || phoneMatch;
  });

  // PAGINATION

  const handleLoadMore = async () => {
    // Do not load more while searching

    if (debouncedSearch !== '') {
      return;
    }

    // Prevent duplicate requests

    if (loadingMoreRef.current || loadingMore) {
      return;
    }

    // Do not load during initial request

    if (usersStatus === 'loading') {
      return;
    }

    // Stop when all users are loaded

    if (users.length >= total || total === 0) {
      return;
    }

    loadingMoreRef.current = true;

    try {
      await dispatch(
        fetchUsers({
          skip,
          limit: 10,
        }),
      );
    } catch (error) {
      console.log('Pagination error:', error);
    } finally {
      loadingMoreRef.current = false;
    }
  };

  // ADD CONTACT

  const handleAddContact = () => {
    setEditingContact(null);
    setModalVisible(true);
  };

  // EDIT CONTACT

  const handleEditContact = (contact: Contact) => {
    if (!contact.id.startsWith('local_')) {
      Alert.alert('Edit Contact', 'Only locally added contacts can be edited.');

      return;
    }

    setEditingContact(contact);
    setModalVisible(true);
  };

  // DELETE CONTACT

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
              // Delete local contact

              if (contact.id.startsWith('local_')) {
                dispatch(deleteContactAction(contact.id));
              }

              // Delete JSONPlaceholder contact
              else if (contact.id.startsWith('users_')) {
                await deleteApiContact(contact);
              }

              // Hide DummyJSON contact
              else {
                setDeletedReduxUserIds(previousIds => [
                  ...previousIds,
                  contact.id,
                ]);

                // Remove from favorites

                if (favorites.includes(contact.id)) {
                  dispatch(toggleFavoriteAction(contact.id));
                }
              }
            } catch (deleteError) {
              console.log('Delete error:', deleteError);

              Alert.alert('Error', 'Unable to delete the contact.');
            }
          },
        },
      ],
    );
  };

  // THEME CHANGE

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  };

  // DISPLAY MODE CHANGE

  const handleDisplayChange = (mode: 'list' | 'cards') => {
    dispatch(setDisplayMode(mode));
  };

  // FAVORITE

  const handleToggleFavorite = (id: string) => {
    dispatch(toggleFavoriteAction(id));
  };

  // CLOSE FORM

  const handleCloseForm = () => {
    setModalVisible(false);
    setEditingContact(null);
  };

  // SAVE CONTACT

  const handleSaveContact = (contact: Contact) => {
    if (editingContact) {
      dispatch(updateContactAction(contact));
    } else {
      dispatch(addContactAction(contact));
    }

    setModalVisible(false);
    setEditingContact(null);
  };

  // REFRESH BOTH APIS

  const handleRefresh = async () => {
    // Prevent refresh during pagination

    if (loadingMoreRef.current || loadingMore) {
      return;
    }

    try {
      await Promise.all([
        refreshContacts(),

        dispatch(
          fetchUsers({
            skip: 0,
            limit: 10,
          }),
        ),
      ]);
    } catch (refreshError) {
      console.log('Refresh error:', refreshError);
    }
  };

  // RETRY DUMMYJSON API

  const handleRetryUsers = () => {
    dispatch(
      fetchUsers({
        skip: 0,
        limit: 10,
      }),
    );
  };

  // HEADER COMPONENT

  const renderHeader = () => {
    return (
      <View>
        {/* Heading */}

        <Text style={[styles.title, { color: textColor }]}>
          Contact Directory
        </Text>

        <Text style={[styles.subtitle, { color: textColor }]}>
          All your contacts in one place
        </Text>

        {/* Display Mode */}

        <View style={styles.layoutContainer}>
          <Pressable
            style={[
              styles.layoutButton,
              displayMode === 'list' && styles.activeLayoutButton,
            ]}
            onPress={() => handleDisplayChange('list')}
          >
            <Text style={styles.layoutButtonText}>List</Text>
          </Pressable>

          <Pressable
            style={[
              styles.layoutButton,
              displayMode === 'cards' && styles.activeLayoutButton,
            ]}
            onPress={() => handleDisplayChange('cards')}
          >
            <Text style={styles.layoutButtonText}>Cards</Text>
          </Pressable>
        </View>

        {/* Favorite Count */}

        <Text style={[styles.favoriteCount, { color: textColor }]}>
          Total Favorites: {favorites.length}
        </Text>

        {/* Search */}

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: cardColor,
              color: textColor,
              borderColor,
            },
          ]}
          placeholder="Search by name or phone"
          placeholderTextColor={isDark ? '#AAAAAA' : '#777777'}
          value={search}
          onChangeText={setSearch}
        />

        {/* Add Contact */}

        <Pressable style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.buttonText}>+ Add Contact</Text>
        </Pressable>

        {/* Favorites */}

        <Pressable
          style={styles.favoritesButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.buttonText}>View Favorites</Text>
        </Pressable>

        {/* Display Settings */}

        <View style={styles.settingsContainer}>
          <Text style={[styles.settingsTitle, { color: textColor }]}>
            Display Settings
          </Text>

          <Pressable
            style={[styles.settingButton, { backgroundColor: cardColor }]}
            onPress={handleThemeChange}
          >
            <Text style={[styles.settingButtonText, { color: textColor }]}>
              Theme: {isDark ? 'Dark 🌙' : 'Light ☀️'}
            </Text>
          </Pressable>
        </View>

        {/* API Status */}

        <View style={styles.usersSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            All Contacts ({displayedContacts.length})
          </Text>

          {usersStatus === 'loading' && (
            <View style={styles.usersLoading}>
              <ActivityIndicator size="small" color="#2196F3" />

              <Text style={[styles.footerText, { color: textColor }]}>
                Loading DummyJSON users...
              </Text>
            </View>
          )}

          {usersStatus === 'failed' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {usersError || 'Unable to fetch DummyJSON users.'}
              </Text>

              <Pressable style={styles.retryButton} onPress={handleRetryUsers}>
                <Text style={styles.buttonText}>Retry</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* JSONPlaceholder API Error */}

        {contactError !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{contactError}</Text>
          </View>
        )}
      </View>
    );
  };

  // INITIAL LOADING

  if ((isLoading || usersStatus === 'loading') && allContacts.length === 0) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />

          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN UI

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top']}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <FlatList
          key={displayMode}
          data={displayedContacts}
          keyExtractor={item => item.id}
          numColumns={displayMode === 'cards' ? 2 : 1}
          columnWrapperStyle={
            displayMode === 'cards' ? styles.columnWrapper : undefined
          }
          // Header

          ListHeaderComponent={renderHeader()}
          // Contact Card

          renderItem={({ item }) => (
            <View
              style={
                displayMode === 'cards'
                  ? styles.cardWrapper
                  : styles.listWrapper
              }
            >
              <ContactCard
                id={item.id}
                name={item.name}
                phone={item.phone}
                isFavorite={favorites.includes(item.id)}
                displayMode={displayMode}
                theme={theme}
                // Open Contact Details

                onPress={() =>
                  navigation.navigate('ContactDetails', {
                    contactId: item.id,
                  })
                }
                // Toggle Favorite

                onFavoriteButton={() => handleToggleFavorite(item.id)}
                // Edit only local contacts

                onEditContact={
                  item.id.startsWith('local_')
                    ? () => handleEditContact(item)
                    : undefined
                }
                // Delete Contact

                onDeleteContact={() => handleDeleteContact(item)}
              />
            </View>
          )}
          // PAGINATION

          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          // Pull to Refresh

          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          // FOOTER

          ListFooterComponent={
            <View>
              {loadingMore ? (
                <View style={styles.usersLoading}>
                  <ActivityIndicator size="small" color="#2196F3" />

                  <Text style={[styles.footerText, { color: textColor }]}>
                    Loading more users...
                  </Text>
                </View>
              ) : usersError && users.length > 0 && users.length < total ? (
                <Pressable style={styles.retryButton} onPress={handleLoadMore}>
                  <Text style={styles.buttonText}>Retry loading more</Text>
                </Pressable>
              ) : users.length >= total && total > 0 ? (
                <Text style={styles.noMoreText}>No more DummyJSON users</Text>
              ) : (
                <View />
              )}
            </View>
          }
          // EMPTY LIST

          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: textColor }]}>
              {usersStatus === 'loading' || isLoading
                ? 'Loading contacts...'
                : debouncedSearch !== ''
                ? 'No contacts match your search.'
                : contactError || usersError || 'No contacts found.'}
            </Text>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* ADD / EDIT CONTACT FORM */}

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

// STYLES

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#555555',
    marginTop: 12,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 8,
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  favoriteCount: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },

  favoritesButton: {
    backgroundColor: '#650B29',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  settingsContainer: {
    padding: 12,
    marginBottom: 10,
  },

  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  settingButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  settingButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  layoutContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 5,
    gap: 10,
  },

  layoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#DDDDDD',
  },

  activeLayoutButton: {
    backgroundColor: '#90CAF9',
  },

  layoutButtonText: {
    color: '#222222',
    fontWeight: '600',
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  cardWrapper: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 12,
  },

  listWrapper: {
    width: '100%',
    marginBottom: 10,
  },

  listContent: {
    paddingTop: 8,
    paddingBottom: 25,
    flexGrow: 1,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 35,
    fontSize: 16,
  },

  errorContainer: {
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
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
    marginVertical: 10,
  },

  usersSection: {
    marginTop: 15,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 8,
  },

  usersLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },

  footerText: {
    fontSize: 14,
    marginLeft: 8,
  },

  noMoreText: {
    textAlign: 'center',
    color: '#777777',
    padding: 20,
    fontSize: 14,
  },
});
