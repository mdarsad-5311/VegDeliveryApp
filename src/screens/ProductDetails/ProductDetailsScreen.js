import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Image,
  ActivityIndicator,
  RefreshControl,
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
import {
  productAPI,
  normalizeProduct,
  formatApiError,
} from '../../services';

export const ProductDetailsScreen = ({ navigation, route }) => {
  const {
    addToCart,
    getItemQuantity,
    isFavorite,
    toggleFavorite,
  } = useAppContext();

  // 1. Resolve Initial Product Data from Route Params or Fallback
  const productParam = route?.params?.product;
  const productIdParam = route?.params?.productId || productParam?.id;

  const initialProduct = useMemo(() => {
    if (productParam) {
      return productParam._backend
        ? productParam
        : normalizeProduct(productParam) || productParam;
    }
    if (productIdParam) {
      const match = ALL_PRODUCTS.find(p => p.id === productIdParam);
      return match ? normalizeProduct(match) || match : ALL_PRODUCTS[0];
    }
    return ALL_PRODUCTS[0];
  }, [productParam, productIdParam]);

  // Live product state
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [heroImageError, setHeroImageError] = useState(false);

  // Fetch fresh product detail from backend
  const fetchProductDetail = useCallback(
    async (isPullRefresh = false) => {
      const targetId = productIdParam || product?.id;
      if (!targetId) return;

      if (isPullRefresh) {
        setRefreshing(true);
      } else if (!product || !product.name) {
        setIsLoading(true);
      }
      setApiError(null);

      try {
        const res = await productAPI.getById(targetId);
        if (res.data) {
          const normalized = normalizeProduct(res.data);
          setProduct(normalized);
        }
      } catch (err) {
        // Only set error if we have no product to display
        if (!product || !product.name) {
          setApiError(formatApiError(err));
        }
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [productIdParam, product],
  );

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

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

  if (isLoading && !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading vegetable details...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.navIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.topNavRight}>
            <TouchableOpacity
              style={styles.navCircleBtn}
              activeOpacity={0.8}
              onPress={handleShare}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.navIcon}>↗️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCircleBtn}
              activeOpacity={0.8}
              onPress={() => toggleFavorite(product.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.navIcon}>{favorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchProductDetail(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }>
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

            {product.image && !heroImageError ? (
              <Image
                source={{ uri: product.image }}
                style={styles.heroImage}
                resizeMode="contain"
                onError={() => setHeroImageError(true)}
              />
            ) : (
              <Text style={styles.heroEmoji}>{product.emoji || '🥬'}</Text>
            )}
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
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.originText}>
                {product.origin || 'Farm Fresh Direct'}
              </Text>
            </View>

            {/* Price Box */}
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <Text style={styles.activePrice}>{unitPrice}</Text>
                {hasDiscount && (
                  <Text style={styles.originalPriceText}>
                    ₹{Math.round(product.originalPrice * (selectedUnit?.multiplier || 1))}
                  </Text>
                )}
                <Text style={styles.unitPerLabel}>
                  / {selectedUnit ? selectedUnit.label : product.unit}
                </Text>
              </View>

              {calculatedSavings > 0 && (
                <View style={styles.savingsPill}>
                  <Text style={styles.savingsText}>
                    Save ₹{calculatedSavings}
                  </Text>
                </View>
              )}
            </View>

            {/* 3. Weight / Unit Selector */}
            <View style={styles.unitSection}>
              <Text style={styles.sectionHeading}>Choose Pack Size:</Text>
              <UnitSelector
                options={unitOptions}
                selectedUnit={selectedUnit}
                onSelectUnit={handleUnitSelect}
              />
            </View>

            {/* 4. Quantity Stepper Section */}
            <View style={styles.stepperSection}>
              <View>
                <Text style={styles.sectionHeading}>Quantity:</Text>
                <Text style={styles.subHeading}>
                  {inCartQty > 0
                    ? `Already in cart: ${inCartQty} packs`
                    : 'Select how many packs you need'}
                </Text>
              </View>

              <View
                style={[
                  styles.stepperBox,
                  isOutOfStock && styles.stepperDisabled,
                ]}>
                <TouchableOpacity
                  style={[
                    styles.stepperBtn,
                    quantity <= 1 && styles.stepperBtnDisabled,
                  ]}
                  onPress={handleDecrement}
                  disabled={quantity <= 1 || isOutOfStock}>
                  <Text
                    style={[
                      styles.stepperBtnText,
                      quantity <= 1 && styles.stepperTextDisabled,
                    ]}>
                    -
                  </Text>
                </TouchableOpacity>

                <View style={styles.stepperCountBox}>
                  <Text style={styles.stepperCountText}>{quantity}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.stepperBtn,
                    (!canIncrement || isOutOfStock) && styles.stepperBtnDisabled,
                  ]}
                  onPress={handleIncrement}
                  disabled={!canIncrement || isOutOfStock}>
                  <Text
                    style={[
                      styles.stepperBtnText,
                      (!canIncrement || isOutOfStock) && styles.stepperTextDisabled,
                    ]}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Max Stock Alert Warning */}
            {quantity >= maxStock && !isOutOfStock && (
              <View style={styles.maxStockNotice}>
                <Text style={styles.maxStockNoticeText}>
                  ⚠️ Maximum available stock reached for this harvest ({maxStock} packs).
                </Text>
              </View>
            )}

            {/* 5. Freshness & Quality Badges */}
            <View style={styles.highlightsGrid}>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>🌱</Text>
                <Text style={styles.highlightTitle}>100% Organic</Text>
                <Text style={styles.highlightDesc}>Chemical & pesticide-free</Text>
              </View>

              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>❄️</Text>
                <Text style={styles.highlightTitle}>Cold-Chain</Text>
                <Text style={styles.highlightDesc}>Stored at 4°C fresh</Text>
              </View>

              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>⏱️</Text>
                <Text style={styles.highlightTitle}>Shelf Life</Text>
                <Text style={styles.highlightDesc}>{product.shelfLife || '3–4 days refrigerated'}</Text>
              </View>

              <View style={styles.highlightCard}>
                <Text style={styles.highlightIcon}>🧼</Text>
                <Text style={styles.highlightTitle}>Pre-Washed</Text>
                <Text style={styles.highlightDesc}>Ozone-cleansed ready to cook</Text>
              </View>
            </View>

            {/* 6. Nutritional Facts */}
            {product.nutrition && (
              <View style={styles.nutritionBox}>
                <Text style={styles.nutritionTitle}>NUTRITIONAL VALUES (PER 100G)</Text>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientVal}>{product.nutrition.calories || '25 kcal'}</Text>
                    <Text style={styles.nutrientLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutrientDivider} />
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientVal}>{product.nutrition.protein || '2.2g'}</Text>
                    <Text style={styles.nutrientLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutrientDivider} />
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientVal}>{product.nutrition.carbs || '3.5g'}</Text>
                    <Text style={styles.nutrientLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutrientDivider} />
                  <View style={styles.nutrientItem}>
                    <Text style={styles.nutrientVal}>{product.nutrition.vitamin || 'Vit A & C'}</Text>
                    <Text style={styles.nutrientLabel}>Key Nutrients</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 7. Description & Storage Tips */}
            <View style={styles.descSection}>
              <Text style={styles.sectionHeading}>About this Vegetable:</Text>
              <Text
                style={styles.descriptionText}
                numberOfLines={descriptionExpanded ? undefined : 3}>
                {product.description ||
                  'Naturally grown, hand-picked farm vegetables harvested fresh every sunrise.'}
              </Text>
              {product.description && product.description.length > 100 && (
                <TouchableOpacity
                  onPress={() => setDescriptionExpanded(prev => !prev)}
                  style={styles.readMoreBtn}>
                  <Text style={styles.readMoreText}>
                    {descriptionExpanded ? 'Read Less ▲' : 'Read More ▼'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Floating Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.totalPriceCol}>
            <Text style={styles.totalPriceLabel}>Total Amount</Text>
            <View style={styles.totalPriceRow}>
              <Text style={styles.totalPriceValue}>₹{totalPrice}</Text>
              {calculatedSavings > 0 && (
                <Text style={styles.totalSavingsTag}>
                  Save ₹{calculatedSavings}
                </Text>
              )}
            </View>
            <Text style={styles.totalItemsLabel}>
              {quantity} × {selectedUnit ? selectedUnit.label : product.unit}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartBtn,
              isOutOfStock && styles.addToCartBtnDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleAddToCart}
            disabled={isOutOfStock}>
            <Text style={styles.cartIcon}>🛍️</Text>
            <Text style={styles.addToCartText}>
              {isOutOfStock ? 'Out of Stock' : 'Add to Basket'}
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
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  topNavBar: {
    position: 'absolute',
    top: 12,
    left: spacing.md,
    right: spacing.md,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  navIcon: {
    fontSize: 20,
  },
  topNavRight: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  heroImage: {
    width: '80%',
    height: '80%',
    borderRadius: borderRadius.md,
  },
  heroDiscountBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: '#FF5722',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    elevation: 2,
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
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  heroTagText: {
    color: colors.textInverse,
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
    fontSize: 11,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
    color: '#FF8F00',
    fontSize: 12,
    marginRight: 2,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: '#FF8F00',
  },
  reviewsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: colors.textMuted,
  },
  originText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: 2,
  },
  activePrice: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: 8,
  },
  originalPriceText: {
    fontSize: 16,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  unitPerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  savingsPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  savingsText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  unitSection: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  stepperSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
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
