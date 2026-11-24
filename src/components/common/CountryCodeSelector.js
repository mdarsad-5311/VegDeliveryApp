import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing } from '../../constants/theme';

export const CountryCodeSelector = ({ code = '+91', flag = '🇮🇳' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.flag}>{flag}</Text>
      <Text style={styles.code}>{code}</Text>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.xs,
  },
  flag: {
    fontSize: 16,
    marginRight: 4,
  },
  code: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
});

export default CountryCodeSelector;
