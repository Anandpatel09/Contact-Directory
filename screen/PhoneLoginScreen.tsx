import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';

import { sendPhoneOtp } from '../services/firebaseAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'PhoneLogin'>;

const PhoneLoginScreen = ({ navigation }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const cleanPhoneNumber = phoneNumber.replace(/\s/g, '');

    if (!/^\+[1-9]\d{7,14}$/.test(cleanPhoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid number with country code.',
      );
      return;
    }

    try {
      setLoading(true);

      await sendPhoneOtp(cleanPhoneNumber);

      Alert.alert(
        'OTP Sent',
        'OTP request successful. Please enter your verification code.',
      );

      navigation.navigate('OtpVerification');
    } catch (error: any) {
      Alert.alert(
        'OTP Error',
        error?.message || 'Unable to send OTP. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Login</Text>

      <Text style={styles.subtitle}>Enter your mobile number to continue</Text>

      <Text style={styles.label}>Mobile Number</Text>

      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter you phone number"
        placeholderTextColor="#000000"
        keyboardType="phone-pad"
        maxLength={16}
      />
      <Pressable
        style={styles.button}
        onPress={handleSendOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </Pressable>
    </View>
  );
};

export default PhoneLoginScreen;

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
    marginBottom: 35,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },

  input: {
    height: 55,
    // backgroundColor: '#fefbfb',
    borderWidth: 1,
    borderColor: '#443f3f',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000000',
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
