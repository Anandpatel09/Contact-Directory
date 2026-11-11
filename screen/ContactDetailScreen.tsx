import React from 'react';

import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

import { useContacts } from '../context/ContactContext';

import CustomButton from '../Components/CustomButtons';
import {
  copyContact,
  openDialer,
  openEmail,
  openSms,
  shareContact,
} from '../utils/contactActions';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactDetails'>;

const ContactDetailsScreen = ({ route, navigation }: Props) => {
  const { contactId } = route.params;

  const { contacts, favorites, isLoading } = useContacts();

  // Find selected contact
  const contact = contacts.find(item => item.id === contactId);

  // Detect current platform
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';

  // Handle contact not found
  if (!contact) {
    return (
      <View
        style={[
          styles.container,
          isAndroid ? styles.androidContainer : styles.iosContainer,
        ]}
      >
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

  // Check favorite status
  const isFavorite = favorites.includes(contact.id);

  // Generate initials
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <ScrollView
      style={[
        styles.container,
        isAndroid ? styles.androidContainer : styles.iosContainer,
      ]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Contact Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getInitials(contact.name)}</Text>
      </View>

      {/* Contact Heading */}
      <Text style={styles.heading}>Contact Details</Text>

      {/* Contact Information */}
      <View style={styles.detailsCard}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{contact.name}</Text>

        <Text style={styles.label}>Phone Number</Text>
        <Text style={styles.value}>{contact.phone}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>
          {contact.email || 'Email not available'}
        </Text>

        <Text style={styles.label}>Favorite Status</Text>
        <Text style={styles.value}>{isFavorite ? 'Yes ❤️' : 'No'}</Text>
      </View>

      {/* First Row */}
      <View style={styles.buttonRow}>
        {/* Call button Contact  */}
        <View style={styles.buttonItem}>
          <CustomButton
            title="Call Contact"
            onPress={() => openDialer(contact.phone)}
            backgroundColor="#0D9488"
            loading={isLoading}
          />
        </View>
        {/* SMS Button */}
        <View style={styles.buttonItem}>
          <CustomButton
            title="Send SMS"
            onPress={() => openSms(contact.phone, contact.name)}
            backgroundColor="#2196F3"
            loading={isLoading}
          />
        </View>
      </View>

      {/* Second Row */}
      <View style={styles.buttonRow}>
        {/* Mail Button */}
        <View style={styles.buttonItem}>
          <CustomButton
            title="Send Mail"
            onPress={() => openEmail(contact.email, contact.name)}
            backgroundColor="#2196F3"
            loading={isLoading}
            disabled={!contact.email}
          />
        </View>
        {/* Share Contact Button  */}
        <View style={styles.buttonItem}>
          <CustomButton
            title="Share Contact"
            onPress={() =>
              shareContact(contact.name, contact.phone, contact.email)
            }
            backgroundColor="#8B5CF6"
            loading={isLoading}
          />
        </View>
      </View>
      <View style={styles.buttonRow}>
        {/* copy Contact Button */}
        <View style={styles.buttonItem}>
          <CustomButton
            title="Copy Contact"
            onPress={() => copyContact(contact.phone)}
            backgroundColor="#2196F3"
            loading={isLoading}
          />
        </View>
      </View>

      {/* Back Button */}
      <Pressable
        style={[
          styles.backButton,
          isIOS ? styles.iosBackButton : styles.androidBackButton,
        ]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </Pressable>
    </ScrollView>
  );
};

export default ContactDetailsScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },

  buttonItem: {
    flex: 1,
  },
  androidContainer: {
    paddingHorizontal: 16,
  },

  iosContainer: {
    paddingHorizontal: 24,
  },

  contentContainer: {
    paddingTop: 20,
    paddingBottom: 30,
  },

  avatar: {
    height: 90,
    width: 90,
    borderRadius: 50,
    backgroundColor: '#DCEBFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
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

  detailsCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    color: '#777',
    marginTop: 12,
  },

  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginTop: 5,
  },

  backButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },

  androidBackButton: {
    borderRadius: 8,
  },

  iosBackButton: {
    borderRadius: 20,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
