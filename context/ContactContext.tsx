
import React, { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Contact } from '../Components/ContactForm';

type ContactContextType = {
  contacts: Contact[];
  setContacts: Dispatch<SetStateAction<Contact[]>>;
  favorites: string[];
  setFavorites: Dispatch<SetStateAction<string[]>>;
};

const ContactContext = createContext<ContactContextType | undefined>(
  undefined
);

type ContactProviderProps = {
  children: React.ReactNode;
  contacts: Contact[];
  setContacts: Dispatch<SetStateAction<Contact[]>>;
  favorites: string[];
  setFavorites: Dispatch<SetStateAction<string[]>>;
};

export const ContactProvider = ({
  children,
  contacts,
  setContacts,
  favorites,
  setFavorites,
}: ContactProviderProps) => {
  return (
    <ContactContext.Provider
      value={{ contacts, setContacts, favorites, setFavorites }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);

  if (!context) {
    throw new Error('useContacts must be used inside ContactProvider');
  }

  return context;
};
