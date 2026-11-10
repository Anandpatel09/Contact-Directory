import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

import { useContacts } from '../context/ContactContext';
import CustomButton from '../Components/CustomButtons';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactDetails'>;

const ContactDetailsScreen = ({ route, navigation }: Props) => {
  const { contactId } = route.params;

  const { contacts, favorites, isLoading } = useContacts();

  const contact = contacts.find(item => item.id === contactId);

  if (!contact) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Contact not found!</Text>

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isFavorite = favorites.includes(contact.id);

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getInitials(contact.name)}</Text>
      </View>
      <Text style={styles.heading}>Contact Details</Text>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{contact.name}</Text>
      <Text style={styles.label}>Phone Number</Text>
      <Text style={styles.value}>{contact.phone}</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{contact.email || 'Email not available'}</Text>
      <Text style={styles.label}>Favorite Status</Text>
      <Text style={styles.value}>{isFavorite ? 'Yes ❤️' : 'No'}</Text>

      {/* <Pressable>
        <CustomButton
          title="Call "
          onPress={() => navigation.goBack()}
          backgroundColor="green"
          loading={isLoading}
        />
      </Pressable> */}

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </Pressable>
    </View>
  );
};

export default ContactDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },

  avatar: {
    height: 90,
    width: 90,
    borderRadius: 50,
    backgroundColor: '#DCEBFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
  },

  initials: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: '#777',
    marginTop: 15,
  },

  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginTop: 5,
  },

  backButton: {
    backgroundColor: '#2196F3',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
