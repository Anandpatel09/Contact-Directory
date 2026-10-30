import { Contact } from '../Components/ContactForm';

export type RootStackParamList = {
  ContactList: undefined;
  ContactDetails: {
    contactId: string;
  };
  FavoriteDetails: undefined;
};
