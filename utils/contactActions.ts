
import Clipboard from '@react-native-clipboard/clipboard';
import { Alert, Linking, Share } from 'react-native';

// Open phone dialer
export const openDialer = async (phone: string) => {
  if (!phone) {
    Alert.alert('Error', 'Phone number is not available.');
    return;
  }

  try {
    await Linking.openURL(`tel:${phone}`);
  } catch (error) {
    console.log('Dialer error:', error);
    Alert.alert('Error', 'Unable to open the phone dialer.');
  }
};

// Open SMS app
export const openSms = async (phone: string, name: string) => {
  if (!phone) {
    Alert.alert('Error', 'Phone number is not available.');
    return;
  }

  try {
    const message = `Hello ${name}, how are you?`;

    const url = `smsto:${phone}?body=${encodeURIComponent(message)}`;

    await Linking.openURL(url);
  } catch (error) {
    console.log('SMS Error:', error);
    Alert.alert('Error', 'Unable to open SMS app.');
  }
};

// Open Email app
export const openEmail = async (email: string, name: string) => {
  if (!email) {
    Alert.alert('Email unavailable', 'This contact does not have an email address.');
    return;
  }

  try {
    const subject = 'Hello';
    const body = `Hello ${name},`;

    const url =
      `mailto:${email}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    await Linking.openURL(url);
  } catch (error) {
    console.log('Email Error:', error);
    Alert.alert('Error', 'Unable to open Email app.');
  }
};

// Share contact details
export const shareContact = async (
  name: string,
  phone: string,
  email?: string,
) => {
  try {
    let contactDetails = `Name: ${name || 'Not available'}\n`;
    contactDetails += `Phone: ${phone || 'Not available'}\n`;
    contactDetails += `Email: ${email || 'Not available'}`;

    await Share.share({
      title: 'Share Contact',
      message: contactDetails,
    });
  } catch (error) {
    console.log('Share error:', error);
    Alert.alert('Error', 'Unable to share contact details.');
  }
};

// Copy phone number
export const copyContact = (phone: string) => {
  if (!phone) {
    Alert.alert('Error', 'Phone number is not available.');
    return;
  }

  try {
    Clipboard.setString(phone);

    Alert.alert('Success', 'Phone number copied successfully!');
  } catch (error) {
    console.log('Copy error:', error);
    Alert.alert('Error', 'Unable to copy phone number.');
  }
};
