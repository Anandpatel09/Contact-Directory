
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from './types';
import ContactListScreen from '../screen/ContactListScreen';
import ContactDetailsScreen from '../screen/ContactDetailScreen';
import FavoritesScreen from '../screen/FavoriteScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ContactList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ContactList" component={ContactListScreen} />

      <Stack.Screen name="ContactDetails" component={ContactDetailsScreen} />

      <Stack.Screen name="Favorites" component={FavoritesScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
