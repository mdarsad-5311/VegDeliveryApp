import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';

const AVATAR_OPTIONS = ['🥦', '🥬', '🥕', '🍅', '🥑', '🌽', '🍓', '🍋', '🍇'];

export const EditProfileScreen = ({ navigation }) => {
  const { user, updateUserProfile } = useAppContext();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(
    (user?.phone || '').replace('+91', '').trim(),
  );
  const [avatar, setAvatar] = useState(user?.avatar || '🥦');
  const [bio, setBio] = useState(user?.bio || 'Farm fresh vegetable enthusiast');

  const [errors, setErrors] = useState({});
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};

    if (!name.trim()) {
      errs.name = 'Please enter your full name';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Please enter your mobile number';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Mobile number must be exactly 10 digits';
    } else if (!/^[6-9]/.test(cleanPhone)) {
      errs.phone = 'Mobile number must start with 6, 7, 8, or 9';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const cleanPhone = phone.replace(/\D/g, '');

    const updated = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      avatar,
      bio: bio.trim(),
    };

    const res = await updateUserProfile(updated);
    setIsSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Profile Updated',
        'Your profile details have been successfully saved.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back">
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <Text style={styles.headerSubtitle}>
              Update your personal information
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>{avatar}</Text>
              </View>
              <TouchableOpacity
                style={styles.cameraBadge}
                activeOpacity={0.8}
                onPress={() => setShowAvatarPicker(true)}
                accessibilityLabel="Change avatar">
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setShowAvatarPicker(true)}
              activeOpacity={0.7}>
              <Text style={styles.changeAvatarText}>Change Avatar</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields Card */}
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* Email Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (errors.email)
                    setErrors(prev => ({ ...prev, email: null }));
                }}
                placeholder="name@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Mobile Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Mobile Number <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.phoneRow,
                  errors.phone && styles.phoneRowError,
                ]}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryFlag}>🇮🇳</Text>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={text => {
                    setPhone(text);
                    if (errors.phone)
                      setErrors(prev => ({ ...prev, phone: null }));
                  }}
                  placeholder="9876543210"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>

            {/* Bio */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>About / Delivery Note</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="A short note or preference for your vegetable orders"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                maxLength={80}
              />
              <Text style={styles.charCount}>{bio.length}/80 characters</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSubmitting && styles.saveButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isSubmitting}
            accessibilityLabel="Save Changes">
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Avatar Picker Modal */}
        <Modal
          visible={showAvatarPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAvatarPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Choose Profile Avatar</Text>
              <Text style={styles.modalSub}>
                Select your favorite vegetable mascot
              </Text>

              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((item, idx) => {
                  const isSelected = avatar === item;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.avatarOption,
                        isSelected && styles.avatarOptionSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setAvatar(item);
                        setShowAvatarPicker(false);
                      }}>
                      <Text style={styles.avatarOptionEmoji}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.8}
                onPress={() => setShowAvatarPicker(false)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  backArrow: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  cameraIcon: {
    fontSize: 14,
  },
  changeAvatarText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FFEBEE',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    backgroundColor: '#FAFAFA',
  },
  phoneRowError: {
    borderColor: colors.error,
    backgroundColor: '#FFEBEE',
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    backgroundColor: '#F0F0F0',
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  bioInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 11,
    color: colors.error,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: spacing.lg,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E9',
  },
  avatarOptionEmoji: {
    fontSize: 30,
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: borderRadius.full,
  },
  modalCloseText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
});

export default EditProfileScreen;
