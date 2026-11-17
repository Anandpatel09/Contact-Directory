import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  id: string;
  name: string;
  phone: string;
  isFavorite: boolean;
  displayMode: 'list' | 'cards';
  theme: 'light' | 'dark';
  onPress: () => void;
  onFavoriteButton: () => void;
  onDeleteContact?: () => void;
  onEditContact?: () => void;
};

const ContactCard = ({
  name,
  phone,
  isFavorite,
  displayMode,
  theme,
  onPress,
  onFavoriteButton,
  onDeleteContact,
  onEditContact,
}: Props) => {
  const isCardMode = displayMode === 'cards';
  const isDark = theme === 'dark';

  const cardBackground = isDark ? '#292929' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#222222';
  const phoneColor = isDark ? '#BBBBBB' : '#666666';
  const borderColor = isDark ? '#444444' : '#DDDDDD';

  const getInitials = (fullName: string) => {
    const words = fullName.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBackground,
          borderColor,
        },
        isCardMode ? styles.gridCard : styles.listCard,
      ]}
    >
      {/* Contact Details */}
      <Pressable
        style={[styles.mainContent, isCardMode && styles.gridMainContent]}
        onPress={onPress}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.initials}>{getInitials(name)}</Text>
        </View>

        {/* Name and Phone */}
        <View style={styles.contactInfo}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
            {name}
          </Text>

          <Text style={[styles.phone, { color: phoneColor }]} numberOfLines={1}>
            {phone}
          </Text>
        </View>
      </Pressable>

      {/* Action Buttons */}
      <View style={[styles.actions, isCardMode && styles.gridActions]}>
        {/* Favorite */}
        <Pressable style={styles.favoriteButton} onPress={onFavoriteButton}>
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '♡'}</Text>
        </Pressable>

        {/* Edit */}
        {onEditContact && (
          <Pressable style={styles.editButton} onPress={onEditContact}>
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
        )}

        {/* Delete */}
        {onDeleteContact && (
          <Pressable style={styles.deleteButton} onPress={onDeleteContact}>
            <Text style={styles.actionText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default ContactCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },

  // List mode
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
  },

  // Cards mode
  gridCard: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    minHeight: 155,
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  gridMainContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  avatar: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#DCEBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  initials: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  contactInfo: {
    marginLeft: 10,
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  phone: {
    fontSize: 12,
    marginTop: 5,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },

  gridActions: {
    marginLeft: 0,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#777777',
    justifyContent: 'space-between',
  },

  favoriteButton: {
    padding: 5,
  },

  favoriteIcon: {
    fontSize: 20,
  },

  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 4,
  },

  deleteButton: {
    backgroundColor: '#D9534F',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 4,
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
