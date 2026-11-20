import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
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
import DarkModeIcon from '../assets/icons/darkmode.svg';
import LightIcon from '../assets/icons/lightmode.svg';
import GridIcon from '../assets/icons/grid.svg';
import ListIcon from '../assets/icons/list.svg';
import SearchIcon from '../assets/icons/search.svg';
import HeartIcon from '../assets/icons/heart.svg';
import LogoutButton from '../Components/LogoutButton';

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

  const backgroundColor = isDark ? '#071B2A' : '#F2F6F9';
  const textColor = isDark ? '#FFFFFF' : '#203746';
  const cardColor = isDark ? '#102B3B' : '#FFFFFF';
  const borderColor = isDark ? '#244354' : '#E0E8ED';

  const headerColor = '#073D4C';
  const accentColor = '#12A6AD';
  const secondaryText = isDark ? '#A9BBC5' : '#71818D';

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
        {/* TOP HEADER */}

        <View style={styles.headerTop}>
          <View style={styles.toggleContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Contact Directory</Text>

              <Text style={styles.subtitle}>
                All your contacts in one place
              </Text>
            </View>
            <View>
              <LogoutButton />
            </View>
            <View>
              {/* Theme Toggle */}

              <Pressable style={styles.themeButton} onPress={handleThemeChange}>
                {isDark ? (
                  <LightIcon width={23} height={23} />
                ) : (
                  <DarkModeIcon width={23} height={23} />
                )}
              </Pressable>
            </View>
          </View>

          {/* FAVORITES BANNER */}

          <Pressable
            style={[styles.favoriteBanner, { backgroundColor: cardColor }]}
            onPress={() => navigation.navigate('Favorites')}
          >
            <View style={styles.favoriteIconContainer}>
              <HeartIcon width={23} height={23} />
            </View>

            <View style={styles.favoriteInfo}>
              <Text style={[styles.favoriteTitle, { color: textColor }]}>
                Favorites
              </Text>

              <Text style={[styles.favoriteSubtitle, { color: secondaryText }]}>
                {favorites.length} contacts
              </Text>
            </View>

            <Text style={[styles.arrow, { color: accentColor }]}>›</Text>
          </Pressable>
        </View>

        {/* SEARCH BAR */}

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >
          <SearchIcon width={20} height={20} />

          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search by name or phone"
            placeholderTextColor={secondaryText}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* LIST / CARDS SELECTOR */}

        <View style={[styles.layoutContainer, { backgroundColor: cardColor }]}>
          <Pressable
            style={[
              styles.layoutButton,
              displayMode === 'list' && styles.activeLayoutButton,
            ]}
            onPress={() => handleDisplayChange('list')}
          >
            <ListIcon width={18} height={18} />

            <Text
              style={[
                styles.layoutButtonText,
                displayMode === 'list' && styles.activeLayoutText,
              ]}
            >
              List
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.layoutButton,
              displayMode === 'cards' && styles.activeLayoutButton,
            ]}
            onPress={() => handleDisplayChange('cards')}
          >
            <GridIcon width={18} height={18} />

            <Text
              style={[
                styles.layoutButtonText,
                displayMode === 'cards' && styles.activeLayoutText,
              ]}
            >
              Cards
            </Text>
          </Pressable>
        </View>

        {/* CONTACTS HEADING */}

        <View style={styles.contactsHeading}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            All Contacts
          </Text>

          {/* <Text style={[styles.contactCount, { color: secondaryText }]}>
            {displayedContacts.length} contacts
          </Text> */}
        </View>

        {/* API LOADING */}

        {usersStatus === 'loading' && (
          <View style={styles.usersLoading}>
            <ActivityIndicator size="small" color={accentColor} />

            <Text style={[styles.footerText, { color: textColor }]}>
              Loading users...
            </Text>
          </View>
        )}

        {/* API ERROR */}

        {usersStatus === 'failed' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {usersError || 'Unable to fetch users.'}
            </Text>

            <Pressable style={styles.retryButton} onPress={handleRetryUsers}>
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
          </View>
        )}

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
      edges={['top', 'bottom']}
    >
      {/* <StatusBar backgroundColor={headerColor} barStyle="light-content" /> */}

      <View style={[styles.container, { backgroundColor }]}>
        {/* CONTACT LIST */}

        <FlatList
          key={displayMode}
          data={displayedContacts}
          keyExtractor={item => item.id}
          numColumns={displayMode === 'cards' ? 2 : 1}
          columnWrapperStyle={
            displayMode === 'cards' ? styles.columnWrapper : undefined
          }
          ListHeaderComponent={renderHeader()}
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
                image={item.image}
                isFavorite={favorites.includes(item.id)}
                displayMode={displayMode}
                theme={theme}
                onPress={() =>
                  navigation.navigate('ContactDetails', {
                    contactId: item.id,
                  })
                }
                onFavoriteButton={() => handleToggleFavorite(item.id)}
                onEditContact={
                  item.id.startsWith('local_')
                    ? () => handleEditContact(item)
                    : undefined
                }
                onDeleteContact={() => handleDeleteContact(item)}
              />
            </View>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={accentColor}
              colors={[accentColor]}
            />
          }
          ListFooterComponent={
            <View>
              {loadingMore ? (
                <View style={styles.usersLoading}>
                  <ActivityIndicator size="small" color={accentColor} />

                  <Text style={[styles.footerText, { color: textColor }]}>
                    Loading more contacts...
                  </Text>
                </View>
              ) : usersError && users.length > 0 && users.length < total ? (
                <Pressable style={styles.retryButton} onPress={handleLoadMore}>
                  <Text style={styles.buttonText}>Retry loading more</Text>
                </Pressable>
              ) : users.length >= total && total > 0 ? (
                <Text style={[styles.noMoreText, { color: secondaryText }]}>
                  No more contacts
                </Text>
              ) : null}
            </View>
          }
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

        {/* FLOATING ADD BUTTON */}

        <Pressable style={styles.floatingAddButton} onPress={handleAddContact}>
          <Text style={styles.plusIcon}>+</Text>
        </Pressable>

        {/* BOTTOM NAVIGATION */}

        <View
          style={[
            styles.bottomNavigation,
            {
              backgroundColor: cardColor,
              borderTopColor: borderColor,
            },
          ]}
        >
          <Pressable style={styles.bottomNavItem}>
            <ListIcon width={22} height={22} />

            <Text style={[styles.bottomNavText, { color: accentColor }]}>
              Contacts
            </Text>
          </Pressable>

          <Pressable
            style={styles.bottomNavItem}
            onPress={() => navigation.navigate('Favorites')}
          >
            <HeartIcon width={22} height={22} />

            <Text style={[styles.bottomNavText, { color: secondaryText }]}>
              Favorites
            </Text>
          </Pressable>
        </View>

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

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },

