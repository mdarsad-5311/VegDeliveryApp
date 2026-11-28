import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FreshVegLogo from '../../components/illustrations/FreshVegLogo';
import CustomTextInput from '../../components/common/CustomTextInput';
import PasswordInput from '../../components/common/PasswordInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import CountryCodeSelector from '../../components/common/CountryCodeSelector';
import CustomCheckbox from '../../components/common/CustomCheckbox';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';
import { authAPI, formatApiError } from '../../services';

export const LoginScreen = ({ navigation }) => {
  const { loginUser } = useAppContext();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    const cleanMobile = mobileNumber.replace(/\D/g, '');

    if (!cleanMobile) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (cleanMobile.length !== 10) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate() || isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      const response = await authAPI.login({
        identifier: cleanMobile,
        password: password,
      });

      if (response && response.data) {
        const { token, user } = response.data;
        if (token && user) {
          await loginUser(user, token);
        }
        setIsLoading(false);
        navigation.replace('MainTabs');
      }
    } catch (err) {
      setIsLoading(false);
      const apiErrors = {};
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.identifier) {
          apiErrors.mobileNumber = Array.isArray(data.identifier)
            ? data.identifier[0]
            : data.identifier;
        }
        if (data.password) {
          apiErrors.password = Array.isArray(data.password)
            ? data.password[0]
            : data.password;
        }
        if (data.non_field_errors) {
          apiErrors.general = Array.isArray(data.non_field_errors)
            ? data.non_field_errors[0]
            : data.non_field_errors;
        } else if (data.detail) {
          apiErrors.general = data.detail;
        }
      } else {
        apiErrors.general = formatApiError(err);
      }
      setErrors(apiErrors);
    }
  };

  const handleDemoFill = () => {
    setMobileNumber('9876543210');
    setPassword('FreshVeg@2026');
    setErrors({});
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header Branding */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <FreshVegLogo size={74} />
            </View>
            <Text style={styles.brandTitle}>FreshVeg</Text>
            <Text style={styles.heading}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Login to continue shopping fresh vegetables.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* General Error Banner */}
            {Boolean(errors.general) && (
              <View style={styles.generalErrorBanner}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            {/* Mobile Number Input */}
            <CustomTextInput
              label="Mobile Number"
              placeholder="Enter 10-digit number"
              value={mobileNumber}
              onChangeText={text => {
                setMobileNumber(text.replace(/\D/g, ''));
                if (errors.mobileNumber) {
                  setErrors(prev => ({ ...prev, mobileNumber: null }));
                }
              }}
              keyboardType="phone-pad"
              maxLength={10}
              prefix={<CountryCodeSelector code="+91" />}
              error={errors.mobileNumber}
            />

            {/* Password Input */}
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: null }));
                }
              }}
              error={errors.password}
            />

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <CustomCheckbox
                checked={rememberMe}
                onToggle={setRememberMe}
                label="Remember me"
              />
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <PrimaryButton
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            {/* Quick Demo Fill Helper */}
            <TouchableOpacity
              style={styles.demoFillBtn}
              onPress={handleDemoFill}
              activeOpacity={0.7}>
              <Text style={styles.demoFillText}>⚡ Quick Demo Fill</Text>
            </TouchableOpacity>
          </View>

          {/* Footer - Sign Up Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoWrapper: {
    marginBottom: spacing.xs,
  },
  brandTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  heading: {
    fontSize: typography.sizes.xxl - 2,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    marginVertical: spacing.sm,
  },
  generalErrorBanner: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  generalErrorText: {
    color: colors.error,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
  loginButton: {
    marginTop: spacing.xs,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  footerText: {
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});

export default LoginScreen;
