import React from 'react';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

import ContactListScreen from './ContactListScreen';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Favorites'
>;

const FavoritesScreen = ({ navigation }: Props) => {
  return (
    <ContactListScreen
      navigation={navigation}
      showFavorites={true}
    />
  );
};

export default FavoritesScreen;