//   container: {
//     flex: 1,
//     paddingHorizontal: 12,
//   },

//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   loadingText: {
//     fontSize: 16,
//     color: '#555555',
//     marginTop: 12,
//   },

//   title: {
//     fontSize: 25,
//     fontWeight: 'bold',
//     marginTop: 8,
//   },

//   subtitle: {
//     fontSize: 14,
//     marginTop: 4,
//   },

//   favoriteCount: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginTop: 10,
//     marginBottom: 10,
//   },

//   searchInput: {
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 10,
//   },

//   addButton: {
//     backgroundColor: '#2196F3',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 10,
//   },

//   favoritesButton: {
//     backgroundColor: '#650B29',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 12,
//   },

//   buttonText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },

//   settingsContainer: {
//     padding: 12,
//     marginBottom: 10,
//   },

//   settingsTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },

//   settingButton: {
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//   },

//   settingButtonText: {
//     fontSize: 15,
//     fontWeight: '600',
//   },

//   layoutContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     paddingVertical: 5,
//     gap: 10,
//   },

//   layoutButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 8,
//     backgroundColor: '#DDDDDD',
//   },

//   activeLayoutButton: {
//     backgroundColor: '#90CAF9',
//   },

//   layoutButtonText: {
//     color: '#222222',
//     fontWeight: '600',
//   },

