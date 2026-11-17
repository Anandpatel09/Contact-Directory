import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Contact } from '../../Components/ContactForm';

type ContactState = {
  localContacts: Contact[];
  favorites: string[];
};

const initialState: ContactState = {
  localContacts: [],
  favorites: [],
};

const contactSlice = createSlice({
  name: 'contacts',
  initialState,

  reducers: {
    addContact: (state, action: PayloadAction<Contact>) => {
      state.localContacts.unshift(action.payload);
    },

    // Needed if your existing ContactForm supports editing.
    updateContact: (state, action: PayloadAction<Contact>) => {
      const index = state.localContacts.findIndex(
        contact => contact.id === action.payload.id,
      );

      if (index !== -1) {
        state.localContacts[index] = action.payload;
      }
    },

    deleteContact: (state, action: PayloadAction<string>) => {
      state.localContacts = state.localContacts.filter(
        contact => contact.id !== action.payload,
      );

      // Also remove the deleted contact from favorites.
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },

    toggleFavorite: (state, action: PayloadAction<string>) => {
      const contactId = action.payload;

      if (state.favorites.includes(contactId)) {
        state.favorites = state.favorites.filter(id => id !== contactId);
      } else {
        state.favorites.push(contactId);
      }
    },

    clearFavorites: state => {
      state.favorites = [];
    },

    // Used when restoring data from AsyncStorage.
    hydrateContacts: (state, action: PayloadAction<ContactState>) => {
      state.localContacts = action.payload.localContacts;
      state.favorites = action.payload.favorites;
    },
  },
});

export const {
  addContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  clearFavorites,
  hydrateContacts,
} = contactSlice.actions;

export default contactSlice.reducer;
