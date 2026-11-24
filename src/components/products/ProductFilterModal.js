import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import CustomCheckbox from '../common/CustomCheckbox';

export const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under_30', label: 'Under ₹30', min: 0, max: 30 },
  { id: '30_60', label: '₹30 - ₹60', min: 30, max: 60 },
  { id: '60_100', label: '₹60 - ₹100', min: 60, max: 100 },
  { id: 'above_100', label: 'Above ₹100', min: 100, max: Infinity },
];

export const RATING_FILTERS = [
  { id: 'all', label: 'All Ratings', minRating: 0 },
  { id: '4_5', label: '4.5+ ★', minRating: 4.5 },
  { id: '4_7', label: '4.7+ ★', minRating: 4.7 },
  { id: '4_8', label: '4.8+ ★', minRating: 4.8 },
];

export const ProductFilterModal = ({
  visible,
  onClose,
  currentFilters,
  onApplyFilters,
}) => {
  const [selectedPriceRange, setSelectedPriceRange] = useState(
    currentFilters.priceRange || 'all',
  );
  const [discountOnly, setDiscountOnly] = useState(
    Boolean(currentFilters.discountOnly),
  );
  const [selectedRating, setSelectedRating] = useState(
    currentFilters.rating || 'all',
  );
  const [inStockOnly, setInStockOnly] = useState(
    Boolean(currentFilters.inStockOnly),
  );

  // Sync with currentFilters when opened
  useEffect(() => {
    if (visible) {
      setSelectedPriceRange(currentFilters.priceRange || 'all');
      setDiscountOnly(Boolean(currentFilters.discountOnly));
      setSelectedRating(currentFilters.rating || 'all');
      setInStockOnly(Boolean(currentFilters.inStockOnly));
    }
  }, [visible, currentFilters]);

  const handleClearAll = () => {
    setSelectedPriceRange('all');
    setDiscountOnly(false);
    setSelectedRating('all');
    setInStockOnly(false);
  };

  const handleApply = () => {
    onApplyFilters({
      priceRange: selectedPriceRange,
      discountOnly,
      rating: selectedRating,
      inStockOnly,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Products</Text>
              <Text style={styles.subtitle}>Refine fresh grocery items</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {/* 1. Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Price Range</Text>
              <View style={styles.chipsRow}>
                {PRICE_RANGES.map(range => {
                  const isSelected = selectedPriceRange === range.id;
                  return (
                    <TouchableOpacity
                      key={range.id}
                      style={[styles.chip, isSelected && styles.activeChip]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedPriceRange(range.id)}>
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.activeChipText,
                        ]}>
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Discounted Only Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Offers & Discounts</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.7}
                onPress={() => setDiscountOnly(!discountOnly)}>
                <CustomCheckbox
                  checked={discountOnly}
                  onChange={setDiscountOnly}
                  label="Discounted Products Only"
                />
              </TouchableOpacity>
            </View>

            {/* 3. Minimum Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Minimum Rating</Text>
              <View style={styles.chipsRow}>
                {RATING_FILTERS.map(rf => {
                  const isSelected = selectedRating === rf.id;
                  return (
                    <TouchableOpacity
                      key={rf.id}
                      style={[styles.chip, isSelected && styles.activeChip]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedRating(rf.id)}>
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.activeChipText,
                        ]}>
                        {rf.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Availability */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Availability</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.7}
                onPress={() => setInStockOnly(!inStockOnly)}>
                <CustomCheckbox
                  checked={inStockOnly}
                  onChange={setInStockOnly}
                  label="In Stock Only"
                />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.clearBtn}
              activeOpacity={0.7}
              onPress={handleClearAll}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              activeOpacity={0.8}
              onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  scroll: {
    marginVertical: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  activeChip: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  activeChipText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  checkboxRow: {
    paddingVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  clearBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  clearBtnText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    flex: 1,
    marginLeft: spacing.md,
    alignItems: 'center',
  },
  applyBtnText: {
    color: colors.textInverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});

export default ProductFilterModal;
