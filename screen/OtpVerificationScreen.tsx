import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

import { verifyPhoneOtp } from '../services/firebaseAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

const OtpVerificationScreen = ({ navigation }: Props) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);

      const user = await verifyPhoneOtp(otp);

      Alert.alert(
        'Login Successful',
        `Welcome! Your phone number is verified.`,
      );

      console.log('Firebase User ID:', user.uid);
      console.log('Phone Number:', user.phoneNumber);

      navigation.reset({
        index: 0,
        routes: [{ name: 'ContactList' }],
      });
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error?.message || 'Incorrect OTP. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>

      <Text style={styles.subtitle}>Enter the 6-digit verification code</Text>

      <TextInput
        style={styles.input}
        value={otp}
        onChangeText={text => setOtp(text.replace(/\D/g, '').slice(0, 6))}
        placeholder="- - - - - - "
        placeholderTextColor="#000000"
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
      />

      <Pressable
        style={styles.button}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </Pressable>
    </View>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#777777',
    marginBottom: 30,
  },

  input: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    fontSize: 24,
    letterSpacing: 8,
    color: '#222222',
  },

  button: {
    height: 55,
    width: 130,
    backgroundColor: '#3d414e',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    marginLeft: 250,
  },

  buttonText: {
    color: '#fffefe',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
