import { configureStore } from '@reduxjs/toolkit';

import contactsReducer from './contactSlice';

// Create Redux Store
export const store = configureStore({
  reducer: {
    contacts: contactsReducer,
  },
});

// Get the complete Redux state type
export type RootState = ReturnType<typeof store.getState>;

// Get the dispatch function type
export type AppDispatch = typeof store.dispatch;
