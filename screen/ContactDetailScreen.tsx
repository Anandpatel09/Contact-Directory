import React from 'react';

import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

import { useContacts } from '../context/ContactContext';

import { useAppDispatch, useAppSelector } from '../redux/hooks/reduxHooks';

import { toggleFavorite } from '../redux/slice/contactSlice';

import type { Contact } from '../Components/ContactForm';

import CallIcon from '../assets/icons/call.svg';
import SmsIcon from '../assets/icons/sms.svg';
import EmailIcon from '../assets/icons/email.svg';
import ShareIcon from '../assets/icons/share.svg';
import CopyIcon from '../assets/icons/copy.svg';
import ArrowIconpng from '../assets/icons/arrow.png';

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

  // Context API contacts
  const { contacts: contextContacts, isLoading: contextLoading } =
    useContacts();

  // Redux
  const dispatch = useAppDispatch();

  const localContacts = useAppSelector(state => state.contacts.localContacts);

  const favorites = useAppSelector(state => state.contacts.favorites);

  const theme = useAppSelector(state => state.settings.theme);

  // DummyJSON users from Redux thunk
  const { users, status: usersStatus } = useAppSelector(state => state.users);

  // Theme configuration
  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#101820' : '#F4F7FB',
    surface: isDark ? '#1B2935' : '#FFFFFF',
    card: isDark ? '#223442' : '#F8FAFC',

    text: isDark ? '#F1F5F9' : '#172B3A',
    secondaryText: isDark ? '#A8BAC8' : '#64748B',

    border: isDark ? '#344957' : '#E2E8F0',

    primary: isDark ? '#0F9F91' : '#0D9488',
    primaryText: '#FFFFFF',

    iconBackground: isDark ? '#4a6d7d' : '#E0F2F1',

    avatarBackground: isDark ? '#294653' : '#DCEFEB',
    avatarText: isDark ? '#5EEAD4' : '#0F766E',

    // favoriteBackground: isDark ? '#3A2B35' : '#FCE7EF',
    favoriteText: isDark ? '#FDA4AF' : '#BE185D',
  };

  // Convert DummyJSON users into Contact format
  const reduxUsers: Contact[] = users.map(user => ({
    id: String(user.id),
    name: `${user.firstName} ${user.lastName}`,
    phone: user.phone,
    email: user.email,
    image: user.image,
  }));

  // JSONPlaceholder contacts
  const jsonPlaceholderContacts = contextContacts.filter(contact =>
    contact.id.startsWith('users_'),
  );

  // Combine all three contact sources
  const allContacts: Contact[] = [
    ...localContacts,
    ...reduxUsers,
    ...jsonPlaceholderContacts,
  ];

  // Find selected contact
  const contact = allContacts.find(item => item.id === String(contactId));

  // Favorite status
  const isFavorite = contact ? favorites.includes(contact.id) : false;

  // Loading
  const isLoading = contextLoading || usersStatus === 'loading';

  // Get initials from contact name
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Toggle Favorite
  const handleToggleFavorite = () => {
    if (!contact) {
      return;
    }

    dispatch(toggleFavorite(contact.id));
  };

  // Loading Screen
  if (isLoading && !contact) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading contact...
        </Text>
      </View>
    );
  }

  // Contact Not Found
  if (!contact) {
    return (
      <View
        style={[
          styles.notFoundContainer,
          {
            backgroundColor: colors.background,
            paddingHorizontal: Platform.OS === 'ios' ? 24 : 16,
          },
        ]}
      >
        <Text style={[styles.heading, { color: colors.text }]}>
          Contact not found!
        </Text>

        <Pressable
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingHorizontal: Platform.OS === 'ios' ? 24 : 16,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.contactDetail}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <View>
            <Image
              source={ArrowIconpng}
              style={[
                styles.backIcon,
                { backgroundColor: colors.iconBackground },
              ]}
              resizeMode="contain"
            />
          </View>
        </Pressable>

        <Text style={[styles.heading, { color: colors.text }]}>
          Contact Details
        </Text>
      </View>

      {/* Contact Avatar */}
      <View
        style={[styles.avatar, { backgroundColor: colors.avatarBackground }]}
      >
        <Text style={[styles.initials, { color: colors.avatarText }]}>
          {getInitials(contact.name)}
        </Text>
      </View>

      {/* Contact Name */}
      <Text style={[styles.nameContent, { color: colors.text }]}>
        {contact.name}
      </Text>

      {/* Favorite Button */}
      <Pressable
        style={[
          styles.favoriteButton,
          // { backgroundColor: colors.favoriteBackground },
        ]}
        onPress={handleToggleFavorite}
      >
        <Text style={[styles.buttonText, { color: colors.favoriteText }]}>
          {isFavorite ? '❤️ Remove from Favorites' : '♡ Add to Favorites'}
        </Text>
      </Pressable>

      {/* Call, SMS, Mail and Share Buttons */}
      <View style={styles.allButtons}>
        {/* Call Button */}
        <Pressable
          style={[
            styles.allButtonsContent,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => openDialer(contact.phone)}
          disabled={isLoading}
        >
          <CallIcon width={24} height={28} />

          <Text style={styles.actionButtonText}>Call</Text>
        </Pressable>

        {/* SMS Button */}
        <Pressable
          style={[
            styles.allButtonsContent,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => openSms(contact.phone, contact.name)}
          disabled={isLoading}
        >
          <SmsIcon width={24} height={28} />

          <Text style={styles.actionButtonText}>SMS</Text>
        </Pressable>

        {/* Mail Button */}
        <Pressable
          style={[
            styles.allButtonsContent,
            { backgroundColor: colors.primary },
            (!contact.email || isLoading) && styles.disabledButton,
          ]}
          onPress={() => openEmail(contact.email, contact.name)}
          disabled={!contact.email || isLoading}
        >
          <EmailIcon width={24} height={28} />

          <Text style={styles.actionButtonText}>Mail</Text>
        </Pressable>

        {/* Share Button */}
        <Pressable
          style={[
            styles.allButtonsContent,
            { backgroundColor: colors.primary },
          ]}
          onPress={() =>
            shareContact(contact.name, contact.phone, contact.email)
          }
          disabled={isLoading}
        >
          <ShareIcon width={24} height={28} />

          <Text style={styles.actionButtonText}>Share</Text>
        </Pressable>
      </View>

      {/* Contact Information Card */}
      <View
        style={[
          styles.detailsCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.contactInfo, { color: colors.text }]}>
          Contact Information
        </Text>

        {/* Phone Details */}
        <View
          style={[
            styles.phoneCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.phoneCardInner}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <CallIcon width={24} height={28} />
            </View>

            <View style={styles.detailTextContainer}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>
                Phone
              </Text>

              <Text style={[styles.value, { color: colors.text }]}>
                {contact.phone}
              </Text>
            </View>
          </View>

          <Pressable onPress={() => copyContact(contact.phone)} hitSlop={10}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <CopyIcon width={24} height={28} />
            </View>
          </Pressable>
        </View>

        {/* Email Details */}
        <View
          style={[
            styles.phoneCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.phoneCardInner}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <EmailIcon width={24} height={28} />
            </View>

            <View style={styles.detailTextContainer}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>
                Email
              </Text>

              <Text style={[styles.value, { color: colors.text }]}>
                {contact.email || 'No Email'}
              </Text>
            </View>
          </View>
        </View>

        {/* Favorite Status */}
        <View style={styles.favoriteStatus}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>
            Favorite Status
          </Text>

          <Text style={[styles.value, { color: colors.text }]}>
            {isFavorite ? 'Yes ❤️' : 'No'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ContactDetailsScreen;

// STYLES
const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },

  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  contactDetail: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  backIcon: {
    width: 34,
    height: 24,
    padding: 13,
    borderRadius: 13,
  },

  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 18,
  },

  initials: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  nameContent: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },

  favoriteButton: {
    // paddingVertical: 12,
    // paddingHorizontal: 20,
    // borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 22,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  allButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  },

  allButtonsContent: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    elevation: 2,
  },

  actionButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  disabledButton: {
    opacity: 0.5,
  },

  detailsCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
  },

  contactInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  phoneCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
  },

  phoneCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailTextContainer: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 5,
  },

  favoriteStatus: {
    marginTop: 10,
  },

  backButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 15,
    borderRadius: 10,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
