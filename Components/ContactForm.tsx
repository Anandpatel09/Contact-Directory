// import React, { useState, useEffect } from 'react';
// import {
//   Alert,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from 'react-native';
// import { useContacts } from '../context/ContactContext';
// export type Contact = {
//   id: string;
//   name: string;
//   phone: string;
//   email?: string;
//   image: string | null;
// };

// type AddContactFormProps = {
//   visible: boolean;
//   contacts: Contact[];
//   editingContact: Contact | undefined | null;
//   onClose: () => void;
//   onAddContact: (contact: Contact) => Promise<boolean>;
//   onUpdateContact: (contact: Contact) => Promise<boolean>;
// };

// const AddContactForm = ({
//   visible,
//   // contacts,
//   editingContact,
//   onClose,
//   onAddContact,
//   onUpdateContact,
// }: AddContactFormProps) => {
//   const { contacts, addContact, updateContact } = useContacts();

//   const [name, setName] = useState('');
//   const [phone, setPhone] = useState('');
//   const [email, setEmail] = useState('');

//   const [errors, setErrors] = useState({
//     name: '',
//     phone: '',
//     email: '',
//   });

//   //prefill the form data
//   useEffect(() => {
//     if (visible) {
//       console.log('checking for the connolse is working or not ');
//       setName(editingContact?.name ?? '');
//       setPhone(editingContact?.phone ?? '');
//       setEmail(editingContact?.email ?? '');
//       setErrors({ name: '', phone: '', email: '' });
//     }
//   }, [visible, editingContact]);
//   const resetForm = () => {
//     setName('');
//     setPhone('');
//     setEmail('');
//     setErrors({ name: '', phone: '', email: '' });
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const validateForm = () => {
//     const newErrors = {
//       name: '',
//       phone: '',
//       email: '',
//     };

//     // Validate full name
//     if (!name.trim()) {
//       newErrors.name = 'Full name is required';
//     }

//     // Clean and validate phone number
//     const cleanPhone = phone.trim();

//     if (!cleanPhone) {
//       newErrors.phone = 'Phone number is required';
//     } else if (!/^\d{10}$/.test(cleanPhone)) {
//       newErrors.phone = 'Enter a valid 10-digit phone number';
//     } else if (
//       contacts.some(
//         contact =>
//           contact.phone === cleanPhone && contact.id !== editingContact?.id,
//       )
//     ) {
//       newErrors.phone = 'This phone number already exists';
//     }

//     // Validate optional email
//     const cleanEmail = email.trim();

//     if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
//       newErrors.email = 'Enter a valid email address';
//     }

//     // Update validation errors
//     setErrors(newErrors);

//     // Return true only when every field is valid
//     return !newErrors.name && !newErrors.phone && !newErrors.email;
//   };

//   //  save
//   // const handleSave = () => {
//   //   if (!validateForm()) {
//   //     return;
//   //   }

//   //   if (editingContact) {
//   //     // Update the existing contact
//   //     onUpdateContact({
//   //       ...editingContact,
//   //       name: name.trim(),
//   //       phone: phone.trim(),
//   //       email: email.trim() || undefined,
//   //     });
//   //   } else {
//   //     // Create a new contact
//   //     const newContact: Contact = {
//   //       id: Date.now().toString(),
//   //       name: name.trim(),
//   //       phone: phone.trim(),
//   //       email: email.trim() || undefined,
//   //       image: null,
//   //     };

//   //     onAddContact(newContact);
//   //   }

//   //   handleClose();

//   //   Alert.alert(
//   //     'Success',
//   //     editingContact
//   //       ? 'Contact updated successfully!'
//   //       : 'Contact added successfully!',
//   //   );
//   // };

//   const handleSave = async () => {
//     // First validate the form
//     const isValid = validateForm();

//     if (!isValid) {
//       return;
//     }

//     try {
//       let isSaved = false;

//       if (editingContact) {
//         // Update existing contact
//         const updatedContact: Contact = {
//           ...editingContact,
//           name: name.trim(),
//           phone: phone.trim(),
//           email: email.trim(),
//         };

//         isSaved = await onUpdateContact(updatedContact);

//         if (isSaved) {
//           Alert.alert('Success', 'Contact updated successfully!');
//         }
//       } else {
//         // Create new contact
//         const newContact: Contact = {
//           id: Date.now().toString(),
//           name: name.trim(),
//           phone: phone.trim(),
//           email: email.trim(),
//           image: null,
//         };

//         isSaved = await onAddContact(newContact);

//         if (isSaved) {
//           Alert.alert('Success', 'Contact added successfully!');
//         }
//       }

//       // Close the form only if saving succeeded
//       if (isSaved) {
//         handleClose();
//       } else {
//         Alert.alert(
//           'Unable to Save',
//           'This contact could not be saved. Please check for duplicate phone numbers or try again.',
//         );
//       }
//     } catch (error) {
//       console.log('Error saving contact:', error);

//       Alert.alert('Error', 'Something went wrong while saving the contact.');
//     }
//   };
//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={handleClose}
//     >
//       <KeyboardAvoidingView
//         style={styles.modalOverlay}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <ScrollView
//           contentContainerStyle={styles.modalScroll}
//           keyboardShouldPersistTaps="handled"
//         >
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Add New Contact</Text>

//             <Text style={styles.label}>Full Name *</Text>
//             <TextInput
//               style={[styles.input, errors.name ? styles.inputError : null]}
//               placeholder="Enter full name"
//               placeholderTextColor="#888"
//               value={name}
//               onChangeText={text => {
//                 setName(text);
//                 setErrors(previous => ({
//                   ...previous,
//                   name: '',
//                 }));
//               }}
//               autoCapitalize="words"
//               maxLength={80}
//             />
//             {errors.name ? (
//               <Text style={styles.errorText}>{errors.name}</Text>
//             ) : null}

//             <Text style={styles.label}>Phone Number *</Text>
//             <TextInput
//               style={[styles.input, errors.phone ? styles.inputError : null]}
//               placeholder="Enter 10-digit phone number"
//               placeholderTextColor="#888"
//               value={phone}
//               onChangeText={text => {
//                 setPhone(text.replace(/\D/g, '').slice(0, 10));
//                 setErrors(previous => ({
//                   ...previous,
//                   phone: '',
//                 }));
//               }}
//               keyboardType="phone-pad"
//               //   maxLength={10}
//             />
//             {errors.phone ? (
//               <Text style={styles.errorText}>{errors.phone}</Text>
//             ) : null}

//             <Text style={styles.label}>Email (Optional)</Text>
//             <TextInput
//               style={[styles.input, errors.email ? styles.inputError : null]}
//               placeholder="Enter email address"
//               placeholderTextColor="#888"
//               value={email}
//               onChangeText={text => {
//                 setEmail(text);
//                 setErrors(previous => ({
//                   ...previous,
//                   email: '',
//                 }));
//               }}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               autoCorrect={false}
//             />
//             {errors.email ? (
//               <Text style={styles.errorText}>{errors.email}</Text>
//             ) : null}

//             <View style={styles.buttonRow}>
//               <Pressable
//                 style={[styles.actionButton, styles.cancelButton]}
//                 onPress={handleClose}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </Pressable>

//               <Pressable
//                 style={[styles.actionButton, styles.saveButton]}
//                 onPress={handleSave}
//               >
//                 <Text style={styles.saveButtonText}>Save Contact</Text>
//               </Pressable>
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalScroll: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 22,
//   },
//   modalTitle: {
//     fontSize: 23,
//     fontWeight: 'bold',
//     color: '#111827',
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 6,
//     marginTop: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 9,
//     paddingHorizontal: 12,
//     paddingVertical: 11,
//     fontSize: 15,
//     color: '#111827',
//   },
//   inputError: {
//     borderColor: '#DC2626',
//   },
//   errorText: {
//     color: '#DC2626',
//     fontSize: 12,
//     marginTop: 5,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 24,
//   },
//   actionButton: {
//     flex: 1,
//     paddingVertical: 13,
//     borderRadius: 9,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#E5E7EB',
//   },
//   saveButton: {
//     backgroundColor: '#2563EB',
//   },
//   cancelButtonText: {
//     color: '#111827',
//     fontWeight: '600',
//   },
//   saveButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
// });

// export default AddContactForm;


import React, { useEffect, useState } from 'react';

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  image: string | null;
};

