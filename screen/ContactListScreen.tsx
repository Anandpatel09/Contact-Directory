import React, { useState } from 'react';

import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

import ContactCard from '../Components/ContactCard';
import AddContactForm, { Contact } from '../Components/ContactForm';

import { useContacts } from '../context/ContactContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactList'>;

const ContactListScreen = ({ navigation }: Props) => {
  // Get shared contacts and favorites from Context
  const { contacts, setContacts, favorites, setFavorites } = useContacts();

  // Local states
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Toggle Favorite
  const toggleFavorite = (contactId: string) => {
    setFavorites(previousFavorites =>
      previousFavorites.includes(contactId)
        ? previousFavorites.filter(id => id !== contactId)
        : [...previousFavorites, contactId],
    );
  };

  // Delete Contact

  const deleteContact = (id: string) => {
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

          onPress: () => {
            // Remove contact from contacts list
            setContacts(previousContacts =>
              previousContacts.filter(contact => contact.id !== id),
            );

            // Remove contact from favorites
            setFavorites(previousFavorites =>
              previousFavorites.filter(favoriteId => favoriteId !== id),
            );

            // Clear editing selection if deleted contact was being edited
            setEditingContact(previous =>
              previous?.id === id ? null : previous,
            );
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Edit Contact

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setModalVisible(true);
  };

  // Open Add Contact Form

  const handleOpenAddForm = () => {
    setEditingContact(null);
    setModalVisible(true);
  };

  // Add New Contact

  const handleAddContact = (newContact: Contact) => {
    setContacts(previousContacts => [newContact, ...previousContacts]);
  };

  // Update Existing Contact

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(previousContacts =>
      previousContacts.map(contact =>
        contact.id === updatedContact.id ? updatedContact : contact,
      ),
    );
  };

  // Close Form

  const handleCloseForm = () => {
    setModalVisible(false);
    setEditingContact(null);
  };

  // Search Contacts

  const filteredContacts = contacts.filter(contact => {
    const query = search.trim().toLowerCase();

    return (
      contact.name.toLowerCase().includes(query) ||
      contact.phone.includes(query)
    );
  });

  // Navigate to Contact Details

  const openContactDetails = (contactId: string) => {
    navigation.navigate('ContactDetails', {
      contactId,
    });
  };

  // UI

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Directory</Text>

      <Text style={styles.subtitle}>All contacts in one place</Text>

      <Text style={styles.favoriteCount}>
        Total Favorites: {favorites.length}
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or phone"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
      />

      {/* Add Contact Button */}

      <View style={styles.addButton}>
        <Button title="+ Add Contact" onPress={handleOpenAddForm} />
      </View>

      {/* Favo button */}
      {/* <Pressable onPress={openFavoriteDetails} style={styles.editButton}>
               <Text style={styles.editButtonText}>Favo</Text>
             </Pressable> */}

      <TouchableOpacity
        style={styles.favoritesButton}
        onPress={() => navigation.navigate('FavoriteDetails')}
      >
        <Text style={styles.favoritesButtonText}>View Favorites Contacts</Text>
      </TouchableOpacity>

      {/* Search Input */}
      {/* Contact List */}

      <FlatList
        style={styles.contactList}
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
            // Navigate when card details are pressed
            onPress={() => openContactDetails(item.id)}
            // Favorite button
            onFavoriteButton={() => toggleFavorite(item.id)}
            // Delete button
            onDeleteContact={() => deleteContact(item.id)}
            // Edit button
            onEditContact={() => handleEditContact(item)}
            // //Favo btn
            // navigateToFavorite={()=>openFavoriteDetails(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No contacts found</Text>
        }
      />

      {/* Add/Edit Contact Modal */}

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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },

  subtitle: {
    fontSize: 14,
    color: '#555555',
    marginTop: 8,
  },

  favoriteCount: {
    fontSize: 14,
    color: '#333333',
    marginTop: 12,
    marginBottom: 15,
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },

  addButton: {
    marginTop: 12,
    marginBottom: 8,
  },

  contactList: {
    flex: 1,
    marginTop: 8,
  },

  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 30,
  },
  editButton: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 5,
  },

  editButtonText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  favoritesButton: {
    backgroundColor: '#1eb0e9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  favoritesButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
