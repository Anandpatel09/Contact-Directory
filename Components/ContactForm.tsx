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
      return contact.phone === phone && contact.id !== editingContact?.id;
    });

    if (duplicatePhone) {
      newErrors.phone = 'Phone number already exists';
      valid = false;
    }

    if (email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      id: editingContact ? editingContact.id : `local_${Date.now()}`,
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
                  ? 'Saving.....'
                  : editingContact
                  ? 'Update Contact'
                  : 'Save Contact'}
              </Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={closeForm}>
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
