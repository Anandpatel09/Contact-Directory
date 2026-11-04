import React, { useState } from 'react';

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
    error,
    toggleFavorite,
    addContact,
    updateContact,
    deleteContact,
    refreshContacts,
  } = useContacts();

  const [search, setSearch] = useState('');

  const [modalVisible, setModalVisible] = useState(false);

  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Search contacts by name
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  // Open add contact form
  const handleAddContact = () => {
    setEditingContact(null);
    setModalVisible(true);
  };

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
              await deleteContact(contact);
            } catch (deleteError) {
              Alert.alert('Error', 'Unable to save the deleted contact.');
            }
          },
        },
      ],
    );
  };

  const handleCloseForm = () => {
    setModalVisible(false);
    setEditingContact(null);
  };

  // Show loading indicator during initial initialization
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />

        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Contact Directory</Text>

        <Text style={styles.subtitle}>All your contacts in one place</Text>

        <Text style={styles.favoriteCount}>
          Total Favorites: {favorites.length}
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts by name"
          placeholderTextColor="#777777"
          value={search}
          onChangeText={setSearch}
        />

        <Pressable style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.buttonText}>+ Add Contact</Text>
        </Pressable>

        <Pressable
          style={styles.favoritesButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.buttonText}>View Favorites</Text>
        </Pressable>

        {error !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>

            <Pressable style={styles.retryButton} onPress={refreshContacts}>
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshContacts}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {search.trim() !== ''
                ? 'No contacts match your search.'
                : error !== ''
                ? 'No contacts available. Please retry.'
                : 'No contacts found.'}
            </Text>
          }
          renderItem={({ item }) => (
            <ContactCard
              id={item.id}
              name={item.name}
              phone={item.phone}
              isFavorite={favorites.includes(item.id)}
              onPress={() =>
                navigation.navigate('ContactDetails', {
                  contactId: item.id,
                })
              }
              onFavoriteButton={() => {
                toggleFavorite(item.id).catch(() => {
                  Alert.alert('Error', 'Unable to save favorite status.');
                });
              }}
              onEditContact={
                item.id.startsWith('local_')
                  ? () => handleEditContact(item)
                  : undefined
              }
              onDeleteContact={() => handleDeleteContact(item)}
            />
          )}
        />

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
});
