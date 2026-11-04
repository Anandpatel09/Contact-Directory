import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

import { useContacts } from '../context/ContactContext';

import AddContactForm, { type Contact } from '../Components/ContactForm';

import ContactCard from '../Components/ContactCard';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Accept navigation from either ContactList or Favorites
type ContactListNavigation =
  | NativeStackNavigationProp<RootStackParamList, 'ContactList'>
  | NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

type Props = {
  navigation: ContactListNavigation;
  showFavorites?: boolean;
};

// const ContactListScreen = ({ navigation, showFavorites = false }: Props) => {
//   // Get shared data from Context
//   const {
//     contacts,
//     setContacts,
//     favorites,
//     setFavorites,
//     loading,
//     error,
//     refreshContacts,
//   } = useContacts();

//   // Local states
//   const [search, setSearch] = useState('');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editingContact, setEditingContact] = useState<Contact | null>(null);

//   // Toggle Favorite
//   const toggleFavorite = async (contactId: string) => {
//     let updatedFavorites: string[];
//     if (favorites.includes(contactId)) {
//       // Remove contact from favorites
//       updatedFavorites = favorites.filter(id => id !== contactId);
//     } else {
//       // Add contact to favorites
//       updatedFavorites = [...favorites, contactId];
//     }

//     setFavorites(updatedFavorites);

//     // Save updated favorites in AsyncStorage
//     try {
//       await AsyncStorage.setItem(
//         'favoriteContacts',
//         JSON.stringify(updatedFavorites),
//       );
//     } catch (error) {
//       console.log('Error saving favorites:', error);
//     }
//   };

//   // Delete Contact
//   const deleteContact = (contactId: string) => {
//     Alert.alert(
//       'Delete Contact',
//       'Are you sure you want to delete this contact?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: () => {
//             setContacts(previous =>
//               previous.filter(contact => contact.id !== contactId),
//             );

//             // Also remove contact from favorites
//             setFavorites(previous => previous.filter(id => id !== contactId));
//           },
//         },
//       ],
//     );
//   };

//   // Open Edit Form
//   const handleEditContact = (contact: Contact) => {
//     setEditingContact(contact);
//     setModalVisible(true);
//   };

//   // Open Add Form
//   const handleOpenAddForm = () => {
//     setEditingContact(null);
//     setModalVisible(true);
//   };

//   // Add Contact
//   const handleAddContact = (newContact: Contact) => {
//     setContacts(previous => [newContact, ...previous]);
//     setModalVisible(false);
//   };

//   // Update Contact
//   const handleUpdateContact = (updatedContact: Contact) => {
//     setContacts(previous =>
//       previous.map(contact =>
//         contact.id === updatedContact.id ? updatedContact : contact,
//       ),
//     );

//     setModalVisible(false);
//     setEditingContact(null);
//   };

//   // Close Form
//   const handleCloseForm = () => {
//     setModalVisible(false);
//     setEditingContact(null);
//   };

//   // Show all contacts or only favorites
//   const displayedContacts = showFavorites
//     ? contacts.filter(contact => favorites.includes(contact.id))
//     : contacts;

//   // Search Contacts
//   const filteredContacts = displayedContacts.filter(contact => {
//     const query = search.trim().toLowerCase();

//     return (
//       contact.name.toLowerCase().includes(query) ||
//       contact.phone.toLowerCase().includes(query) ||
//       (contact.email?.toLowerCase().includes(query) ?? false)
//     );
//   });

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <Text style={styles.title}>
//         {showFavorites ? 'Favorite Contacts' : 'Contact Directory'}
//       </Text>

//       <Text style={styles.subtitle}>
//         {showFavorites ? 'Your favorite contacts' : 'All contacts in one place'}
//       </Text>

//       {/* Favorite Count */}
//       <Text style={styles.favoriteCount}>
//         Total Favorites: {favorites.length}
//       </Text>

//       {/* Search Input */}
//       <TextInput
//         style={styles.searchInput}
//         placeholder="Search by name, phone or email..."
//         placeholderTextColor="#888"
//         value={search}
//         onChangeText={setSearch}
//       />

//       {/* Add and Favorites Buttons */}

//       {!showFavorites && (
//         <>
//           <TouchableOpacity
//             style={styles.addButton}
//             onPress={handleOpenAddForm}
//           >
//             <Text style={styles.buttonText}>+ Add Contact</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.favoritesButton}
//             onPress={() => navigation.navigate('Favorites')}
//           >
//             <Text style={styles.buttonText}>View Favorites</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {/* Back Button on Favorites Screen */}
//       {showFavorites && (
//         <TouchableOpacity
//           style={styles.favoritesButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={styles.buttonText}>Go Back</Text>
//         </TouchableOpacity>
//       )}

//       {/* Refresh Error */}
//       {error && contacts.length > 0 && (
//         <View style={styles.refreshError}>
//           <Text style={styles.errorText}>{error}</Text>

//           <TouchableOpacity onPress={refreshContacts}>
//             <Text style={styles.retryText}>Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Initial Loading */}
//       {loading && contacts.length === 0 ? (
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color="#a94b3f" />

//           <Text style={styles.message}>Loading contacts...</Text>
//         </View>
//       ) : error && contacts.length === 0 ? (
//         /* Initial API Error */
//         <View style={styles.centerContainer}>
//           <Text style={styles.errorText}>{error}</Text>

