import React from 'react';

import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

import { store } from './redux/store';
import ReduxPersistence from './redux/ReduxPersistence';

import { ContactProvider } from './context/ContactContext';

import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <Provider store={store}>
      <ReduxPersistence>
        <ContactProvider>
          <NavigationContainer>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </NavigationContainer>
        </ContactProvider>
      </ReduxPersistence>
    </Provider>
  );
};

export default App;
