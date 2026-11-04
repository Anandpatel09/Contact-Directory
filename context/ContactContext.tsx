// import React, { createContext, useContext } from 'react';
// import type { Dispatch, SetStateAction } from 'react';
// import type { Contact } from '../Components/ContactForm';

// type ContactContextType = {
//   contacts: Contact[];
//   setContacts: Dispatch<SetStateAction<Contact[]>>;

//   favorites: string[];
//   setFavorites: Dispatch<SetStateAction<string[]>>;

//   loading: boolean;
//   error: string | null;
//   refreshContacts: () => Promise<void>;
// };
// const ContactContext = createContext<ContactContextType | undefined>(undefined);

// type ContactProviderProps = {
//   children: React.ReactNode;
//   contacts: Contact[];
//   setContacts: Dispatch<SetStateAction<Contact[]>>;

//   favorites: string[];
//   setFavorites: Dispatch<SetStateAction<string[]>>;

//   loading: boolean;
//   error: string | null;
//   refreshContacts: () => Promise<void>;
// };

// export const ContactProvider = ({
//   children,
//   contacts,
//   setContacts,
//   favorites,
//   setFavorites,
//   loading,
//   error,
//   refreshContacts,
// }: ContactProviderProps) => {
//   return (
//     <ContactContext.Provider
//       value={{
//         contacts,
//         setContacts,
//         favorites,
//         setFavorites,
//         loading,
//         error,
//         refreshContacts,
//       }}
//     >
//       {children}
//     </ContactContext.Provider>
//   );
// };

// export const useContacts = () => {
//   const context = useContext(ContactContext);

//   if (!context) {
//     throw new Error('useContacts must be used inside ContactProvider');
//   }

//   return context;
// };

import React, { createContext, useContext } from 'react';

import type { Contact } from '../Components/ContactForm';

// CONTEXT TYPE

type ContactContextType = {
  contacts: Contact[];

  favorites: string[];

  loading: boolean;

  error: string | null;

  addContact: (contact: Contact) => Promise<void>;

  updateContact: (contact: Contact) => Promise<void>;

  deleteContact: (contactId: string) => Promise<void>;

  toggleFavorite: (contactId: string) => Promise<void>;

  refreshContacts: () => Promise<void>;
};

// PROVIDER PROPS

type ContactProviderProps = ContactContextType & {
  children: React.ReactNode;
};

// CREATE CONTEXT

const ContactContext = createContext<ContactContextType | undefined>(undefined);

// CONTACT PROVIDER

export const ContactProvider = ({
  children,
  contacts,
  favorites,
  loading,
  error,
  addContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  refreshContacts,
}: ContactProviderProps) => {
  return (
    <ContactContext.Provider
      value={{
        contacts,
        favorites,
        loading,
        error,
        addContact,
        updateContact,
        deleteContact,
        toggleFavorite,
        refreshContacts,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};


// CUSTOM HOOK

export const useContacts = () => {
  const context = useContext(ContactContext);

  if (!context) {
    throw new Error('useContacts must be used inside ContactProvider');
  }

  return context;
};
