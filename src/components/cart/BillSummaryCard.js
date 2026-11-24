import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const BillSummaryCard = ({
  subtotal = 0,
  deliveryFee = 0,
  appliedCoupon = null,
  grandTotal = 0,
}) => {
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const isFreeDelivery = deliveryFee === 0;
  const totalSaved = (isFreeDelivery ? 30 : 0) + couponDiscount;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Bill Details 🧾</Text>

      {/* Item Total */}
      <View style={styles.row}>
        <Text style={styles.label}>Item Total (Subtotal)</Text>
        <Text style={styles.value}>₹{subtotal}</Text>
      </View>

      {/* Delivery Fee */}
      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <Text style={styles.label}>Delivery Partner Fee</Text>
          {isFreeDelivery && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          )}
        </View>
        <View style={styles.deliveryPriceCol}>
          {isFreeDelivery ? (
            <View style={styles.rowInline}>
              <Text style={styles.strikethrough}>₹30</Text>
              <Text style={styles.freeText}>FREE</Text>
            </View>
          ) : (
            <Text style={styles.value}>₹{deliveryFee}</Text>
          )}
        </View>
      </View>

      {/* Handling / Packaging */}
      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <Text style={styles.label}>Eco-Friendly Packaging</Text>
        </View>
        <View style={styles.rowInline}>
          <Text style={styles.strikethrough}>₹15</Text>
          <Text style={styles.freeText}>FREE</Text>
        </View>
      </View>

      {/* Coupon Discount */}
      {appliedCoupon && couponDiscount > 0 && (
        <View style={styles.row}>
          <View style={styles.labelGroup}>
            <Text style={[styles.label, styles.discountLabel]}>
              Promo Discount ({appliedCoupon.code})
            </Text>
          </View>
          <Text style={styles.discountValue}>−₹{couponDiscount}</Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Grand Total */}
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>To Pay</Text>
          <Text style={styles.inclusiveText}>Inclusive of all taxes</Text>
        </View>
        <Text style={styles.totalValue}>₹{grandTotal}</Text>
      </View>

      {/* Savings Summary Banner */}
      {totalSaved > 0 && (
        <View style={styles.savingsBanner}>
          <Text style={styles.savingsIcon}>🎉</Text>
          <Text style={styles.savingsText}>
            You will save <Text style={styles.savingsBold}>₹{totalSaved}</Text> on this order!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm + 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.sizes.xs + 1,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  value: {
    fontSize: typography.sizes.xs + 1,
    color: colors.textPrimary,
    fontWeight: typography.weights.semiBold,
  },
  freeBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  freeBadgeText: {
    fontSize: 9,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  deliveryPriceCol: {
    alignItems: 'flex-end',
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strikethrough: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  freeText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  discountLabel: {
    color: colors.primaryDark,
  },
  discountValue: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  inclusiveText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.md,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  savingsIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  savingsText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
  },
  savingsBold: {
    fontWeight: typography.weights.bold,
  },
});

export default BillSummaryCard;