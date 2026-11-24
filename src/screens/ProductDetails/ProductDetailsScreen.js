import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';
import {
  ALL_PRODUCTS,
  getProductUnitOptions,
  getProductStockInfo,
} from '../../constants/mockData';
import {
  UnitSelector,
  StockStatusBadge,
  AddToCartToast,
} from '../../components/products';

export const ProductDetailsScreen = ({ navigation, route }) => {
  const {
    addToCart,
    getItemQuantity,
    isFavorite,
    toggleFavorite,
  } = useAppContext();

  // 1. Resolve Product Data from Route Params or Fallback
  const productParam = route?.params?.product;
  const productIdParam = route?.params?.productId;

  const product = useMemo(() => {
    if (productParam) return productParam;
    if (productIdParam) {
      return ALL_PRODUCTS.find(p => p.id === productIdParam) || ALL_PRODUCTS[0];
    }
    return ALL_PRODUCTS[0];
  }, [productParam, productIdParam]);

  // 2. Unit Options & Stock Info
  const unitOptions = useMemo(() => getProductUnitOptions(product), [product]);
  const stockInfo = useMemo(() => getProductStockInfo(product), [product]);

  // 3. Local State
  const [selectedUnit, setSelectedUnit] = useState(
    unitOptions.length > 0 ? unitOptions[0] : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync unit when product changes
  useEffect(() => {
    if (unitOptions.length > 0) {
      // If product has a unit string matching one of the options
      const match = unitOptions.find(u => u.label === product.unit);
      setSelectedUnit(match || unitOptions[0]);
    }
  }, [product, unitOptions]);

  // 4. Price & Discount Calculations
  const unitPrice = selectedUnit ? selectedUnit.price : product.price || 30;
  const totalPrice = unitPrice * quantity;

  const hasDiscount = Boolean(
    product.originalPrice && product.originalPrice > product.price,
  );
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;
  const calculatedSavings = hasDiscount
    ? Math.round(
        (product.originalPrice * (selectedUnit?.multiplier || 1) - unitPrice) *
          quantity,
      )
    : 0;

  // Stock constraints
  const isOutOfStock = !stockInfo.isAvailable;
  const maxStock = stockInfo.availableStock;
  const inCartQty = getItemQuantity(product.id);
  const canIncrement = quantity < maxStock;

  // Favorites
  const favorited = isFavorite(product.id);

  // Handlers
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleUnitSelect = unitItem => {
    setSelectedUnit(unitItem);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Order fresh ${product.name} on FreshVeg! Farm-fresh quality delivered in 30 mins: https://freshveg.in/product/${product.id}`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const res = addToCart(product, quantity, selectedUnit);
    if (res && res.success) {
      setToastMessage(
        res.exceeded
          ? res.message
          : `✓ Added ${quantity} × ${selectedUnit?.label || product.unit} to basket!`,
      );
      setToastVisible(true);
    }
  };

  const handleNavigateCart = () => {
    setToastVisible(false);
    navigation.navigate('MainTabs', { screen: 'Cart' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      {/* Success Notification Toast */}
      <AddToCartToast
        visible={toastVisible}
        message={toastMessage}
        onDismiss={() => setToastVisible(false)}
        onViewCart={handleNavigateCart}
      />

      <View style={styles.container}>
        {/* Floating Top Navigation Header */}
        <View style={styles.topNavBar}>
          <TouchableOpacity
            style={styles.navCircleBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.navBackArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.navRightActions}>
            <TouchableOpacity
              style={styles.navCircleBtn}
              activeOpacity={0.8}
              onPress={handleShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.navActionIcon}>📤</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navCircleBtn,
                favorited && styles.navCircleBtnActive,
              ]}
              activeOpacity={0.8}
              onPress={() => toggleFavorite(product.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.navActionIcon}>
                {favorited ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* 1. Large Hero Product Image Container */}
          <View
            style={[
              styles.heroContainer,
              { backgroundColor: product.accentColor || '#E8F5E9' },
            ]}>
            {/* Discount Badge on Hero */}
            {hasDiscount && (
              <View style={styles.heroDiscountBadge}>
                <Text style={styles.heroDiscountText}>
                  {discountPercent}% OFF
                </Text>
              </View>
            )}

            {product.tag && (
              <View style={styles.heroTagBadge}>
                <Text style={styles.heroTagText}>{product.tag}</Text>
              </View>
            )}

            <Text style={styles.heroEmoji}>{product.emoji}</Text>
          </View>

          {/* 2. Main Product Info Card */}
          <View style={styles.infoCard}>
            {/* Category Pill & Stock Status Badge */}
            <View style={styles.metaRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{product.category}</Text>
              </View>

              <StockStatusBadge stockInfo={stockInfo} />
            </View>

            {/* Product Name */}
            <Text style={styles.productName}>{product.name}</Text>

            {/* Rating & Reviews Row */}
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.ratingVal}>{product.rating || '4.8'}</Text>
              </View>
              <Text style={styles.reviewsText}>
                ({product.reviews || 250} customer reviews)
              </Text>
              <Text style={styles.ratingDivider}>•</Text>
              <Text style={styles.harvestText}>Farm-Fresh Harvest</Text>
            </View>

            {/* Pricing Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <Text style={styles.sellingPrice}>₹{unitPrice}</Text>
                {hasDiscount && (
                  <Text style={styles.originalPrice}>
                    ₹
                    {Math.round(
                      (product.originalPrice || 40) *
                        (selectedUnit?.multiplier || 1),
                    )}
                  </Text>
                )}
                {hasDiscount && (
                  <View style={styles.savingsPill}>
                    <Text style={styles.savingsPillText}>
                      Save {discountPercent}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.priceSub}>
                Price for {selectedUnit?.label || product.unit} (Inclusive of all
                taxes)
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* 3. Unit / Pack Selection */}
            <UnitSelector
              options={unitOptions}
              selectedOption={selectedUnit}
              onSelectOption={handleUnitSelect}
              disabled={isOutOfStock}
            />

            {/* 4. Quantity Selector with Minus/Plus */}
            <View style={styles.quantitySection}>
              <View>
                <Text style={styles.sectionHeading}>Select Quantity</Text>
                <Text style={styles.quantitySub}>
                  {isOutOfStock
                    ? 'Unavailable'
                    : maxStock <= 5
                    ? `Only ${maxStock} in stock`
                    : 'Fresh stock available'}
                </Text>
              </View>

              <View
                style={[
                  styles.stepperContainer,
                  isOutOfStock && styles.stepperDisabled,
                ]}>
                <TouchableOpacity
                  style={[
                    styles.stepperBtn,
                    quantity <= 1 && styles.stepperBtnDisabled,
                  ]}
                  activeOpacity={0.7}
                  disabled={quantity <= 1 || isOutOfStock}
                  onPress={handleDecrement}>
                  <Text
                    style={[
                      styles.stepperBtnText,
                      quantity <= 1 && styles.stepperTextDisabled,
                    ]}>
                    −
                  </Text>
                </TouchableOpacity>

                <View style={styles.stepperCountBox}>
                  <Text style={styles.stepperCountText}>{quantity}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.stepperBtn,
                    (!canIncrement || isOutOfStock) &&
                      styles.stepperBtnDisabled,
                  ]}
                  activeOpacity={0.7}
                  disabled={!canIncrement || isOutOfStock}
                  onPress={handleIncrement}>
                  <Text
                    style={[
                      styles.stepperBtnText,
                      (!canIncrement || isOutOfStock) &&
                        styles.stepperTextDisabled,
                    ]}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Max Stock Warning If Applicable */}
            {!canIncrement && !isOutOfStock && (
              <View style={styles.maxStockNotice}>
                <Text style={styles.maxStockNoticeText}>
                  ⚠️ Maximum available stock reached for this product ({maxStock}{' '}
                  packs).
                </Text>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* 5. Farm-to-Table Assurance Highlights */}
            <Text style={styles.sectionHeading}>Freshness & Quality</Text>
            <View style={styles.highlightsGrid}>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>🌱</Text>
                <Text style={styles.highlightTitle}>100% Organically Grown</Text>
                <Text style={styles.highlightDesc}>
                  Pesticide free & soil-tested
                </Text>
              </View>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>⚡</Text>
                <Text style={styles.highlightTitle}>30 Min Delivery</Text>
                <Text style={styles.highlightDesc}>
                  Temperature packed & sealed
                </Text>
              </View>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>📍</Text>
                <Text style={styles.highlightTitle}>Farm Origin</Text>
                <Text style={styles.highlightDesc}>
                  {product.origin || 'Nashik Organic Valley, Maharashtra'}
                </Text>
              </View>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>❄️</Text>
                <Text style={styles.highlightTitle}>Storage Advice</Text>
                <Text style={styles.highlightDesc}>
                  {product.shelfLife || 'Best consumed within 3–4 days'}
                </Text>
              </View>
            </View>

            {/* 6. Nutrition Facts Card */}
            {product.nutrition && (
              <View style={styles.nutritionBox}>
                <Text style={styles.nutritionTitle}>
                  Nutritional Value (Per 100g)
                </Text>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientVal}>
                      {product.nutrition.calories || '25 kcal'}
                    </Text>
                    <Text style={styles.nutrientLabel}>Energy</Text>
                  </View>
                  <View style={styles.nutrientDivider} />
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientVal}>
                      {product.nutrition.carbs || '4.2g'}
                    </Text>
                    <Text style={styles.nutrientLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutrientDivider} />
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientVal}>
                      {product.nutrition.protein || '1.8g'}
                    </Text>
                    <Text style={styles.nutrientLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutrientDivider} />
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientVal}>
                      {product.nutrition.vitamin ? 'Rich' : 'High'}
                    </Text>
                    <Text style={styles.nutrientLabel}>Vitamins</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 7. Product Description */}
            <View style={styles.descSection}>
              <Text style={styles.sectionHeading}>About this Product</Text>
              <Text
                style={styles.descriptionText}
                numberOfLines={descriptionExpanded ? undefined : 3}>
                {product.description}
                {' '}
                Our vegetables are handpicked at peak ripeness at local
                partner farms and brought directly to cold storage distribution
                centers within hours of harvest to preserve crunchiness, flavor,
                and nutrient bioavailability.
              </Text>
              <TouchableOpacity
                onPress={() => setDescriptionExpanded(prev => !prev)}
                activeOpacity={0.7}
                style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>
                  {descriptionExpanded ? 'Read Less ▲' : 'Read More ▼'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* 8. Bottom Persistent Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.totalPriceCol}>
            <Text style={styles.totalPriceLabel}>Total Price</Text>
            <View style={styles.totalPriceRow}>
              <Text style={styles.totalPriceValue}>₹{totalPrice}</Text>
              {calculatedSavings > 0 && (
                <Text style={styles.totalSavingsTag}>
                  (Save ₹{calculatedSavings})
                </Text>
              )}
            </View>
            <Text style={styles.totalItemsLabel}>
              {quantity} {quantity === 1 ? 'pack' : 'packs'} •{' '}
              {selectedUnit?.label || product.unit}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartBtn,
              isOutOfStock && styles.addToCartBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={isOutOfStock}
            onPress={handleAddToCart}>
            <Text style={styles.cartIcon}>🛒</Text>
            <Text style={styles.addToCartText}>
              {isOutOfStock
                ? 'Out of Stock'
                : inCartQty > 0
                ? `Update Cart (${inCartQty})`
                : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topNavBar: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  navCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  navCircleBtnActive: {
    backgroundColor: '#FFEBEE',
  },
  navBackArrow: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  navRightActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navActionIcon: {
    fontSize: 18,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroContainer: {
    height: 310,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroEmoji: {
    fontSize: 128,
  },
  heroDiscountBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  heroDiscountText: {
    color: colors.textInverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  heroTagBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroTagText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  categoryPillText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  productName: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: 6,
  },
  starIcon: {
    color: '#FFB300',
    fontSize: 12,
    marginRight: 2,
  },
  ratingVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#795548',
  },
  reviewsText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginRight: 6,
  },
  ratingDivider: {
    color: colors.textMuted,
    marginRight: 6,
  },
  harvestText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.weights.semiBold,
  },
  priceSection: {
    marginVertical: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sellingPrice: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    marginRight: spacing.sm,
  },
  originalPrice: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginRight: spacing.sm,
  },
  savingsPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  savingsPillText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  priceSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  sectionHeading: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  quantitySub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  stepperDisabled: {
    opacity: 0.5,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  stepperBtnDisabled: {
    backgroundColor: colors.background,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  stepperTextDisabled: {
    color: colors.textMuted,
  },
  stepperCountBox: {
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCountText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  maxStockNotice: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  maxStockNoticeText: {
    fontSize: 11,
    color: '#E65100',
    fontWeight: typography.weights.semiBold,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  highlightCard: {
    width: '48%',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  highlightIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  highlightDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nutritionBox: {
    backgroundColor: '#F1F8E9',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#DCEDC8',
  },
  nutritionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutrientVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  nutrientLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nutrientDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#C5E1A5',
  },
  descSection: {
    marginTop: spacing.md,
  },
  descriptionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  readMoreBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  totalPriceCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  totalPriceLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    textTransform: 'uppercase',
  },
  totalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalPriceValue: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    marginRight: 6,
  },
  totalSavingsTag: {
    fontSize: 11,
    color: '#388E3C',
    fontWeight: typography.weights.bold,
  },
  totalItemsLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  addToCartBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    elevation: 3,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addToCartBtnDisabled: {
    backgroundColor: colors.textMuted,
    elevation: 0,
    shadowOpacity: 0,
  },
  cartIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  addToCartText: {
    color: colors.textInverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});

export default ProductDetailsScreen;
