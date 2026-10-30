import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

import ContactCard from '../Components/ContactCard';
import { useContacts } from '../context/ContactContext';

type Props = NativeStackScreenProps<RootStackParamList, 'FavoriteDetails'>;

const FavoritesScreen = ({ navigation }: Props) => {
  const { contacts, favorites, setFavorites } = useContacts();

  // Display only favorite contacts
  const favoriteContacts = contacts.filter(contact =>
    favorites.includes(contact.id)
  );

  // Remove contact from favorites
  const removeFavorite = (contactId: string) => {
    setFavorites(previous =>
      previous.filter(id => id !== contactId)
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Contacts </Text>

      <Text style={styles.subtitle}>
        Your favorite contacts in one place
      </Text>

      <Text style={styles.count}>
        Total Favorites: {favoriteContacts.length}
      </Text>

      <FlatList
        data={favoriteContacts}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No favorite contacts found!
          </Text>
        }
        renderItem={({ item }) => (
          <ContactCard
            id={item.id}
            name={item.name}
            phone={item.phone}
            email={item.email}
            image={item.image}
            isFavorite={true}
            onPress={() =>
              navigation.navigate('ContactDetails', {
                contactId: item.id,
              })
            }
            onFavoriteButton={() => removeFavorite(item.id)}
          />
        )}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },

  count: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 15,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 40,
  },

  backButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});