
import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  id: string;
  name: string;
  phone: string;
  isFavorite: boolean;
  onPress: () => void;
  onFavoriteButton: () => void;
  onDeleteContact?: () => void;
  onEditContact?: () => void;
};

const ContactCard = ({
  name,
  phone,
  isFavorite,
  onPress,
  onFavoriteButton,
  onDeleteContact,
  onEditContact,
}: Props) => {
  const getInitials = (fullName: string) => {
    const words = fullName.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0][0] + words[words.length - 1][0]
    ).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <Pressable style={styles.mainContent} onPress={onPress}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>
            {getInitials(name)}
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.favoriteButton}
        onPress={onFavoriteButton}
      >
        <Text style={styles.favoriteIcon}>
          {isFavorite ? '❤️' : '♡'}
        </Text>
      </Pressable>

      {onEditContact && (
        <Pressable
          style={styles.editButton}
          onPress={onEditContact}
        >
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
      )}

      {onDeleteContact && (
        <Pressable
          style={styles.deleteButton}
          onPress={onDeleteContact}
        >
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      )}
    </View>
  );
};

export default ContactCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    height: 45,
    width: 45,
    borderRadius: 25,
    backgroundColor: '#DCEBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  initials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  contactInfo: {
    marginLeft: 10,
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },

  phone: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },

  favoriteButton: {
    padding: 5,
  },

  favoriteIcon: {
    fontSize: 21,
  },

  editButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 6,
    marginLeft: 4,
  },

  deleteButton: {
    backgroundColor: '#D9534F',
    padding: 8,
    borderRadius: 6,
    marginLeft: 4,
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});