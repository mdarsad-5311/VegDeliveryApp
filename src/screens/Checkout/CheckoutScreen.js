import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';

export const CheckoutScreen = ({ navigation }) => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    appliedCoupon,
    selectedAddress,
    placeOrder,
  } = useAppContext();

  const cartList = Object.values(cart);
  const deliveryFee = cartSubtotal >= 199 || cartSubtotal === 0 ? 0 : 30;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, cartSubtotal + deliveryFee - couponDiscount);

  // Delivery Date & Slot Selection
  const [selectedDate, setSelectedDate] = useState('today'); // 'today' | 'tomorrow'
  const [selectedSlot, setSelectedSlot] = useState('instant'); // slot id
  const [showAllItems, setShowAllItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Order Placement Modal state
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  const deliveryDates = [
    { id: 'today', label: 'Today', subLabel: 'Earliest Available' },
    { id: 'tomorrow', label: 'Tomorrow', subLabel: 'Fresh Dawn Pick' },
  ];

  const slotsByDate = {
    today: [
      {
        id: 'instant',
        badge: 'FASTEST',
        title: '⚡ Instant Delivery',
        time: '20 - 30 mins',
        desc: 'Farm fresh harvest right to your doorstep',
      },
      {
        id: 'today_evening',
        badge: 'POPULAR',
        title: '🌅 Evening Slot',
        time: '6:00 PM - 8:00 PM',
        desc: 'Hand-picked for dinner cooking',
      },
    ],
    tomorrow: [
      {
        id: 'tomorrow_morning',
        badge: 'EARLIEST',
        title: '☀️ Morning Slot',
        time: '7:00 AM - 9:00 AM',
        desc: 'Fresh dawn harvest straight from farms',
      },
      {
        id: 'tomorrow_afternoon',
        badge: 'FLEXIBLE',
        title: '🌤️ Afternoon Slot',
        time: '1:00 PM - 3:00 PM',
        desc: 'Delivered before lunchtime cooking',
      },
      {
        id: 'tomorrow_evening',
        badge: 'EVENING',
        title: '🌅 Evening Slot',
        time: '6:00 PM - 8:00 PM',
        desc: 'Relaxed evening doorstep drop',
      },
    ],
  };

  const activeSlots = slotsByDate[selectedDate] || [];

  // Payment method selection
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const paymentMethods = [
    {
      id: 'cod',
      icon: '💵',
      title: 'Cash on Delivery (COD)',
      subtitle: 'Pay cash or scan QR upon delivery',
      recommended: true,
    },
    {
      id: 'upi',
      icon: '📱',
      title: 'UPI (GPay / PhonePe / Paytm)',
      subtitle: 'Instant & 100% contactless digital payment',
      recommended: false,
    },
    {
      id: 'card',
      icon: '💳',
      title: 'Credit / Debit Card',
      subtitle: 'Visa, MasterCard, RuPay (Placeholder)',
      recommended: false,
    },
    {
      id: 'netbanking',
      icon: '🏦',
      title: 'Net Banking & Wallets',
      subtitle: 'All major Indian banks supported (Placeholder)',
      recommended: false,
    },
  ];

  // Validation & Order Placement
  const handlePlaceOrder = () => {
    if (isSubmitting) return;

    // 1. Validate Cart
    if (cartCount === 0 || cartList.length === 0) {
      Alert.alert(
        'Empty Basket',
        'Your cart is empty. Please add fresh vegetables before checking out.',
        [{ text: 'OK' }],
      );
      return;
    }

    // 2. Validate Delivery Address
    if (!selectedAddress) {
      Alert.alert(
        'Address Required',
        'Please select or add a delivery address to proceed with your order.',
        [
          {
            text: 'Choose Address',
            onPress: () =>
              navigation.navigate('AddressList', { selectMode: true }),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }

    // 3. Validate Delivery Slot
    if (!selectedSlot) {
      Alert.alert(
        'Select Delivery Slot',
        'Please select a delivery date and time slot for your fresh vegetables.',
        [{ text: 'OK' }],
      );
      return;
    }

    // 4. Validate Payment Method
    if (!selectedPayment) {
      Alert.alert(
        'Select Payment Method',
        'Please choose your preferred payment method.',
        [{ text: 'OK' }],
      );
      return;
    }

    // Anti-rapid click lock
    setIsSubmitting(true);

    setTimeout(async () => {
      const activeSlotObj = activeSlots.find(s => s.id === selectedSlot);
      const activeDateObj = deliveryDates.find(d => d.id === selectedDate);
      const activePaymentObj = paymentMethods.find(
        p => p.id === selectedPayment,
      );

      const itemsListToSave = cartList.map(({ product, quantity, unit }) => ({
        id: product.id,
        productId: product.id,
        name: product.name,
        emoji: product.emoji || '🥬',
        price: product.price || 0,
        unit: unit || product.unit || '1 kg',
        quantity,
        subtotal: (product.price || 0) * quantity,
        accentColor: product.accentColor || '#E8F5E9',
      }));

      const orderData = {
        items: itemsListToSave,
        itemsCount: cartCount,
        subtotal: cartSubtotal,
        deliveryFee,
        discount: couponDiscount,
        coupon: appliedCoupon,
        grandTotal,
        date: activeDateObj?.label || 'Today',
        slot: activeSlotObj?.time || 'Instant (20-30 mins)',
        payment: activePaymentObj?.title || 'Cash on Delivery',
        address: selectedAddress,
      };

      const newOrder = await placeOrder(orderData);
      setPlacedOrderDetails(newOrder);
      setIsSubmitting(false);

      // Navigate directly to dedicated OrderConfirmationScreen
      navigation.navigate('OrderConfirmation', {
        orderId: newOrder.id,
        order: newOrder,
      });
    }, 500);
  };

  const handleFinishOrder = () => {
    setOrderPlaced(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleTrackOrderNotice = () => {
    Alert.alert(
      'Order Tracking',
      `Order ${placedOrderDetails?.orderId} is currently being packed with farm-fresh produce at our Baner fulfillment center! You will receive live delivery updates shortly.`,
      [{ text: 'Great!' }],
    );
  };

  // Visible items (first 3 by default, or all if expanded)
  const displayedItems = showAllItems ? cartList : cartList.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back">
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Checkout</Text>
            <Text style={styles.headerSubtitle}>
              {cartCount === 0
                ? 'No items'
                : `${cartCount} item${cartCount === 1 ? '' : 's'} • Total ₹${grandTotal}`}
            </Text>
          </View>
        </View>

        {cartCount === 0 && !orderPlaced ? (
          /* Empty Checkout State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>🧺</Text>
            </View>
            <Text style={styles.emptyTitle}>Your Basket is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven't added any fresh vegetables yet. Browse our farm catalog to place an order!
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
              <Text style={styles.browseBtnText}>Explore Vegetables →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Populated Checkout Flow */
          <>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              {/* Section 1: Delivery Address */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardIcon}>📍</Text>
                    <Text style={styles.cardTitle}>Delivery Address</Text>
                  </View>
                  <View style={styles.addressHeaderRight}>
                    {selectedAddress && (
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>
                          {selectedAddress.tag || selectedAddress.type?.toUpperCase() || 'HOME'}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.changeAddressBtn}
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation.navigate('AddressList', { selectMode: true })
                      }
                      accessibilityLabel="Change delivery address">
                      <Text style={styles.changeAddressBtnText}>
                        {selectedAddress ? 'Change' : '+ Add Address'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {selectedAddress ? (
                  <View style={styles.addressBody}>
                    <Text style={styles.addressRecipient}>
                      {selectedAddress.fullName || 'Recipient'}
                    </Text>
                    <Text style={styles.addressPhone}>
                      📞 {selectedAddress.phone || selectedAddress.mobile || '+91 98765 43210'}
                    </Text>
                    <Text style={styles.addressMain}>
                      {selectedAddress.fullAddress ||
                        selectedAddress.line1 ||
                        `${selectedAddress.houseNumber || ''}, ${selectedAddress.street || ''}`}
                    </Text>

                    <View style={styles.etaPill}>
                      <Text style={styles.etaText}>
                        ⚡ Estimated delivery in 20-30 mins
                      </Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.noAddressBox}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate('AddressList', { selectMode: true })
                    }>
                    <Text style={styles.noAddressIcon}>⚠️</Text>
                    <View style={styles.noAddressTextCol}>
                      <Text style={styles.noAddressTitle}>
                        No Delivery Address Selected
                      </Text>
                      <Text style={styles.noAddressSub}>
                        Tap here to select or add an address for delivery
                      </Text>
                    </View>
                    <Text style={styles.noAddressArrow}>›</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Section 2: Delivery Slot */}
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardIcon}>🕒</Text>
                  <Text style={styles.cardTitle}>Choose Delivery Slot</Text>
                </View>

                {/* Date Tabs */}
                <View style={styles.dateTabsRow}>
                  {deliveryDates.map(date => {
                    const isDateSelected = selectedDate === date.id;
                    return (
                      <TouchableOpacity
                        key={date.id}
                        style={[
                          styles.dateTab,
                          isDateSelected && styles.dateTabSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedDate(date.id);
                          // Select the first slot for that date automatically
                          const firstSlot = slotsByDate[date.id]?.[0]?.id;
                          if (firstSlot) setSelectedSlot(firstSlot);
                        }}>
                        <Text
                          style={[
                            styles.dateTabTitle,
                            isDateSelected && styles.dateTabTitleSelected,
                          ]}>
                          {date.label}
                        </Text>
                        <Text
                          style={[
                            styles.dateTabSub,
                            isDateSelected && styles.dateTabSubSelected,
                          ]}>
                          {date.subLabel}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Slots List */}
                <View style={styles.slotList}>
                  {activeSlots.map(slot => {
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <TouchableOpacity
                        key={slot.id}
                        style={[
                          styles.slotCard,
                          isSelected && styles.slotCardSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setSelectedSlot(slot.id)}
                        accessibilityLabel={slot.title}>
                        <View style={styles.slotRadio}>
                          <View
                            style={[
                              styles.radioOuter,
                              isSelected && styles.radioOuterSelected,
                            ]}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                        </View>
                        <View style={styles.slotInfo}>
                          <View style={styles.slotHeaderRow}>
                            <Text style={styles.slotTitle}>{slot.title}</Text>
                            <View style={styles.slotBadge}>
                              <Text style={styles.slotBadgeText}>
                                {slot.badge}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.slotTime}>{slot.time}</Text>
                          <Text style={styles.slotDesc}>{slot.desc}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Section 3: Payment Method UI */}
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardIcon}>💳</Text>
                  <Text style={styles.cardTitle}>Payment Method</Text>
                </View>

                <View style={styles.paymentList}>
                  {paymentMethods.map(method => {
                    const isSelected = selectedPayment === method.id;
                    return (
                      <TouchableOpacity
                        key={method.id}
                        style={[
                          styles.paymentOption,
                          isSelected && styles.paymentOptionSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setSelectedPayment(method.id)}
                        accessibilityLabel={method.title}>
                        <Text style={styles.paymentIcon}>{method.icon}</Text>
                        <View style={styles.paymentInfo}>
                          <View style={styles.paymentTitleRow}>
                            <Text style={styles.paymentTitle}>
                              {method.title}
                            </Text>
                            {method.recommended && (
                              <View style={styles.recBadge}>
                                <Text style={styles.recBadgeText}>RECOMMENDED</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.paymentSubtitle}>
                            {method.subtitle}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.radioOuter,
                            isSelected && styles.radioOuterSelected,
                          ]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Section 4: Order Items Review */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardIcon}>🧺</Text>
                    <Text style={styles.cardTitle}>
                      Order Items ({cartList.length})
                    </Text>
                  </View>
                  {cartList.length > 3 && (
                    <TouchableOpacity
                      onPress={() => setShowAllItems(!showAllItems)}
                      activeOpacity={0.7}>
                      <Text style={styles.toggleItemsText}>
                        {showAllItems ? 'Show Less' : `+${cartList.length - 3} more`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.recapList}>
                  {displayedItems.map(({ product, quantity, unit }) => {
                    const itemUnit = unit || product.unit || '1 kg';
                    const itemSubtotal = (product.price || 0) * quantity;
                    return (
                      <View key={product.id} style={styles.recapItem}>
                        <View
                          style={[
                            styles.recapVisual,
                            { backgroundColor: product.accentColor || '#E8F5E9' },
                          ]}>
                          <Text style={styles.recapEmoji}>{product.emoji}</Text>
                        </View>
                        <View style={styles.recapDetails}>
                          <Text style={styles.recapName} numberOfLines={1}>
                            {product.name}
                          </Text>
                          <Text style={styles.recapUnit}>
                            {itemUnit} • ₹{product.price} × {quantity}
                          </Text>
                        </View>
                        <Text style={styles.recapPrice}>₹{itemSubtotal}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Section 5: Bill Details & Payment Breakdown */}
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardIcon}>🧾</Text>
                  <Text style={styles.cardTitle}>Bill Summary</Text>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Item Total (Subtotal)</Text>
                  <Text style={styles.breakdownValue}>₹{cartSubtotal}</Text>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Delivery Partner Fee</Text>
                  <Text
                    style={[
                      styles.breakdownValue,
                      deliveryFee === 0 && styles.freeText,
                    ]}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Eco-Friendly Packaging</Text>
                  <Text style={styles.freeText}>FREE</Text>
                </View>

                {appliedCoupon && couponDiscount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, styles.discountText]}>
                      Promo Discount ({appliedCoupon.code})
                    </Text>
                    <Text style={[styles.breakdownValue, styles.discountText]}>
                      −₹{couponDiscount}
                    </Text>
                  </View>
                )}

                <View style={styles.divider} />

                <View style={styles.grandTotalRow}>
                  <View>
                    <Text style={styles.grandTotalLabel}>Total Payable</Text>
                    <Text style={styles.taxInclusiveText}>
                      Inclusive of all taxes
                    </Text>
                  </View>
                  <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
                </View>
              </View>

              {/* Freshness & Hygiene Guarantee */}
              <View style={styles.guaranteeCard}>
                <Text style={styles.guaranteeIcon}>🛡️</Text>
                <View style={styles.guaranteeTextCol}>
                  <Text style={styles.guaranteeTitle}>Freshness Guarantee</Text>
                  <Text style={styles.guaranteeSub}>
                    100% farm-fresh guarantee. Easy refunds if not satisfied at delivery.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Fixed Bottom Checkout Action Bar */}
            <View style={styles.bottomBar}>
              <View style={styles.priceContainer}>
                <Text style={styles.bottomTotalLabel}>Total Payable</Text>
                <Text style={styles.bottomTotalPrice}>₹{grandTotal}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.placeOrderBtn,
                  isSubmitting && styles.placeOrderBtnDisabled,
                ]}
                activeOpacity={0.8}
                disabled={isSubmitting}
                onPress={handlePlaceOrder}
                accessibilityLabel="Place Order">
                {isSubmitting ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={colors.surface} />
                    <Text style={styles.placeOrderBtnText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.placeOrderBtnText}>Place Order →</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Order Placement Success Modal */}
        <Modal
          visible={orderPlaced}
          transparent
          animationType="fade"
          onRequestClose={handleFinishOrder}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIconCircle}>
                <Text style={styles.successIconText}>🎉</Text>
              </View>

              <Text style={styles.modalTitle}>Order Confirmed!</Text>
              <Text style={styles.modalSub}>
                Your farm-fresh vegetables have been booked and are being packed with care.
              </Text>

              <View style={styles.orderIdBox}>
                <Text style={styles.orderIdLabel}>Order ID</Text>
                <Text style={styles.orderIdValue}>
                  {placedOrderDetails?.orderId || '#FV-78241'}
                </Text>
              </View>

              <View style={styles.orderSummaryBox}>
                <View style={styles.summaryItemRow}>
                  <Text style={styles.summaryItemLabel}>Delivery Slot</Text>
                  <Text style={styles.summaryItemVal}>
                    {placedOrderDetails?.date} • {placedOrderDetails?.slot}
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={styles.summaryItemLabel}>Payment Mode</Text>
                  <Text style={styles.summaryItemVal}>
                    {placedOrderDetails?.payment}
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={styles.summaryItemLabel}>Delivering To</Text>
                  <Text
                    style={styles.summaryItemVal}
                    numberOfLines={1}>
                    {placedOrderDetails?.address?.shortAddress ||
                      placedOrderDetails?.address?.line1 ||
                      'Home'}
                  </Text>
                </View>
                <View style={styles.summaryItemRow}>
                  <Text style={styles.summaryItemLabel}>Amount Payable</Text>
                  <Text style={[styles.summaryItemVal, styles.boldAmount]}>
                    ₹{placedOrderDetails?.grandTotal}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.trackOrderBtn}
                activeOpacity={0.8}
                onPress={handleTrackOrderNotice}
                accessibilityLabel="Track Order">
                <Text style={styles.trackOrderBtnText}>Track Order 🚚</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtn}
                activeOpacity={0.8}
                onPress={handleFinishOrder}
                accessibilityLabel="Continue Shopping">
                <Text style={styles.modalBtnText}>Continue Shopping →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  addressHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tagBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  changeAddressBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.sm,
  },
  changeAddressBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  addressBody: {
    marginTop: 2,
  },
  addressRecipient: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  addressPhone: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  addressMain: {
    fontSize: typography.sizes.xs + 1,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  etaPill: {
    marginTop: spacing.sm,
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  etaText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: typography.weights.semiBold,
  },
  noAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginTop: 4,
  },
  noAddressIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  noAddressTextCol: {
    flex: 1,
  },
  noAddressTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: '#E65100',
  },
  noAddressSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  noAddressArrow: {
    fontSize: 20,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  dateTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dateTab: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  dateTabSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F1F8E9',
  },
  dateTabTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  dateTabTitleSelected: {
    color: colors.primaryDark,
  },
  dateTabSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  dateTabSubSelected: {
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
  },
  slotList: {
    marginTop: 2,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: spacing.xs + 2,
    backgroundColor: '#FAFAFA',
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F1F8E9',
  },
  slotRadio: {
    marginRight: spacing.sm,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  slotInfo: {
    flex: 1,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  slotBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  slotBadgeText: {
    fontSize: 9,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  slotTime: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.weights.semiBold,
    marginTop: 1,
  },
  slotDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  paymentList: {
    marginTop: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: spacing.xs + 2,
    backgroundColor: '#FAFAFA',
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F1F8E9',
  },
  paymentIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  recBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  recBadgeText: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  paymentSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  toggleItemsText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  recapList: {
    marginTop: 2,
  },
  recapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recapVisual: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  recapEmoji: {
    fontSize: 20,
  },
  recapDetails: {
    flex: 1,
  },
  recapName: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  recapUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  recapPrice: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: typography.sizes.xs + 1,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  freeText: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xs + 1,
  },
  discountText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  taxInclusiveText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  grandTotalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  guaranteeIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  guaranteeSub: {
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
  priceContainer: {
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
  placeOrderBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 140,
  },
  placeOrderBtnDisabled: {
    opacity: 0.7,
  },
  placeOrderBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 44,
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
  browseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  browseBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  successIconText: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: typography.sizes.xs + 1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  orderIdBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  orderIdLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  orderIdValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    letterSpacing: 1,
    marginTop: 2,
  },
  orderSummaryBox: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryItemLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  summaryItemVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  boldAmount: {
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  trackOrderBtn: {
    width: '100%',
    backgroundColor: '#F1F8E9',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  trackOrderBtnText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  modalBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  modalBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
});

export default CheckoutScreen;