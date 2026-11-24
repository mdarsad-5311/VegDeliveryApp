import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomTextInput from '../../components/common/CustomTextInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import CountryCodeSelector from '../../components/common/CountryCodeSelector';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing } from '../../constants/theme';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      setError('Mobile number is required');
      return;
    }
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to OTP verification for password reset
      navigation.navigate('OTPVerification', {
        mobileNumber,
        nextScreen: 'ResetPassword',
      });
    }, 700);
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
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Forgot Password</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.content}>
          {/* Visual Icon Badge */}
          <View style={styles.iconCircle}>
            <Text style={styles.badgeEmoji}>🔐</Text>
          </View>

          <Text style={styles.heading}>Forgot Password?</Text>
          <Text style={styles.description}>
            Enter your registered mobile number to reset your password. We'll send an OTP to verify your account.
          </Text>

          {/* Mobile Number Input */}
          <CustomTextInput
            label="Registered Mobile Number"
            placeholder="10-digit mobile number"
            value={mobileNumber}
            onChangeText={text => {
              setMobileNumber(text.replace(/\D/g, ''));
              if (error) setError(null);
            }}
            keyboardType="phone-pad"
            maxLength={10}
            prefix={<CountryCodeSelector code="+91" />}
            error={error}
          />

          {/* Continue Button */}
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            style={styles.continueBtn}
          />

          {/* Demo Autofill */}
          <TouchableOpacity
            style={styles.demoFillBtn}
            onPress={() => {
              setMobileNumber('9876543210');
              setError(null);
            }}
            activeOpacity={0.7}>
            <Text style={styles.demoFillText}>⚡ Quick Demo Fill</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Login Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}>
            <Text style={styles.backToLoginText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
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
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  continueBtn: {
    marginTop: spacing.sm,
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
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  backToLoginText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});

export default ForgotPasswordScreen;
