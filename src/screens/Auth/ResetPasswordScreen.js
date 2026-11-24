import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PasswordInput from '../../components/common/PasswordInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const ResetPasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your new password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = () => {
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessModal(true);
    }, 700);
  };

  const handleSuccessDone = () => {
    setShowSuccessModal(false);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
        translucent={false}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Reset Password</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.badgeEmoji}>🔑</Text>
          </View>

          <Text style={styles.heading}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from previous passwords.
          </Text>

          <View style={styles.form}>
            {/* New Password */}
            <PasswordInput
              label="New Password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChangeText={text => {
                setNewPassword(text);
                if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: null }));
              }}
              error={errors.newPassword}
            />

            {/* Confirm New Password */}
            <PasswordInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
              }}
              error={errors.confirmPassword}
            />

            {/* Reset Button */}
            <PrimaryButton
              title="Reset Password"
              onPress={handleResetPassword}
              loading={isLoading}
              style={styles.resetBtn}
            />

            {/* Demo Fill Helper */}
            <TouchableOpacity
              style={styles.demoFillBtn}
              onPress={() => {
                setNewPassword('FreshNewPass@2026');
                setConfirmPassword('FreshNewPass@2026');
                setErrors({});
              }}
              activeOpacity={0.7}>
              <Text style={styles.demoFillText}>⚡ Quick Demo Fill</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleSuccessDone}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconCircle}>
                <Text style={styles.modalCheck}>✓</Text>
              </View>
              <Text style={styles.modalTitle}>Password Reset Successful!</Text>
              <Text style={styles.modalSubtitle}>
                Your password has been securely updated. You can now login with your new credentials.
              </Text>
              <PrimaryButton
                title="Go to Login"
                onPress={handleSuccessDone}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  topBarTitle: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  backButtonPlaceholder: {
    width: 32,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeEmoji: {
    fontSize: 34,
  },
  heading: {
    fontSize: typography.sizes.xxl - 4,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  form: {
    width: '100%',
  },
  resetBtn: {
    marginTop: spacing.md,
  },
  demoFillBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  demoFillText: {
    fontSize: typography.sizes.xs + 1,
    color: colors.primaryDark,
    fontWeight: typography.weights.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalCheck: {
    color: colors.textInverse,
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  modalBtn: {
    width: '100%',
  },
});

export default ResetPasswordScreen;
