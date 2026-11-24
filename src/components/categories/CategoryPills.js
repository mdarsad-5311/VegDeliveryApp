import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import { VEG_CATEGORIES } from '../../constants/mockData';

export const CategoryPills = ({ selectedCategoryId, onSelectCategory }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {/* All Categories Pill */}
        <TouchableOpacity
          style={[
            styles.pill,
            selectedCategoryId === 'all' && styles.activePill,
          ]}
          activeOpacity={0.7}
          onPress={() => onSelectCategory('all')}>
          <Text style={styles.pillIcon}>✨</Text>
          <Text
            style={[
              styles.pillText,
              selectedCategoryId === 'all' && styles.activePillText,
            ]}>
            All
          </Text>
        </TouchableOpacity>

        {/* Category Pills */}
        {VEG_CATEGORIES.map(cat => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.activePill]}
              activeOpacity={0.7}
              onPress={() => onSelectCategory(cat.id)}>
              <Text style={styles.pillIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.activePillText,
                ]}>
                {cat.shortName || cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  scroll: {
    paddingHorizontal: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activePill: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  pillIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  pillText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  activePillText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
});

export default CategoryPills;
