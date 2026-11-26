import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const CartItemCard = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onPressItem,
}) => {
  const { product, quantity, unit } = item;
  const unitPrice = product.price || 0;
  const itemSubtotal = unitPrice * quantity;
  const maxStock =
    product.availableStock !== undefined
      ? product.availableStock
      : product.inStock === false
      ? 0
      : 50;
  const isMaxStock = quantity >= maxStock;
  const displayUnit = unit || product.unit || '1 kg';

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        {/* Visual / Emoji */}
        <TouchableOpacity
          style={[
            styles.visualContainer,
            { backgroundColor: product.accentColor || '#E8F5E9' },
          ]}
          activeOpacity={0.8}
          onPress={() => onPressItem && onPressItem(product)}>
          <Text style={styles.emoji}>{product.emoji}</Text>
        </TouchableOpacity>

        {/* Details Column */}
        <View style={styles.detailsCol}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPressItem && onPressItem(product)}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
          </TouchableOpacity>

          {/* Unit pill */}
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>{displayUnit}</Text>
          </View>

          {/* Price breakdown */}
          <View style={styles.priceRow}>
            <Text style={styles.unitPriceText}>₹{unitPrice}</Text>
            <Text style={styles.multiplyText}>×</Text>
            <Text style={styles.qtyText}>{quantity}</Text>
            <Text style={styles.equalText}>=</Text>
            <Text style={styles.subtotalText}>₹{itemSubtotal}</Text>
          </View>
        </View>

        {/* Actions Column: Stepper & Remove */}
        <View style={styles.actionsCol}>
          {/* Quantity Stepper */}
          <View style={styles.stepper}>
            <TouchableOpacity
              style={[
                styles.stepperBtn,
                quantity <= 1 && styles.stepperBtnDisabled,
              ]}
              activeOpacity={0.7}
              disabled={quantity <= 1}
              onPress={() => onDecrement && onDecrement(product.id)}
              accessibilityLabel={`Decrease quantity of ${product.name}`}>
              <Text
                style={[
                  styles.stepperBtnText,
                  quantity <= 1 && styles.stepperTextDisabled,
                ]}>
                −
              </Text>
            </TouchableOpacity>

            <View style={styles.countBox}>
              <Text style={styles.countText}>{quantity}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.stepperBtn,
                isMaxStock && styles.stepperBtnDisabled,
              ]}
              activeOpacity={0.7}
              disabled={isMaxStock}
              onPress={() => onIncrement && onIncrement(product)}
              accessibilityLabel={`Increase quantity of ${product.name}`}>
              <Text
                style={[
                  styles.stepperBtnText,
                  isMaxStock && styles.stepperTextDisabled,
                ]}>
                +
              </Text>
            </TouchableOpacity>
          </View>

          {/* Explicit Remove Button */}
          <TouchableOpacity
            style={styles.removeBtn}
            activeOpacity={0.7}
            onPress={() => onRemove && onRemove(product)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Remove ${product.name} from cart`}>
            <Text style={styles.removeIcon}>🗑️</Text>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stock Limit Notice */}
      {isMaxStock && (
        <View style={styles.stockNotice}>
          <Text style={styles.stockNoticeText}>
            Maximum available stock reached ({maxStock} units).
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
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visualContainer: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  emoji: {
    fontSize: 34,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  unitBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 3,
    marginBottom: 4,
  },
  unitText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitPriceText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  multiplyText: {
    fontSize: 10,
    color: colors.textMuted,
    marginHorizontal: 3,
  },
  qtyText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  equalText: {
    fontSize: 10,
    color: colors.textMuted,
    marginHorizontal: 3,
  },
  subtotalText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  actionsCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  stepperBtnDisabled: {
    backgroundColor: '#F5F5F5',
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  stepperTextDisabled: {
    color: colors.textMuted,
  },
  countBox: {
    minWidth: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  removeIcon: {
    fontSize: 11,
    marginRight: 2,
  },
  removeText: {
    fontSize: 11,
    color: colors.error,
    fontWeight: typography.weights.semiBold,
  },
  stockNotice: {
    marginTop: spacing.xs,
    paddingVertical: 3,
    paddingHorizontal: spacing.xs,
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.sm,
  },
  stockNoticeText: {
    fontSize: 10,
    color: '#E65100',
    fontWeight: typography.weights.medium,
  },
});

export default CartItemCard;
