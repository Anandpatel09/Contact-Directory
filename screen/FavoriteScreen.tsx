
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

import { useContacts } from '../context/ContactContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

const FavoritesScreen = ({ navigation }: Props) => {
  const { contacts, favorites, toggleFavorite, clearFavorites } = useContacts();

  const favoriteContacts = contacts.filter(contact =>
    favorites.includes(contact.id),
  );

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
          onPress: async () => {
            try {
              await clearFavorites();
            } catch (error) {
              Alert.alert('Error', 'Unable to clear favorites.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Favorite Contacts </Text>

        <Text style={styles.count}>
          Total Favorites: {favoriteContacts.length}
        </Text>

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

        <FlatList
          data={favoriteContacts}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No favorite contacts found!</Text>
          }
          renderItem={({ item }) => (
            <ContactCard
              id={item.id}
              name={item.name}
              phone={item.phone}
              isFavorite={true}
              onPress={() =>
                navigation.navigate('ContactDetails', {
                  contactId: item.id,
                })
              }
              onFavoriteButton={() => {
                toggleFavorite(item.id).catch(() => {
                  Alert.alert('Error', 'Unable to update favorite.');
                });
              }}
            />
          )}
        />

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
    marginBottom: 40,
  },
});
