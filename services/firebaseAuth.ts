import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';

// Firebase authentication instance
const auth = getAuth();

// Store pending OTP confirmation
let phoneConfirmation: Awaited<
  ReturnType<typeof signInWithPhoneNumber>
> | null = null;

// Send OTP to phone number
export const sendPhoneOtp = async (phoneNumber: string) => {
  try {
    phoneConfirmation = await signInWithPhoneNumber(auth, phoneNumber);

    return true;
  } catch (error) {
    console.log('Send OTP Error:', error);
    throw error;
  }
};

// Verify OTP
export const verifyPhoneOtp = async (otp: string) => {
  try {
    if (!phoneConfirmation) {
      throw new Error('Please request OTP first.');
    }

    const result = await phoneConfirmation.confirm(otp);

    phoneConfirmation = null;

    return result.user;
  } catch (error) {
    console.log('Verify OTP Error:', error);
    throw error;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.log('Logout Error:', error);
    throw error;
  }
};
