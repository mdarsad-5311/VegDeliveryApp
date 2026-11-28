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

export const RegisterScreen = ({ navigation }) => {
  const { loginUser } = useAppContext();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    const cleanMobile = mobileNumber.replace(/\D/g, '');

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!cleanMobile) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (cleanMobile.length !== 10) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate() || isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      const response = await authAPI.register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile_number: cleanMobile,
        password: password,
        confirm_password: confirmPassword,
      });

      if (response && (response.status === 201 || response.status === 200)) {
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
        if (data.full_name) {
          apiErrors.fullName = Array.isArray(data.full_name)
            ? data.full_name[0]
            : data.full_name;
        }
        if (data.email) {
          apiErrors.email = Array.isArray(data.email)
            ? data.email[0]
            : data.email;
        }
        if (data.mobile_number) {
          apiErrors.mobileNumber = Array.isArray(data.mobile_number)
            ? data.mobile_number[0]
            : data.mobile_number;
        }
        if (data.password) {
          apiErrors.password = Array.isArray(data.password)
            ? data.password[0]
            : data.password;
        }
        if (data.confirm_password) {
          apiErrors.confirmPassword = Array.isArray(data.confirm_password)
            ? data.confirm_password[0]
            : data.confirm_password;
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
    setFullName('Priya Sharma');
    setMobileNumber('9876543210');
    setEmail('priya.sharma@example.com');
    setPassword('FreshVeg@2026');
    setConfirmPassword('FreshVeg@2026');
    setAgreeTerms(true);
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
        {/* Top Back Nav */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Create Account</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.heading}>Join FreshVeg 🌱</Text>
            <Text style={styles.subtitle}>
              Sign up to enjoy daily farm-fresh vegetable deliveries.
            </Text>
          </View>

          {/* General Backend Error Banner */}
          {Boolean(errors.general) && (
            <View style={styles.generalErrorBanner}>
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.form}>
            {/* Full Name */}
            <CustomTextInput
              label="Full Name"
              placeholder="e.g. Priya Sharma"
              value={fullName}
              onChangeText={text => {
                setFullName(text);
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: null }));
              }}
              autoCapitalize="words"
              error={errors.fullName}
            />

            {/* Mobile Number */}
            <CustomTextInput
              label="Mobile Number"
              placeholder="10-digit mobile number"
              value={mobileNumber}
              onChangeText={text => {
                setMobileNumber(text.replace(/\D/g, ''));
                if (errors.mobileNumber) setErrors(prev => ({ ...prev, mobileNumber: null }));
              }}
              keyboardType="phone-pad"
              maxLength={10}
              prefix={<CountryCodeSelector code="+91" />}
              error={errors.mobileNumber}
            />

            {/* Email Address */}
            <CustomTextInput
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) setErrors(prev => ({ ...prev, email: null }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            {/* Password */}
            <PasswordInput
              label="Password"
              placeholder="Create strong password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: null }));
              }}
              error={errors.password}
            />

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
              }}
              error={errors.confirmPassword}
            />

            {/* Terms and Conditions Checkbox */}
            <View style={styles.termsWrapper}>
              <CustomCheckbox
                checked={agreeTerms}
                onToggle={val => {
                  setAgreeTerms(val);
                  if (errors.agreeTerms) setErrors(prev => ({ ...prev, agreeTerms: null }));
                }}>
                <Text style={styles.termsText}>
                  I agree to FreshVeg's{' '}
                  <Text style={styles.termsHighlight}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsHighlight}>Privacy Policy</Text>
                </Text>
              </CustomCheckbox>
              {Boolean(errors.agreeTerms) && (
                <Text style={styles.errorText}>{errors.agreeTerms}</Text>
              )}
            </View>

            {/* Submit Button */}
            <PrimaryButton
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.submitBtn}
            />

            {/* Demo Fill Helper */}
            <TouchableOpacity
              style={styles.demoFillBtn}
              onPress={handleDemoFill}
              activeOpacity={0.7}>
              <Text style={styles.demoFillText}>⚡ Quick Demo Fill</Text>
            </TouchableOpacity>
          </View>

          {/* Footer - Login Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}>
              <Text style={styles.loginLink}>Login</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
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
    lineHeight: 20,
  },
  generalErrorBanner: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  generalErrorText: {
    color: colors.error,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  form: {
    marginTop: spacing.xs,
  },
  termsWrapper: {
    marginVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  termsText: {
    fontSize: typography.sizes.xs + 1,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  termsHighlight: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: 4,
  },
  submitBtn: {
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
  loginLink: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});

export default RegisterScreen;
