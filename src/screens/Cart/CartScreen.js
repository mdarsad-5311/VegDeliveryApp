import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';
import { CartItemCard, CouponSection, BillSummaryCard } from '../../components/cart';

export const CartScreen = ({ navigation }) => {
  const {
    cart,
    backendCart,
    isCartLoading,
    fetchBackendCart,
    isAuthenticated,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    addToCart,
    removeFromCart,
    removeCartItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useAppContext();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isAuthenticated && typeof fetchBackendCart === 'function') {
      await fetchBackendCart();
    }
    setRefreshing(false);
  }, [isAuthenticated, fetchBackendCart]);

  const cartList = Object.values(cart);
  const freeDeliveryThreshold = 199;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const progressRatio = Math.min(1, cartSubtotal / freeDeliveryThreshold);
  const grandTotal = cartTotal !== undefined ? cartTotal : Math.max(0, cartSubtotal + (deliveryFee || 0));

  // Stepper increment with stock check
  const handleIncrement = useCallback(
    product => {
      const result = addToCart(product, 1);
      if (result && result.exceeded) {
        Alert.alert(
          'Stock Limit Reached',
          result.message || 'You have reached the maximum available stock for this product.',
          [{ text: 'OK' }],
        );
      }
    },
    [addToCart],
  );

  // Stepper decrement (stops at minimum 1)
  const handleDecrement = useCallback(
    productId => {
      removeFromCart(productId);
    },
    [removeFromCart],
  );

  // Explicit item removal with confirmation
  const handleRemove = useCallback(
    productOrId => {
      const product = typeof productOrId === 'object' ? productOrId : cart[productOrId]?.product;
      const productId = product?.id || productOrId;
      const productName = product?.name || 'this item';

      Alert.alert(
        'Remove from Cart',
        `Are you sure you want to remove "${productName}" from your cart?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              removeCartItem(productId);
            },
          },
        ],
      );
    },
    [cart, removeCartItem],
  );

  // Navigate to item details
  const handlePressItem = useCallback(
    product => {
      if (navigation && navigation.navigate) {
        navigation.navigate('ProductDetails', { product });
      }
    },
    [navigation],
  );

  // Navigate to product listing screen
  const handleContinueShopping = useCallback(() => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ProductListing');
    }
  }, [navigation]);

  // Navigate to checkout
  const handleProceedToCheckout = useCallback(() => {
    if (cartCount === 0) return;
    if (navigation && navigation.navigate) {
      navigation.navigate('Checkout');
    }
  }, [navigation, cartCount]);

  const canGoBack = navigation && navigation.canGoBack && navigation.canGoBack();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {canGoBack && (
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back">
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Shopping Cart 🛒</Text>
            <Text style={styles.headerSubtitle}>
              {cartCount === 0
                ? 'Your basket is empty'
                : `${cartCount} item${cartCount === 1 ? '' : 's'} ready for delivery`}
            </Text>
          </View>
        </View>

        {cartCount === 0 ? (
          /* Empty Cart State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>🛒</Text>
            </View>
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven't added anything to your cart yet. Explore our farm-fresh vegetables and fruits!
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              activeOpacity={0.8}
              onPress={handleContinueShopping}
              accessibilityLabel="Continue Shopping">
              <Text style={styles.shopButtonText}>Continue Shopping →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Populated Cart Content */
          <>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }>
              {/* Free Delivery Meter */}
              <View style={styles.freeDeliveryBanner}>
                <View style={styles.meterHeader}>
                  <Text style={styles.meterIcon}>
                    {cartSubtotal >= freeDeliveryThreshold ? '🎉' : '🚚'}
                  </Text>
                  <Text style={styles.freeDeliveryText}>
                    {cartSubtotal >= freeDeliveryThreshold ? (
                      <Text>
                        You unlocked <Text style={styles.boldGreen}>FREE Delivery!</Text>
                      </Text>
                    ) : (
                      <Text>
                        Add <Text style={styles.boldGreen}>₹{amountToFreeDelivery}</Text> more for <Text style={styles.boldGreen}>FREE Delivery</Text>
                      </Text>
                    )}
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.round(progressRatio * 100)}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Items List */}
              <View style={styles.itemsSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    Cart Items ({cartList.length})
                  </Text>
                  <TouchableOpacity
                    onPress={handleContinueShopping}
                    activeOpacity={0.7}>
                    <Text style={styles.addMoreText}>+ Add More</Text>
                  </TouchableOpacity>
                </View>

                {cartList.map(item => (
                  <CartItemCard
                    key={item.product.id}
                    item={item}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onRemove={handleRemove}
                    onPressItem={handlePressItem}
                  />
                ))}
              </View>

              {/* Coupon Section */}
              <CouponSection
                appliedCoupon={appliedCoupon}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                subtotal={cartSubtotal}
              />

              {/* Bill Details */}
              <BillSummaryCard
                subtotal={cartSubtotal}
                deliveryFee={deliveryFee}
                appliedCoupon={appliedCoupon}
                grandTotal={grandTotal}
              />

              {/* Freshness & Quality Promise */}
              <View style={styles.guaranteeBox}>
                <Text style={styles.guaranteeEmoji}>🌱</Text>
                <View style={styles.guaranteeInfo}>
                  <Text style={styles.guaranteeTitle}>Freshness & Hygiene Guarantee</Text>
                  <Text style={styles.guaranteeDesc}>
                    Hand-picked fresh daily. Washed and sanitized packaging.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Fixed Bottom Checkout Bar */}
            <View style={styles.bottomBar}>
              <View style={styles.bottomPriceCol}>
                <Text style={styles.bottomTotalLabel}>Total Payable</Text>
                <Text style={styles.bottomTotalPrice}>₹{grandTotal}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                activeOpacity={0.8}
                onPress={handleProceedToCheckout}
                accessibilityLabel="Proceed to Checkout">
                <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  backArrow: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shopButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
  freeDeliveryBanner: {
    backgroundColor: '#F1F8E9',
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  meterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  freeDeliveryText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  boldGreen: {
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  itemsSection: {
    marginBottom: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  addMoreText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.xs,
  },
  guaranteeEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  guaranteeInfo: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  guaranteeDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  bottomTotalPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
});

export default CartScreen;