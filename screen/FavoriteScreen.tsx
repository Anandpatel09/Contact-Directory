
import React from 'react';

import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

import ContactCard from '../Components/ContactCard';

import type { Contact } from '../Components/ContactForm';

import { useContacts } from '../context/ContactContext';

import { useAppDispatch, useAppSelector } from '../redux/hooks/reduxHooks';

import { toggleFavorite, clearFavorites } from '../redux/slice/contactSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

const FavoritesScreen = ({ navigation }: Props) => {
  // Get API contacts from Context
  const { contacts } = useContacts();

  // Get Redux dispatch
  const dispatch = useAppDispatch();

  // Get locally added contacts from Redux
  const localContacts = useAppSelector(state => state.contacts.localContacts);

  // Get favorite IDs from Redux
  const favorites = useAppSelector(state => state.contacts.favorites);

  // Get display mode from Redux
  const displayMode = useAppSelector(state => state.settings.displayMode);

  // Get theme from Redux
  const theme = useAppSelector(state => state.settings.theme);

  // Remove local contacts from Context because they are already stored in Redux
  const apiContacts = contacts.filter(
    contact => !contact.id.startsWith('local_'),
  );

  // Combine local contacts and API contacts
  const allContacts: Contact[] = [...localContacts, ...apiContacts];

  // Get only favorite contacts
  const favoriteContacts = allContacts.filter(contact =>
    favorites.includes(contact.id),
  );

  // Remove a contact from favorites
  const handleToggleFavorite = (id: string) => {
    dispatch(toggleFavorite(id));
  };

  // Clear all favorites
  const handleClearFavorites = () => {
    Alert.alert(
      'Clear Favorites',
      'Are you sure you want to remove all favorite contacts?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            dispatch(clearFavorites());
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        {/* Screen Heading */}
        <Text style={styles.title}>Favorite Contacts</Text>

        {/* Total Favorites */}
        <Text style={styles.count}>
          Total Favorites: {favoriteContacts.length}
        </Text>

        {/* Clear Favorites Button */}
        <Pressable
          style={[
            styles.clearButton,
            favoriteContacts.length === 0 && styles.disabledButton,
          ]}
          disabled={favoriteContacts.length === 0}
          onPress={handleClearFavorites}
        >
          <Text style={styles.buttonText}>Clear Favorites</Text>
        </Pressable>

        {/* Favorite Contacts List */}
        <FlatList
          data={favoriteContacts}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Empty List Message
          ListEmptyComponent={
            <Text style={styles.emptyText}>No favorite contacts found!</Text>
          }
          // Render Favorite Contact
          renderItem={({ item }) => (
            <ContactCard
              id={item.id}
              name={item.name}
              phone={item.phone}
              isFavorite={true}
              displayMode={displayMode}
              theme={theme}
              // Open Contact Details
              onPress={() =>
                navigation.navigate('ContactDetails', {
                  contactId: item.id,
                })
              }
              // Remove from Favorites
              onFavoriteButton={() => handleToggleFavorite(item.id)}

              // Edit is not enabled on Favorites screen
              // Delete is not enabled on Favorites screen
            />
          )}
        />

        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default FavoritesScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },

  count: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 12,
    color: '#222',
  },

  clearButton: {
    backgroundColor: '#D9534F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  listContent: {
    paddingBottom: 15,
    flexGrow: 1,
  },

  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 40,
  },

  backButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
});
