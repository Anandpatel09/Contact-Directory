import React, { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';

import { hydrateContacts } from './slice/contactSlice';

import { hydrateSettings } from './slice/settingsSlice';

import type { Contact } from '../Components/ContactForm';

type ThemePreference = 'light' | 'dark';

type DisplayPreference = 'list' | 'cards';

const ReduxPersistence = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  // Redux state
  const localContacts = useAppSelector(state => state.contacts.localContacts);

  const favorites = useAppSelector(state => state.contacts.favorites);

  const theme = useAppSelector(state => state.settings.theme);

  const displayMode = useAppSelector(state => state.settings.displayMode);

  // Tracks whether saved data has been loaded
  const [isHydrated, setIsHydrated] = useState(false);

  // LOAD DATA FROM ASYNC STORAGE

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [savedContacts, savedFavorites, savedTheme, savedDisplayMode] =
          await Promise.all([
            AsyncStorage.getItem('localContacts'),
            AsyncStorage.getItem('favoriteContacts'),
            AsyncStorage.getItem('appTheme'),
            AsyncStorage.getItem('displayMode'),
          ]);

        // Restore local contacts
        const parsedContacts: Contact[] = savedContacts
          ? JSON.parse(savedContacts)
          : [];

        // Restore favorite IDs
        const parsedFavorites: string[] = savedFavorites
          ? JSON.parse(savedFavorites)
          : [];

        dispatch(
          hydrateContacts({
            localContacts: Array.isArray(parsedContacts) ? parsedContacts : [],
            favorites: Array.isArray(parsedFavorites) ? parsedFavorites : [],
          }),
        );

        // Restore theme
        const validTheme: ThemePreference =
          savedTheme === 'dark' ? 'dark' : 'light';

        // Restore display mode
        const validDisplayMode: DisplayPreference =
          savedDisplayMode === 'cards' ? 'cards' : 'list';

        dispatch(
          hydrateSettings({
            theme: validTheme,
            displayMode: validDisplayMode,
          }),
        );
      } catch (error) {
        console.log('Error loading saved Redux data:', error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadSavedData();
  }, [dispatch]);

  // SAVE REDUX DATA TO ASYNC STORAGE

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

        await AsyncStorage.setItem('appTheme', theme);

        await AsyncStorage.setItem('displayMode', displayMode);
      } catch (error) {
        console.log('Error saving Redux data:', error);
      }
    };

    saveData();
  }, [isHydrated, localContacts, favorites, theme, displayMode]);

  // Don't render the app before restoring saved data
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
};

export default ReduxPersistence;
