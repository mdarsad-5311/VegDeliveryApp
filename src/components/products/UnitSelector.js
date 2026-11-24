import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const UnitSelector = ({
  options = [],
  selectedOption,
  onSelectOption,
  disabled = false,
}) => {
  if (!options || options.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Select Pack / Weight</Text>
      <View style={styles.optionsRow}>
        {options.map(item => {
          const isSelected = selectedOption?.id === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionPill,
                isSelected && styles.selectedPill,
                disabled && styles.disabledPill,
              ]}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => onSelectOption && onSelectOption(item)}>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.selectedOptionLabel,
                  disabled && styles.disabledText,
                ]}>
                {item.label}
              </Text>
              <Text
                style={[
                  styles.optionPrice,
                  isSelected && styles.selectedOptionPrice,
                  disabled && styles.disabledText,
                ]}>
                ₹{item.price}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  optionPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    alignItems: 'center',
    minWidth: 78,
  },
  selectedPill: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  disabledPill: {
    borderColor: colors.borderLight,
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  optionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  selectedOptionLabel: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  optionPrice: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: typography.weights.medium,
  },
  selectedOptionPrice: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  disabledText: {
    color: colors.textMuted,
  },
});

export default UnitSelector;
