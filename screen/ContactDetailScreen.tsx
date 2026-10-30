import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useContacts } from '../context/ContactContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactDetails'>;

const ContactDetailsScreen = ({ route, navigation }: Props) => {
  const { contactId } = route.params;
  const { contacts, favorites } = useContacts();

  const contact = contacts.find(item => item.id === contactId);

  if (!contact) {
    return (
      <View style={styles.container}>
        <Text>no Contact found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isFavorite = favorites.includes(contact.id);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Contact Details</Text>

      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{contact.name}</Text>

      <Text style={styles.label}>Phone</Text>
      <Text style={styles.value}>{contact.phone}</Text>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{contact.email || 'Email not available'}</Text>

      <Text style={styles.label}>Favorite</Text>
      <Text style={styles.value}>{isFavorite ? 'Yes' : 'No'}</Text>

      {/* <Button title="Go Back" onPress={() => navigation.goBack()} /> */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#111827',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 15,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 5,
  },
  backButton: {
    backgroundColor: '#a87ff3',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },

  backButtonText: {
    color: '#060606',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