type Props = {
  visible: boolean;
  contacts: Contact[];
  editingContact: Contact | null;
  onClose: () => void;
  onSave: (contact: Contact) => Promise<void>;
};

const ContactForm = ({
  visible,
  contacts,
  editingContact,
  onClose,
  onSave,
}: Props) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingContact) {
        setName(editingContact.name);
        setPhone(editingContact.phone);
        setEmail(editingContact.email || '');
      } else {
        resetForm();
      }
    }
  }, [visible, editingContact]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');

    setErrors({
      name: '',
      phone: '',
      email: '',
    });
  };

  const closeForm = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    let valid = true;

    const newErrors = {
      name: '',
      phone: '',
      email: '',
    };

    if (name.trim() === '') {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must contain 10 digits';
      valid = false;
    }

    const duplicatePhone = contacts.some(contact => {
      return (
        contact.phone === phone &&
        contact.id !== editingContact?.id
      );
    });

    if (duplicatePhone) {
      newErrors.phone = 'Phone number already exists';
      valid = false;
    }

    if (
      email.trim() !== '' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = 'Enter a valid email address';
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleSave = async () => {
    if (!validateForm() || saving) {
      return;
    }

    const contact: Contact = {
      id: editingContact
        ? editingContact.id
        : `local_${Date.now()}`,
      name: name.trim(),
      phone,
      email: email.trim(),
      image: editingContact?.image || null,
    };

    try {
      setSaving(true);

      await onSave(contact);

      closeForm();
    } catch (error) {
      console.log('Unable to save contact:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={closeForm}
    >
      <KeyboardAvoidingView
        style={styles.modalBackground}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.heading}>
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#777777"
              value={name}
              onChangeText={setName}
            />

            {errors.name !== '' && (
              <Text style={styles.error}>{errors.name}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor="#777777"
              maxLength={10}
              value={phone}
              onChangeText={text =>
                setPhone(text.replace(/\D/g, '').slice(0, 10))
              }
            />

            {errors.phone !== '' && (
              <Text style={styles.error}>{errors.phone}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email (Optional)"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#777777"
              value={email}
              onChangeText={setEmail}
            />

            {errors.email !== '' && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            <Pressable
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? 'Saving...'
                  : editingContact
                    ? 'Update Contact'
                    : 'Save Contact'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={closeForm}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ContactForm;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },

  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    color: '#222',
  },

  error: {
    color: 'red',
    marginBottom: 10,
  },

  saveButton: {
    backgroundColor: '#2196F3',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },

  cancelButton: {
    backgroundColor: '#777',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});