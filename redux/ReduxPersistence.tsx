import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { hydrateContacts } from './contactSlice';
import type { Contact } from '../Components/ContactForm';

type Props = {
  children: React.ReactNode;
};

const ReduxPersistence = ({ children }: Props) => {
  const dispatch = useAppDispatch();

  const localContacts = useAppSelector(
    state => state.contacts.localContacts,
  );

  const favorites = useAppSelector(
    state => state.contacts.favorites,
  );

  const [isHydrated, setIsHydrated] = useState(false);

  // Restore saved Redux data when the app starts.
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedContacts = await AsyncStorage.getItem('localContacts');
        const savedFavorites = await AsyncStorage.getItem('favoriteContacts');

        const contacts: Contact[] = savedContacts
          ? JSON.parse(savedContacts)
          : [];

        const favoriteIds: string[] = savedFavorites
          ? JSON.parse(savedFavorites)
          : [];

        dispatch(
          hydrateContacts({
            localContacts: Array.isArray(contacts) ? contacts : [],
            favorites: Array.isArray(favoriteIds) ? favoriteIds : [],
          }),
        );
      } catch (error) {
        console.log('Error restoring contacts:', error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadData();
  }, [dispatch]);

  // Save whenever Redux contacts or favorites change.
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const saveData = async () => {
  try {
    await AsyncStorage.setItem(
      'localContacts',
      JSON.stringify(localContacts),
    );

    await AsyncStorage.setItem(
      'favoriteContacts',
      JSON.stringify(favorites),
    );

    console.log('Redux data saved successfully');
  } catch (error) {
    console.log('Error saving contacts:', error);
  }
};

    saveData();
  }, [localContacts, favorites, isHydrated]);

  // Do not show screens until saved data has been restored.
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
};

export default ReduxPersistence;