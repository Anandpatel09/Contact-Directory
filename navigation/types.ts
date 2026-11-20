// export type RootStackParamList = {
//   ContactList: undefined;

//   Favorites: undefined;

//   ContactDetails: {
//     contactId: string;
//   };
// };
export type RootStackParamList = {
  ContactList: undefined;

  ContactDetails: {
    contactId: string;
  };

  Favorites: undefined;
  //firebase authentication screen
  PhoneLogin: undefined;
  OtpVerification: undefined;
};
