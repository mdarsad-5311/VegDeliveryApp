import React, { useState, useEffect } from 'react';
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
import OTPInput from '../../components/common/OTPInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing } from '../../constants/theme';

export const OTPVerificationScreen = ({ navigation, route }) => {
  const mobileNumber = route?.params?.mobileNumber || '9876543210';
  const nextScreen = route?.params?.nextScreen || 'MainTabs';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  // Masked Mobile Number: e.g. +91 98765 •••••
  const maskedNumber = `+91 ${mobileNumber.slice(0, 5)} •••••`;

  // 30 seconds countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = () => {
    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (nextScreen === 'ResetPassword') {
        navigation.navigate('ResetPassword', { mobileNumber });
      } else {
        navigation.replace('MainTabs');
      }
    }, 800);
  };

  const handleResendOTP = () => {
    if (timer > 0) return;
    setTimer(30);
    setOtp('');
    setError(null);
  };

  const handleDemoFill = () => {
    setOtp('123456');
    setError(null);
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
          <Text style={styles.topBarTitle}>Verification</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.content}>
          {/* Badge Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.badgeEmoji}>💬</Text>
          </View>

          <Text style={styles.heading}>Verify Your Number</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>

          {/* Masked Number with Change link */}
          <View style={styles.numberRow}>
            <Text style={styles.mobileText}>{maskedNumber}</Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* 6-Digit OTP Boxes */}
          <OTPInput
            length={6}
            value={otp}
            onChange={text => {
              setOtp(text);
              if (error) setError(null);
            }}
            hasError={Boolean(error)}
          />

          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

          {/* Verify Button */}
          <PrimaryButton
            title="Verify OTP"
            onPress={handleVerify}
            loading={isLoading}
            style={styles.verifyBtn}
          />

          {/* Resend OTP Section */}
          <View style={styles.resendSection}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend code in{' '}
                <Text style={styles.timerSeconds}>
                  00:{timer < 10 ? `0${timer}` : timer}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} activeOpacity={0.7}>
                <Text style={styles.resendActiveText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Demo Fill Helper */}
          <TouchableOpacity
            style={styles.demoFillBtn}
            onPress={handleDemoFill}
            activeOpacity={0.7}>
            <Text style={styles.demoFillText}>⚡ Quick Auto-Fill OTP (123456)</Text>
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
  },
  subtitle: {
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  mobileText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  changeLink: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  errorText: {
    fontSize: typography.sizes.xs + 1,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  verifyBtn: {
    marginTop: spacing.sm,
  },
  resendSection: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  timerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  timerSeconds: {
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  resendActiveText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  demoFillBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.xs,
  },
  demoFillText: {
    fontSize: typography.sizes.xs + 1,
    color: colors.primaryDark,
    fontWeight: typography.weights.semiBold,
  },
});

export default OTPVerificationScreen;
