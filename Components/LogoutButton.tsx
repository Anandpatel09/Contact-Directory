import React from 'react';
import {Alert, Pressable, Text, StyleSheet} from 'react-native';
import {getAuth, signOut} from '@react-native-firebase/auth';

const LogoutButton = () => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await signOut(getAuth());
            } catch (error) {
              Alert.alert('Error', 'Unable to logout.');
            }
          },
        },
      ],
    );
  };

  return (
    <Pressable style={styles.button} onPress={handleLogout}>
      <Text style={styles.buttonText}>Logout</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E53935',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LogoutButton;