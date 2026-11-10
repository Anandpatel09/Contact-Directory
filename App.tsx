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

// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const App = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Contact Directory is Working!</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     color: '#000000',
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
// });

// export default App;