//   columnWrapper: {
//     justifyContent: 'space-between',
//   },

//   cardWrapper: {
//     flex: 1,
//     marginHorizontal: 5,
//     marginBottom: 12,
//   },

//   listWrapper: {
//     width: '100%',
//     marginBottom: 10,
//   },

//   listContent: {
//     paddingTop: 8,
//     paddingBottom: 25,
//     flexGrow: 1,
//   },

//   emptyText: {
//     textAlign: 'center',
//     marginTop: 35,
//     fontSize: 16,
//   },

//   errorContainer: {
//     backgroundColor: '#FDECEC',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 8,
//   },

//   errorText: {
//     color: '#B00020',
//     marginBottom: 8,
//   },

//   retryButton: {
//     backgroundColor: '#D9534F',
//     padding: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginVertical: 10,
//   },

//   usersSection: {
//     marginTop: 15,
//     marginBottom: 15,
//   },

//   sectionTitle: {
//     fontSize: 19,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     marginTop: 8,
//   },

//   usersLoading: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 15,
//   },

//   footerText: {
//     fontSize: 14,
//     marginLeft: 8,
//   },

//   noMoreText: {
//     textAlign: 'center',
//     color: '#777777',
//     padding: 20,
//     fontSize: 14,
//   },
// });

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  // Header

  headerTop: {
    backgroundColor: '#0e6c85',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    marginBottom: 8,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 12,
    color: '#D0E4E9',
    marginTop: 5,
  },

  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1f6f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  toggleContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  // Favorites Banner

  favoriteBanner: {
    marginHorizontal: 9,
    marginTop: 9,
    marginBottom: 12,
    borderRadius: 10,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    // backgroundColor: '#b7384d',
  },

  favoriteIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f0dee1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  favoriteInfo: {
    flex: 1,
    marginLeft: 12,
  },

  favoriteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  favoriteSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  arrow: {
    fontSize: 27,
    fontWeight: 'bold',
    marginRight: 5,
  },

  // Search

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    marginLeft: 10,
    paddingVertical: 0,
  },

  // Layout Selector

  layoutContainer: {
    flexDirection: 'row',
    marginHorizontal: 14,
    padding: 4,
    borderRadius: 10,
    marginBottom: 15,
  },

  layoutButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 7,
  },

  activeLayoutButton: {
    backgroundColor: '#12A6AD',
  },

  layoutButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8798A2',
  },

  activeLayoutText: {
    color: '#FFFFFF',
  },

  // Contacts Heading

  contactsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  contactCount: {
    fontSize: 12,
  },

  // Contact List

  columnWrapper: {
    justifyContent: 'space-between',
  },

  cardWrapper: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
  },

  listWrapper: {
    marginHorizontal: 12,
    marginBottom: 9,
  },

  listContent: {
    paddingTop: 5,
    paddingBottom: 15,
    flexGrow: 1,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 35,
    fontSize: 15,
  },

  // Floating Add Button

  floatingAddButton: {
    position: 'absolute',
    right: 20,
    bottom: 78,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#12A6AD',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 7,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },

  plusIcon: {
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 38,
  },

  // Bottom Navigation

  bottomNavigation: {
    height: 58,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  bottomNavText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Loading and Errors

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#777777',
    marginTop: 12,
  },

  usersLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },

  footerText: {
    fontSize: 13,
    marginLeft: 8,
  },

  noMoreText: {
    textAlign: 'center',
    padding: 18,
    fontSize: 12,
  },

  errorContainer: {
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 14,
    marginBottom: 8,
  },

  errorText: {
    color: '#B00020',
    marginBottom: 8,
  },

  retryButton: {
    backgroundColor: '#D9534F',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 14,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
