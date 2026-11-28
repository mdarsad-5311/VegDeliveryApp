import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';

export const ProductCard = ({
  product,
  variant = 'compact', // 'compact' | 'featured' | 'grid'
  onPress,
}) => {
  const {
    getItemQuantity,
    addToCart,
    removeFromCart,
    isFavorite,
    toggleFavorite,
  } = useAppContext();

  const [imageError, setImageError] = useState(false);

  const quantity = getItemQuantity(product.id);
  const favorited = isFavorite(product.id);

  // Exact discount calculation
  const hasDiscount = Boolean(
    product.originalPrice && product.originalPrice > product.price,
  );
  const calculatedPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;
  const discountBadgeText =
    product.discountBadge ||
    (hasDiscount ? `${calculatedPercent}% OFF` : null);

  if (variant === 'compact') {
    return (
      <View style={styles.compactCard}>
        {/* Top Tag & Favorite */}
        <View style={styles.compactHeader}>
          {discountBadgeText ? (
            <View style={styles.discountBadgeSmall}>
              <Text style={styles.discountBadgeText}>{discountBadgeText}</Text>
            </View>
          ) : product.tag ? (
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{product.tag}</Text>
            </View>
          ) : (
            <View />
          )}
          <TouchableOpacity
            onPress={() => toggleFavorite(product.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.favoriteIcon}>{favorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Visual / Image */}
        <TouchableOpacity
          style={[
            styles.visualContainer,
            { backgroundColor: product.accentColor || '#E8F5E9' },
          ]}
          activeOpacity={0.8}
          onPress={() => onPress && onPress(product)}>
          {product.image && !imageError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.compactImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={styles.compactEmoji}>{product.emoji || '🥬'}</Text>
          )}
        </TouchableOpacity>

        {/* Details */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onPress && onPress(product)}>
          <Text style={styles.compactName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.compactUnit}>{product.unit}</Text>
        </TouchableOpacity>

        {/* Bottom Price & Add Stepper */}
        <View style={styles.compactFooter}>
          <View>
            <Text style={styles.compactPrice}>₹{product.price}</Text>
            {hasDiscount && (
              <Text style={styles.originalPriceMicro}>
                ₹{product.originalPrice}
              </Text>
            )}
          </View>

          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={() => addToCart(product)}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => removeFromCart(product.id)}>
                <Text style={styles.stepperBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperCount}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => addToCart(product)}>
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  if (variant === 'featured') {
    return (
      <View style={styles.featuredCard}>
        {/* Discount Badge & Favorite */}
        <View style={styles.featuredTopRow}>
          {discountBadgeText ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{discountBadgeText}</Text>
            </View>
          ) : (
            <View />
          )}
          <TouchableOpacity
            onPress={() => toggleFavorite(product.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.favoriteIcon}>{favorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Visual */}
        <TouchableOpacity
          style={[
            styles.featuredVisual,
            { backgroundColor: product.accentColor || '#E8F5E9' },
          ]}
          activeOpacity={0.8}
          onPress={() => onPress && onPress(product)}>
          {product.image && !imageError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.featuredImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={styles.featuredEmoji}>{product.emoji || '🥬'}</Text>
          )}
        </TouchableOpacity>

        {/* Content */}
        <Text style={styles.featuredName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.featuredUnit}>{product.unit}</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>
            {product.rating} ({product.reviews || 0})
          </Text>
        </View>

        {/* Price Row with Original Strikethrough */}
        <View style={styles.featuredPriceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.featuredPrice}>₹{product.price}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
          </View>
        </View>

        {/* Add Button or Stepper */}
        {quantity === 0 ? (
          <TouchableOpacity
            style={styles.featuredAddButton}
            activeOpacity={0.8}
            onPress={() => addToCart(product)}>
            <Text style={styles.featuredAddText}>+ Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.featuredStepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => removeFromCart(product.id)}>
              <Text style={styles.stepperBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepperCount}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => addToCart(product)}>
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Grid Variant (Used in Product Listing & Recommendations)
  return (
    <View style={styles.gridCard}>
      {/* Top Tag / Discount & Favorite */}
      <View style={styles.gridTopRow}>
        {discountBadgeText ? (
          <View style={styles.discountBadgeSmall}>
            <Text style={styles.discountBadgeText}>{discountBadgeText}</Text>
          </View>
        ) : product.tag ? (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{product.tag}</Text>
          </View>
        ) : (
          <View />
        )}
        <TouchableOpacity
          onPress={() => toggleFavorite(product.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.favoriteIcon}>{favorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Visual */}
      <TouchableOpacity
        style={[
          styles.gridVisual,
          { backgroundColor: product.accentColor || '#E8F5E9' },
        ]}
        activeOpacity={0.8}
        onPress={() => onPress && onPress(product)}>
        {product.image && !imageError ? (
          <Image
            source={{ uri: product.image }}
            style={styles.gridImage}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <Text style={styles.gridEmoji}>{product.emoji || '🥬'}</Text>
        )}
      </TouchableOpacity>

      {/* Name & Unit */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress && onPress(product)}>
        <Text style={styles.gridName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.gridUnit}>{product.unit}</Text>
      </TouchableOpacity>

      {/* Rating */}
      <View style={styles.ratingRowSmall}>
        <Text style={styles.starSmall}>★</Text>
        <Text style={styles.ratingTextSmall}>
          {product.rating} {product.reviews ? `(${product.reviews})` : ''}
        </Text>
      </View>

      {/* Price & Add */}
      <View style={styles.gridFooter}>
        <View style={styles.priceColumn}>
          <Text style={styles.gridPrice}>₹{product.price}</Text>
          {hasDiscount && (
            <Text style={styles.originalPriceSmall}>
              ₹{product.originalPrice}
            </Text>
          )}
        </View>

        {quantity === 0 ? (
          <TouchableOpacity
            style={styles.gridAddButton}
            activeOpacity={0.8}
            onPress={() => addToCart(product)}>
            <Text style={styles.gridAddText}>+ Add</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.gridStepper}>
            <TouchableOpacity
              style={styles.gridStepperBtn}
              onPress={() => removeFromCart(product.id)}>
              <Text style={styles.gridStepperBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.gridStepperCount}>{quantity}</Text>
            <TouchableOpacity
              style={styles.gridStepperBtn}
              onPress={() => addToCart(product)}>
              <Text style={styles.gridStepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact Variant (Popular)
  compactCard: {
    width: 145,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  favoriteIcon: {
    fontSize: 14,
  },
  visualContainer: {
    height: 80,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  compactEmoji: {
    fontSize: 42,
  },
  compactName: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  compactUnit: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  originalPriceMicro: {
    fontSize: 10,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addButtonText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  stepperBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  stepperCount: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    paddingHorizontal: 4,
  },

  // Featured Variant (Best Sellers)
  featuredCard: {
    width: 175,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  discountBadgeSmall: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  discountBadgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  featuredVisual: {
    height: 95,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featuredEmoji: {
    fontSize: 48,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  featuredUnit: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  star: {
    color: '#FFB300',
    fontSize: 11,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  featuredPrice: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  featuredAddButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  featuredAddText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  featuredStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },

  // Grid Variant (Product Listing & Recommended)
  gridCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  gridTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gridVisual: {
    height: 90,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  gridEmoji: {
    fontSize: 44,
  },
  gridName: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  gridUnit: {
    fontSize: 11,
    color: colors.textMuted,
  },
  ratingRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  starSmall: {
    color: '#FFB300',
    fontSize: 10,
    marginRight: 2,
  },
  ratingTextSmall: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  priceColumn: {
    justifyContent: 'center',
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  originalPriceSmall: {
    fontSize: 10,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  gridAddButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  gridAddText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  gridStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  gridStepperBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  gridStepperBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  gridStepperCount: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    paddingHorizontal: 4,
  },
  compactImage: {
    width: '85%',
    height: '85%',
    borderRadius: borderRadius.sm,
  },
  featuredImage: {
    width: '85%',
    height: '85%',
    borderRadius: borderRadius.sm,
  },
  gridImage: {
    width: '85%',
    height: '85%',
    borderRadius: borderRadius.sm,
  },
});

export default ProductCard;
