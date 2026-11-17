

import { configureStore } from '@reduxjs/toolkit';

import contactsReducer from './slice/contactSlice';
import settingsReducer from './slice/settingsSlice';
import usersReducer from './slice/usersSlice';

// Create Redux Store
export const store = configureStore({
  reducer: {
    contacts: contactsReducer,
    settings: settingsReducer,
    users: usersReducer,
  },
});

// Get the complete Redux state type
export type RootState = ReturnType<typeof store.getState>;

// Get the dispatch function type
export type AppDispatch = typeof store.dispatch;
