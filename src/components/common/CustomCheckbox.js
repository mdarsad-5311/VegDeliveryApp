import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const CustomCheckbox = ({
  checked = false,
  onToggle,
  label,
  children,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onToggle && onToggle(!checked)}
      style={[styles.container, style]}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm - 2,
    borderWidth: 1.8,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});

export default CustomCheckbox;
