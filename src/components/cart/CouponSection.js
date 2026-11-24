import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const CouponSection = ({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  subtotal,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleApply = codeToApply => {
    const targetCode = (codeToApply || couponCode).trim();
    if (!targetCode) {
      setFeedback({ type: 'error', message: 'Please enter a coupon code' });
      return;
    }
    const result = onApplyCoupon && onApplyCoupon(targetCode, subtotal);
    if (result && result.success) {
      setFeedback({ type: 'success', message: result.message });
      setCouponCode('');
    } else {
      setFeedback({
        type: 'error',
        message: result?.message || 'Invalid coupon code',
      });
    }
  };

  const handleQuickSelect = code => {
    setCouponCode(code);
    handleApply(code);
  };

  const handleRemove = () => {
    onRemoveCoupon && onRemoveCoupon();
    setFeedback(null);
    setCouponCode('');
  };

  const availableOffers = [
    { code: 'FRESH20', title: '20% OFF', desc: 'Max ₹120' },
    { code: 'FRESHFARM', title: '15% OFF', desc: 'Max ₹80' },
    { code: 'HARVEST', title: '₹25 OFF', desc: 'Flat discount' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Offers & Coupons 🏷️</Text>

      {appliedCoupon ? (
        <View style={styles.appliedCard}>
          <View style={styles.appliedInfo}>
            <View style={styles.badgeRow}>
              <Text style={styles.appliedBadge}>APPLIED</Text>
              <Text style={styles.appliedCode}>{appliedCoupon.code}</Text>
            </View>
            <Text style={styles.appliedDesc}>
              {appliedCoupon.label} • Saved ₹{appliedCoupon.discount}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={handleRemove}
            activeOpacity={0.7}
            accessibilityLabel="Remove coupon">
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter promo code"
              placeholderTextColor={colors.textMuted}
              value={couponCode}
              onChangeText={val => {
                setCouponCode(val.toUpperCase());
                if (feedback) setFeedback(null);
              }}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={() => handleApply()}
            />
            <TouchableOpacity
              style={[
                styles.applyBtn,
                !couponCode.trim() && styles.applyBtnDisabled,
              ]}
              onPress={() => handleApply()}
              disabled={!couponCode.trim()}
              activeOpacity={0.8}
              accessibilityLabel="Apply promo code">
              <Text
                style={[
                  styles.applyBtnText,
                  !couponCode.trim() && styles.applyBtnTextDisabled,
                ]}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>

          {feedback && (
            <View
              style={[
                styles.feedbackBox,
                feedback.type === 'error'
                  ? styles.feedbackError
                  : styles.feedbackSuccess,
              ]}>
              <Text
                style={[
                  styles.feedbackText,
                  feedback.type === 'error'
                    ? styles.feedbackErrorText
                    : styles.feedbackSuccessText,
                ]}>
                {feedback.message}
              </Text>
            </View>
          )}

          {/* Quick Coupon Chips */}
          <View style={styles.quickOffersRow}>
            {availableOffers.map(offer => (
              <TouchableOpacity
                key={offer.code}
                style={styles.chip}
                activeOpacity={0.7}
                onPress={() => handleQuickSelect(offer.code)}>
                <Text style={styles.chipCode}>{offer.code}</Text>
                <Text style={styles.chipTitle}>{offer.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  sectionTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  applyBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  applyBtnTextDisabled: {
    color: colors.textMuted,
  },
  feedbackBox: {
    marginTop: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  feedbackError: {
    backgroundColor: '#FFEBEE',
  },
  feedbackSuccess: {
    backgroundColor: '#E8F5E9',
  },
  feedbackText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  feedbackErrorText: {
    color: colors.error,
  },
  feedbackSuccessText: {
    color: colors.primaryDark,
  },
  quickOffersRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    justifyContent: 'space-between',
  },
  chip: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#F1F8E9',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center',
  },
  chipCode: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  chipTitle: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1,
  },
  appliedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  appliedInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedBadge: {
    backgroundColor: colors.primary,
    color: colors.surface,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 6,
  },
  appliedCode: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  appliedDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  removeBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.error,
  },
});

export default CouponSection;