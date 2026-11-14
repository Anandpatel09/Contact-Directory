import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './navigation/AppNavigator';

import { ContactProvider } from './context/ContactContext';

const App = () => {
  return (
    <ContactProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ContactProvider>
  );
};

export default App;
