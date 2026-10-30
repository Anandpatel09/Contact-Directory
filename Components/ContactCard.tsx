import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';

type ContactCardData = {
  id: string;
  name: string;
  phone: string;
  image: string | null;
  email?: string | null;
  isFavorite: boolean;
  onPress: () => void;
  onFavoriteButton: () => void;
  onDeleteContact?: () => void;
  onEditContact?: () => void;
  // navigateToFavorite: () => void;
};

const ContactCard = ({
  name,
  phone,
  isFavorite,
  image,
  onPress,
  onFavoriteButton,
  onDeleteContact,
  onEditContact,
 
}: ContactCardData) => {
  const [imageError, setImageError] = useState(false);

  const avatarSource =
    image !== null && image !== '' && !imageError
      ? { uri: image }
      : require('../assets/fallback.png');

  return (
    <View style={styles.card}>
      {/* Card details - press to open details screen */}
      <Pressable style={styles.mainContent} onPress={onPress}>
        <Image
          source={avatarSource}
          style={styles.avatar}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />

        <View style={styles.details}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>
      </Pressable>

      {/* Favorite button */}
      <Pressable
        style={styles.favoriteButton}
        onPress={onFavoriteButton}
        accessibilityRole="button"
        accessibilityLabel={
          isFavorite ? 'Remove from favorites' : 'Add to favorites'
        }
      >
        <Text style={[styles.heart, isFavorite && styles.activeHeart]}>
          {isFavorite ? '♥' : '♡'}
        </Text>
      </Pressable>

      {/* Delete button */}
      <Pressable style={styles.editButton} onPress={onDeleteContact}>
        <Text style={styles.editButtonText}>Delete</Text>
      </Pressable>

      {/* Edit button */}
      <Pressable onPress={onEditContact} style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit</Text>
      </Pressable>
      {/* Favo button */}
      {/* <Pressable onPress={navigateToFavorite} style={styles.editButton}>
        <Text style={styles.editButtonText}>Favo</Text>
      </Pressable> */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf4f4',
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'black',
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
  },

  details: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#172033',
  },

  phone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  favoriteButton: {
    padding: 8,
  },

  heart: {
    fontSize: 27,
    color: '#9CA3AF',
  },

  activeHeart: {
    color: '#E25565',
  },

  editButton: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 5,
  },

  editButtonText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
});

export default ContactCard;
