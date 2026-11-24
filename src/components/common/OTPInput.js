import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { borderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');
const BOX_SIZE = Math.min((width - 70) / 6, 50);

export const OTPInput = ({ length = 6, value = '', onChange, hasError = false }) => {
  const [digits, setDigits] = useState(
    Array(length)
      .fill('')
      .map((_, i) => value[i] || '')
  );
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    // Keep internal digits in sync if value changes externally
    const newDigits = Array(length)
      .fill('')
      .map((_, i) => value[i] || '');
    setDigits(newDigits);
  }, [value, length]);

  const handleChangeText = (text, index) => {
    // Check if user pasted a multi-digit string (e.g. "123456")
    const cleanText = text.replace(/[^0-9]/g, '');
    if (cleanText.length > 1) {
      const pastedDigits = cleanText.slice(0, length).split('');
      const updated = Array(length).fill('');
      pastedDigits.forEach((d, i) => {
        updated[i] = d;
      });
      setDigits(updated);
      onChange && onChange(updated.join(''));
      const nextFocus = Math.min(pastedDigits.length, length - 1);
      inputsRef.current[nextFocus]?.focus();
      return;
    }

    const updated = [...digits];
    updated[index] = cleanText;
    setDigits(updated);
    onChange && onChange(updated.join(''));

    // Move to next input if single digit typed
    if (cleanText && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const updated = [...digits];
        updated[index - 1] = '';
        setDigits(updated);
        onChange && onChange(updated.join(''));
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array(length)
        .fill(0)
        .map((_, index) => {
          const isFocused = focusedIndex === index;
          const isFilled = Boolean(digits[index]);

          return (
            <TextInput
              key={index}
              ref={el => (inputsRef.current[index] = el)}
              style={[
                styles.box,
                isFocused && styles.boxFocused,
                isFilled && styles.boxFilled,
                hasError && styles.boxError,
              ]}
              value={digits[index]}
              onChangeText={text => handleChangeText(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              keyboardType="number-pad"
              maxLength={index === 0 ? length : 1}
              textAlign="center"
              selectTextOnFocus
            />
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE + 6,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  boxFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FAFCFA',
    borderWidth: 2,
  },
  boxFilled: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.surface,
  },
  boxError: {
    borderColor: colors.error,
    backgroundColor: '#FFFBFB',
  },
});

export default OTPInput;
