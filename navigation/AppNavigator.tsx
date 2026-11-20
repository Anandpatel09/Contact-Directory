import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from './types';
import ContactListScreen from '../screen/ContactListScreen';
import ContactDetailsScreen from '../screen/ContactDetailScreen';
import FavoritesScreen from '../screen/FavoriteScreen';
import PhoneLoginScreen from '../screen/PhoneLoginScreen';
import OtpVerificationScreen from '../screen/OtpVerificationScreen';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#29d699" />
      </View>
    );
  }
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
          <Stack.Screen
            name="OtpVerification"
            component={OtpVerificationScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="ContactList" component={ContactListScreen} />
          <Stack.Screen
            name="ContactDetails"
            component={ContactDetailsScreen}
          />

          <Stack.Screen name="Favorites" component={FavoritesScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default AppNavigator;
