// import React from 'react';
// import {
//   Pressable,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';

// type Props = {
//   title: string;
//   onPress: () => void;
//   backgroundColor?: string;
//   textColor?: string;
//   disabled?: boolean;
//   loading?: boolean;
// };

// const CustomButton = ({
//   title,
//   onPress,
//   backgroundColor = '#007AFF',
//   textColor = '#FFFFFF',
//   disabled = false,
//   loading = false,
// }: Props) => {
//   return (
//     <Pressable
//       onPress={onPress}
//       disabled={disabled || loading}
//       style={[
//         styles.button,
//         { backgroundColor: backgroundColor },
//         (disabled || loading) && styles.disabledButton,
//       ]}
//     >
//       {loading ? (
//         <ActivityIndicator color={textColor} />
//       ) : (
//         <Text style={[styles.buttonText, { color: textColor }]}>
//           {title}
//         </Text>
//       )}
//     </Pressable>
//   );
// };

// export default CustomButton;

// const styles = StyleSheet.create({
//   button: {
//     padding: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 5,
//   },

//   buttonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

//   disabledButton: {
//     opacity: 0.5,
//   },
// });

import React from 'react';

import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
};

const CustomButton = ({
  title,
  onPress,
  backgroundColor = '#007AFF',
  textColor = '#FFFFFF',
  disabled = false,
  loading = false,
}: Props) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: backgroundColor },

        // Platform-specific styling
        Platform.OS === 'ios' ? styles.iosButton : styles.androidButton,

        (disabled || loading) && styles.disabledButton,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },

  // iOS button styling
  iosButton: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  // Android button styling
  androidButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  disabledButton: {
    opacity: 0.5,
  },
});
