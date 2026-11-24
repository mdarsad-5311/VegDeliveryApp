import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const SORT_OPTIONS = [
  { id: 'popularity', label: 'Popularity' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'highest_discount', label: 'Highest Discount' },
  { id: 'rating', label: 'Top Rated' },
];

export const SortFilterBar = ({
  activeSort,
  onSelectSort,
  onPressFilter,
  activeFilterCount = 0,
}) => {
  return (
    <View style={styles.container}>
      {/* Optional Filters Button */}
      {onPressFilter && (
        <TouchableOpacity
          style={[
            styles.filterTriggerBtn,
            activeFilterCount > 0 && styles.activeFilterTrigger,
          ]}
          activeOpacity={0.7}
          onPress={onPressFilter}>
          <Text style={styles.filterTriggerIcon}>🌪️</Text>
          <Text
            style={[
              styles.filterTriggerText,
              activeFilterCount > 0 && styles.activeFilterTriggerText,
            ]}>
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sortPrefix}>Sort by:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {SORT_OPTIONS.map(opt => {
          const isActive = activeSort === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.pill, isActive && styles.activePill]}
              activeOpacity={0.7}
              onPress={() => onSelectSort(opt.id)}>
              <Text style={[styles.pillText, isActive && styles.activePillText]}>
                {opt.label}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
  },
  activeFilterTrigger: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterTriggerIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  filterTriggerText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  activeFilterTriggerText: {
    color: colors.primaryDark,
  },
  sortPrefix: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
    marginRight: spacing.sm,
  },
  scroll: {
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activePill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  activePillText: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
  },
});

export default SortFilterBar;
