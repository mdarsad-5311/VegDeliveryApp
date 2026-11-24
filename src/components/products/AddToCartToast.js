import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const AddToCartToast = ({
  visible,
  message,
  onDismiss,
  onViewCart,
  autoHideMs = 3500,
}) => {
  useEffect(() => {
    if (visible && autoHideMs > 0) {
      const timer = setTimeout(() => {
        onDismiss && onDismiss();
      }, autoHideMs);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHideMs, onDismiss]);

  if (!visible) return null;

  return (
    <View style={styles.toastContainer}>
      <View style={styles.contentRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {message || 'Item added to basket!'}
        </Text>
      </View>

      {onViewCart && (
        <TouchableOpacity
          style={styles.viewCartBtn}
          activeOpacity={0.8}
          onPress={onViewCart}>
          <Text style={styles.viewCartText}>View Basket ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 15,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: '#1B5E20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkIcon: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  messageText: {
    color: colors.textInverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    flex: 1,
  },
  viewCartBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  viewCartText: {
    color: colors.textInverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});

export default AddToCartToast;
