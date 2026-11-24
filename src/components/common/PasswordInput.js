import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import CustomTextInput from './CustomTextInput';
import colors from '../../constants/colors';

export const PasswordInput = ({
  label = 'Password',
  value,
  onChangeText,
  placeholder = 'Enter your password',
  error,
  containerStyle,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <CustomTextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      error={error}
      secureTextEntry={!showPassword}
      containerStyle={containerStyle}
      rightIcon={
        <Text style={styles.toggleIcon}>{showPassword ? '👁️' : '🙈'}</Text>
      }
      onRightIconPress={() => setShowPassword(prev => !prev)}
    />
  );
};

const styles = StyleSheet.create({
  toggleIcon: {
    fontSize: 18,
    color: colors.textMuted,
  },
});

export default PasswordInput;
