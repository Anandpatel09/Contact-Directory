import type { Contact } from '../Components/ContactForm';

// Define the reducer state
export type ContactState = {
  localContacts: Contact[];
  favorites: string[];
};

//  Define all actions
export type ContactAction =
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | {
      type: 'SET_INITIAL_DATA';
      payload: ContactState;
    }
  | { type: 'CLEAR_FAVORITES' };

// Initial state
export const initialContactState: ContactState = {
  localContacts: [],
  favorites: [],
};

//   Reducer function
export const contactReducer = (
  state: ContactState,
  action: ContactAction,
): ContactState => {
  switch (action.type) {
    case 'ADD_CONTACT': {
      return {
        ...state,
        localContacts: [
          action.payload,
          ...state.localContacts.filter(
            contact => contact.id !== action.payload.id,
          ),
        ],
      };
    }

    case 'DELETE_CONTACT': {
      return {
        ...state,
        localContacts: state.localContacts.filter(
          contact => contact.id !== action.payload,
        ),
        favorites: state.favorites.filter(id => id !== action.payload),
      };
    }

    case 'TOGGLE_FAVORITE': {
      const isFavorite = state.favorites.includes(action.payload);

      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter(id => id !== action.payload)
          : [...state.favorites, action.payload],
      };
    }

    case 'UPDATE_CONTACT': {
      return {
        ...state,
        localContacts: state.localContacts.map(contact =>
          contact.id === action.payload.id ? action.payload : contact,
        ),
      };
    }

    case 'SET_INITIAL_DATA': {
      return {
        ...state,
        localContacts: action.payload.localContacts,
        favorites: action.payload.favorites,
      };
    }

    case 'CLEAR_FAVORITES': {
      return {
        ...state,
        favorites: [],
      };
    }

    default:
      return state;
  }
};
