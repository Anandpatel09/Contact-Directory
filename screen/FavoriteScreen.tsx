import React from 'react';

import {
  Alert,
  FlatList,
  Image,
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

import ArrowIconpng from '../assets/icons/arrow.png';

import DeleteIcon from '../assets/icons/delete.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

const FavoritesScreen = ({ navigation }: Props) => {
  // Get API contacts from Context API
  const { contacts } = useContacts();

  // Redux dispatch
  const dispatch = useAppDispatch();

  // Get local contacts from Redux
  const localContacts = useAppSelector(state => state.contacts.localContacts);

  // Get favorite IDs
  const favorites = useAppSelector(state => state.contacts.favorites);

  // Get DummyJSON users from Redux
  const apiUsers = useAppSelector(state => state.users.users);

  // Get display mode
  const displayMode = useAppSelector(state => state.settings.displayMode);

  // Get theme
  const theme = useAppSelector(state => state.settings.theme);

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

    favoriteBackground: isDark ? '#3A2B35' : '#FCE7EF',
    favoriteText: isDark ? '#FDA4AF' : '#BE185D',
  };

  // Convert DummyJSON users into Contact format
  const formattedApiUsers: Contact[] = apiUsers.map(user => ({
    id: String(user.id),
    name: `${user.firstName} ${user.lastName}`,
    phone: user.phone,
    email: user.email,
    image: user.image,
  }));

  // Get API contacts from Context
  // Exclude local contacts because they are already in Redux
  const apiContacts: Contact[] = contacts.filter(
    contact => !contact.id.startsWith('local_'),
  );

  // Combine all three contact sources
  const allContacts: Contact[] = [
    ...localContacts,
    ...apiContacts,
    ...formattedApiUsers,
  ];

  // Get only favorite contacts
  const favoriteContacts = allContacts.filter(contact =>
    favorites.includes(String(contact.id)),
  );

  // Remove contact from favorites
  const handleToggleFavorite = (id: string) => {
    dispatch(toggleFavorite(String(id)));
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.container}>
        {/* Screen Heading */}
        <View style={styles.contactDetail}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Image
              source={ArrowIconpng}
              style={[
                styles.backIcon,
                { backgroundColor: colors.iconBackground },
              ]}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={[styles.title, { color: colors.text }]}>
            Favorite Contacts
          </Text>
        </View>

        {/* Favorite Count and Clear Button */}
        <View style={styles.favorite}>
          {/* Total Favorites */}
          <View
            style={[styles.countContainer, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.countLabel}>Total Favorites</Text>

            <Text style={styles.count}>{favoriteContacts.length}</Text>
          </View>

          {/* Clear Favorites Button */}
          <Pressable
            style={[
              styles.clearButton,
              {
                backgroundColor: colors.favoriteBackground,
                borderColor: colors.border,
              },
              favoriteContacts.length === 0 && styles.disabledButton,
            ]}
            disabled={favoriteContacts.length === 0}
            onPress={handleClearFavorites}
          >
            <View style={styles.clearFavorite}>
              <Text style={[styles.buttonText, { color: colors.favoriteText }]}>
                Clear Favorites
              </Text>

              <DeleteIcon width={18} height={18} />
            </View>
          </Pressable>
        </View>

        {/* Favorite Contacts List */}
        <FlatList
          data={favoriteContacts}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Empty List Message
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No favorite contacts found!
            </Text>
          }
          // Render Favorite Contact
          renderItem={({ item }) => (
            <ContactCard
              id={String(item.id)}
              name={item.name}
              phone={item.phone}
              isFavorite={true}
              displayMode={displayMode}
              theme={theme}
              // Open Contact Details
              onPress={() =>
                navigation.navigate('ContactDetails', {
                  contactId: String(item.id),
                })
              }
              // Remove from Favorites
              onFavoriteButton={() => handleToggleFavorite(String(item.id))}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default FavoritesScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  contactDetail: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },

  favorite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },

  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 12,
  },

  countLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  count: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  clearButton: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearFavorite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  buttonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  disabledButton: {
    opacity: 0.4,
  },

  listContent: {
    paddingBottom: 15,
    flexGrow: 1,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },

  backIcon: {
    width: 34,
    height: 24,
    padding: 13,
    borderRadius: 13,
  },
});
