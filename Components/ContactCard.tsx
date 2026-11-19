import React from 'react';

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

// Icons8 SVG icons
import HeartIcon from '../assets/icons/heart.svg';
import EditIcon from '../assets/icons/edit.svg';
import DeleteIcon from '../assets/icons/delete.svg';
type Props = {
  id: string;
  name: string;
  phone: string;
  image?: string | null;
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
  image,
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

  // Theme colors
  const cardBackground = isDark ? '#142D3D' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#172B3A';
  const phoneColor = isDark ? '#A9BBC5' : '#667785';
  const borderColor = isDark ? '#294657' : '#E2EAF0';

  // Generate initials when profile image is unavailable
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
          borderColor: borderColor,
        },
        isCardMode ? styles.gridCard : styles.listCard,
      ]}
    >
      {/* Contact Details */}
      <Pressable
        style={[styles.mainContent, isCardMode && styles.gridMainContent]}
        onPress={onPress}
      >
        {/* Contact Avatar */}
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.initials}>{getInitials(name)}</Text>
          </View>
        )}

        {/* Name and Phone */}
        <View style={styles.contactInfo}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
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
        <Pressable
          style={styles.iconButton}
          onPress={onFavoriteButton}
          hitSlop={8}
        >
          {isFavorite ? <Text> ❤️</Text> : <HeartIcon width={22} height={22} />}
        </Pressable>

        {/* Edit */}
        {onEditContact && (
          <Pressable
            style={styles.iconButton}
            onPress={onEditContact}
            hitSlop={8}
          >
            <EditIcon width={20} height={20} />
          </Pressable>
        )}

        {/* Delete */}
        {onDeleteContact && (
          <Pressable
            style={styles.iconButton}
            onPress={onDeleteContact}
            hitSlop={8}
          >
            {/* <DeleteIcon width={20} height={20} /> */}
            <DeleteIcon
              width={20}
              height={20}
              // color={isDark ? '#FF5252' : '#ec2121'}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default ContactCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,

    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },

  // List Mode
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 82,
    marginBottom: 10,
  },

  // Grid / Cards Mode
  gridCard: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    minHeight: 175,
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

  // Avatar
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCEBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  initials: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  // Contact Information
  contactInfo: {
    marginLeft: 10,
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontSize: 14,
    fontWeight: '700',
  },

  phone: {
    fontSize: 12,
    marginTop: 5,
  },

  // Action Buttons
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
    borderTopColor: '#526675',
    justifyContent: 'space-around',
  },

  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