//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={refreshContacts}
//           >
//             <Text style={styles.buttonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         /* Contact List */
//         <FlatList
//           data={filteredContacts}
//           keyExtractor={item => item.id}
//           renderItem={({ item }) => (
//             <ContactCard
//               id={item.id}
//               name={item.name}
//               phone={item.phone}
//               email={item.email}
//               image={item.image}
//               isFavorite={favorites.includes(item.id)}
//               onPress={() =>
//                 navigation.navigate('ContactDetails', {
//                   contactId: item.id,
//                 })
//               }
//               onFavoriteButton={() => toggleFavorite(item.id)}
//               onDeleteContact={() => deleteContact(item.id)}
//               onEditContact={() => handleEditContact(item)}
//             />
//           )}
//           refreshControl={
//             <RefreshControl
//               refreshing={loading && contacts.length > 0}
//               onRefresh={refreshContacts}
//               colors={['#a94b3f']}
//             />
//           }
//           ListEmptyComponent={
//             <View style={styles.centerContainer}>
//               <Text style={styles.message}>
//                 {search.trim()
//                   ? 'No contacts found.'
//                   : showFavorites
//                   ? 'No favorite contacts yet.'
//                   : 'No contacts available.'}
//               </Text>
//             </View>
//           }
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={
//             filteredContacts.length === 0
//               ? styles.emptyList
//               : styles.listContent
//           }
//         />
//       )}

//       {/* Add / Edit Contact Modal */}
//       <AddContactForm
//         visible={modalVisible}
//         contacts={contacts}
//         editingContact={editingContact}
//         onClose={handleCloseForm}
//         onAddContact={handleAddContact}
//         onUpdateContact={handleUpdateContact}
//       />
//     </View>
//   );
// };

const ContactListScreen = ({ navigation, showFavorites = false }: Props) => {
  // Get shared data and functions from Context
  const {
    contacts,
    favorites,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    refreshContacts,
  } = useContacts();

  // Local states
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Toggle favorite
  const handleToggleFavorite = async (contactId: string) => {
    await toggleFavorite(contactId);
  };

  // Delete contact
  const handleDeleteContact = (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteContact(contactId);
          },
        },
      ],
    );
  };

  // Open edit form
  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setModalVisible(true);
  };

  // Open add form
  const handleOpenAddForm = () => {
    setEditingContact(null);
    setModalVisible(true);
  };

  // Add contact
  const handleAddContact = async (newContact: Contact) => {
    await addContact(newContact);
    setModalVisible(false);
  };

  // Update contact
  const handleUpdateContact = async (updatedContact: Contact) => {
    await updateContact(updatedContact);
    setModalVisible(false);
    setEditingContact(null);
  };

  // Close form
  const handleCloseForm = () => {
    setModalVisible(false);
    setEditingContact(null);
  };

  // Show all contacts or only favorites
  const displayedContacts = showFavorites
    ? contacts.filter(contact => favorites.includes(contact.id))
    : contacts;

  // Search contacts
  const filteredContacts = displayedContacts.filter(contact => {
    const query = search.trim().toLowerCase();

    return (
      contact.name.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query) ||
      (contact.email?.toLowerCase().includes(query) ?? false)
    );
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>
        {showFavorites ? 'Favorite Contacts' : 'Contact Directory'}
      </Text>

      <Text style={styles.subtitle}>
        {showFavorites ? 'Your favorite contacts' : 'All contacts in one place'}
      </Text>

      {/* Favorite Count */}
      <Text style={styles.favoriteCount}>
        Total Favorites: {favorites.length}
      </Text>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name, phone or email..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {/* Add and Favorites Buttons */}
      {!showFavorites && (
        <>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenAddForm}
          >
            <Text style={styles.buttonText}>+ Add Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoritesButton}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Text style={styles.buttonText}>View Favorites</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Back Button */}
      {showFavorites && (
        <TouchableOpacity
          style={styles.favoritesButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      )}

      {/* API Error */}
      {error && contacts.length > 0 && (
        <View style={styles.refreshError}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity onPress={refreshContacts}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {loading && contacts.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#a94b3f" />
          <Text style={styles.message}>Loading contacts...</Text>
        </View>
      ) : error && contacts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshContacts}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Contact List */
        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ContactCard
              id={item.id}
              name={item.name}
              phone={item.phone}
              email={item.email}
              image={item.image}
              isFavorite={favorites.includes(item.id)}
              onPress={() =>
                navigation.navigate('ContactDetails', {
                  contactId: item.id,
                })
              }
              onFavoriteButton={() => handleToggleFavorite(item.id)}
              onDeleteContact={() => handleDeleteContact(item.id)}
              onEditContact={() => handleEditContact(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading && contacts.length > 0}
              onRefresh={refreshContacts}
              colors={['#a94b3f']}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.message}>
                {search.trim()
                  ? 'No contacts found.'
                  : showFavorites
                  ? 'No favorite contacts yet.'
                  : 'No contacts available.'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filteredContacts.length === 0
              ? styles.emptyList
              : styles.listContent
          }
        />
      )}

      {/* Add / Edit Contact Form */}
      <AddContactForm
        visible={modalVisible}
        contacts={contacts}
        editingContact={editingContact}
        onClose={handleCloseForm}
        onAddContact={handleAddContact}
        onUpdateContact={handleUpdateContact}
      />
    </View>
  );
};

export default ContactListScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  favoriteCount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a94b3f',
    marginTop: 12,
    marginBottom: 12,
  },

  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    color: '#222',
    marginBottom: 12,
  },

  addButton: {
    backgroundColor: '#a94b3f',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  favoritesButton: {
    backgroundColor: '#333',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  message: {
    fontSize: 15,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#a94b3f',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },

  retryText: {
    color: '#a94b3f',
    fontWeight: 'bold',
    marginTop: 8,
  },

  refreshError: {
    backgroundColor: '#fff0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },

  emptyList: {
    flexGrow: 1,
  },

  listContent: {
    paddingBottom: 20,
  },
});
