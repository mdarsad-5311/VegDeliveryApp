import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing } from '../../constants/theme';

export const CategoryItem = ({ category, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onPress && onPress(category)}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: category.bgColor },
          isSelected && styles.selectedCircle,
        ]}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>
      <Text
        style={[
          styles.categoryName,
          isSelected && styles.selectedCategoryName,
        ]}
        numberOfLines={2}>
        {category.shortName || category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedCircle: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  icon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
    lineHeight: 14,
  },
  selectedCategoryName: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});

export default CategoryItem;
