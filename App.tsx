import React from 'react';

import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

import { store } from './redux/store';
import ReduxPersistence from './redux/ReduxPersistence';

import { ContactProvider } from './context/ContactContext';

import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <Provider store={store}>
      <ReduxPersistence>
        <ContactProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ContactProvider>
      </ReduxPersistence>
    </Provider>
  );
};

export default App;