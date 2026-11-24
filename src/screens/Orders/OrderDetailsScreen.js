import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';
import { CancelOrderModal } from '../../components/orders/CancelOrderModal';
import { OrderTimeline } from '../../components/orders/OrderTimeline';

export const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId, order } = route.params || {};
  const { getOrderById, cancelOrder, reorder } = useAppContext();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // Fetch reactive order from context if available
  const contextOrder = orderId ? getOrderById(orderId) : null;
  const activeOrder = contextOrder || order || {};

  const displayOrderId = activeOrder.id || orderId || '#FV-98421';
  const status = activeOrder.status || 'Order Placed';
  const isDelivered = status === 'Delivered';
  const isCancelled = status === 'Cancelled';
  const isActive = !isDelivered && !isCancelled;

  const items = activeOrder.items || [];
  const address = activeOrder.address;
  const grandTotal = activeOrder.grandTotal || 0;
  const subtotal = activeOrder.subtotal || grandTotal;
  const deliveryFee = activeOrder.deliveryFee || 0;
  const discount = activeOrder.discount || 0;
  const paymentMethod = activeOrder.paymentMethod || 'Cash on Delivery (COD)';
  const paymentStatus = activeOrder.paymentStatus || 'Pending';
  const timeline = activeOrder.timeline || [];
  const stage = activeOrder.stage || (isDelivered ? 5 : isCancelled ? 0 : 2);

  const handleOpenCancel = () => {
    if (isDelivered) {
      Alert.alert(
        'Cannot Cancel',
        'This order has already been delivered and cannot be cancelled.',
        [{ text: 'OK' }],
      );
      return;
    }
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async reason => {
    setCancelModalVisible(false);
    const result = await cancelOrder(displayOrderId, reason);
    if (result.success) {
      Alert.alert(
        'Order Cancelled',
        `Order ${displayOrderId} has been successfully cancelled.`,
        [{ text: 'OK' }],
      );
    } else {
      Alert.alert('Error', result.message || 'Failed to cancel order.');
    }
  };

  const handleReorder = () => {
    const res = reorder(displayOrderId);
    if (res.success) {
      Alert.alert(
        'Basket Updated',
        `${res.message}\n\nProceed to Cart to review and checkout?`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Go to Cart',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
          },
        ],
      );
    } else {
      Alert.alert('Reorder', res.message || 'Unable to reorder items.');
    }
  };

  const handleTrackDelivery = () => {
    navigation.navigate('OrderTracking', {
      orderId: displayOrderId,
      order: activeOrder,
    });
  };

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
            <Text style={styles.headerTitle}>Order Details</Text>
            <Text style={styles.headerSubtitle}>{displayOrderId}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Status Ribbon */}
          <View
            style={[
              styles.statusBanner,
              isCancelled
                ? styles.statusBannerCancelled
                : isDelivered
                ? styles.statusBannerDelivered
                : styles.statusBannerActive,
            ]}>
            <View style={styles.statusBannerLeft}>
              <Text style={styles.statusBannerIcon}>
                {isCancelled ? '✕' : isDelivered ? '✓' : '⚡'}
              </Text>
              <View>
                <Text style={styles.statusBannerTitle}>{status}</Text>
                <Text style={styles.statusBannerSub}>
                  {isCancelled
                    ? `Reason: ${activeOrder.cancelReason || 'Cancelled'}`
                    : isDelivered
                    ? 'Delivered to your doorstep'
                    : `Est. ${activeOrder.estimatedDelivery || '20-30 mins'}`}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDateText}>{activeOrder.date}</Text>
          </View>

          {/* Quick Action Pills if Active */}
          {isActive && (
            <View style={styles.quickActionRow}>
              <TouchableOpacity
                style={styles.trackPillBtn}
                activeOpacity={0.8}
                onPress={handleTrackDelivery}>
                <Text style={styles.trackPillIcon}>🚚</Text>
                <Text style={styles.trackPillText}>Track Live Delivery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelPillBtn}
                activeOpacity={0.8}
                onPress={handleOpenCancel}>
                <Text style={styles.cancelPillText}>Cancel Order</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Itemized Vegetables List */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Harvest Items ({items.length})
            </Text>

            <View style={styles.itemsList}>
              {items.map((item, idx) => (
                <View key={item.id || idx} style={styles.itemRow}>
                  <View
                    style={[
                      styles.itemVisual,
                      { backgroundColor: item.accentColor || '#E8F5E9' },
                    ]}>
                    <Text style={styles.itemEmoji}>{item.emoji || '🥬'}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemUnit}>
                      {item.unit} • ₹{item.price} each
                    </Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                    <Text style={styles.itemSubtotal}>
                      ₹{item.subtotal || item.price * item.quantity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Delivery Address */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardIcon}>📍</Text>
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>

            <Text style={styles.recipientName}>
              {address?.fullName || 'Kiran Kumar'}
            </Text>
            <Text style={styles.recipientPhone}>
              📞 {address?.phone || address?.mobile || '+91 98765 43210'}
            </Text>
            <Text style={styles.addressLine}>
              {address?.fullAddress ||
                address?.line1 ||
                'Flat 402, Green Meadows, Baner Road, Pune'}
            </Text>
            {activeOrder.slot && (
              <View style={styles.slotPill}>
                <Text style={styles.slotPillText}>
                  Slot: {activeOrder.slot}
                </Text>
              </View>
            )}
          </View>

          {/* Payment & Billing Breakdown */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardIcon}>🧾</Text>
              <Text style={styles.cardTitle}>Payment & Bill Details</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Payment Method</Text>
              <Text style={styles.billVal}>{paymentMethod}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Payment Status</Text>
              <View
                style={[
                  styles.paymentStatusBadge,
                  paymentStatus === 'Paid'
                    ? styles.badgePaid
                    : paymentStatus === 'Cancelled'
                    ? styles.badgeCancelled
                    : styles.badgePending,
                ]}>
                <Text
                  style={[
                    styles.paymentStatusText,
                    paymentStatus === 'Paid'
                      ? styles.textPaid
                      : paymentStatus === 'Cancelled'
                      ? styles.textCancelled
                      : styles.textPending,
                  ]}>
                  {paymentStatus}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Subtotal</Text>
              <Text style={styles.billVal}>₹{subtotal}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text
                style={[
                  styles.billVal,
                  deliveryFee === 0 && styles.freeText,
                ]}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </Text>
            </View>

            {discount > 0 && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, styles.discountText]}>
                  Coupon Savings
                </Text>
                <Text style={[styles.billVal, styles.discountText]}>
                  −₹{discount}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalVal}>₹{grandTotal}</Text>
            </View>
          </View>

          {/* Mini Status Timeline Preview */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardIcon}>🕒</Text>
              <Text style={styles.cardTitle}>Status History</Text>
            </View>
            <OrderTimeline
              timeline={timeline}
              currentStage={stage}
              isCancelled={isCancelled}
              cancelReason={activeOrder.cancelReason}
            />
          </View>

          {/* Action Bar at bottom */}
          <View style={styles.bottomActions}>
            {isActive ? (
              <TouchableOpacity
                style={styles.trackFullBtn}
                activeOpacity={0.8}
                onPress={handleTrackDelivery}>
                <Text style={styles.trackFullBtnText}>
                  View Live Map & Partner →
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.reorderBtn}
                activeOpacity={0.8}
                onPress={handleReorder}>
                <Text style={styles.reorderBtnText}>
                  🔄 Reorder All Vegetables
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Cancel Modal */}
        <CancelOrderModal
          visible={cancelModalVisible}
          orderId={displayOrderId}
          onClose={() => setCancelModalVisible(false)}
          onConfirmCancel={handleConfirmCancel}
        />
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
    paddingBottom: spacing.xxl,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  statusBannerActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  statusBannerDelivered: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  statusBannerCancelled: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  statusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusBannerIcon: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  statusBannerTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statusBannerSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderDateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  trackPillBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  trackPillIcon: {
    fontSize: 14,
  },
  trackPillText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  cancelPillBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  cancelPillText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.error,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    marginBottom: spacing.xs,
  },
  itemsList: {
    marginTop: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemVisual: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  itemUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 11,
    color: colors.textMuted,
  },
  itemSubtotal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  recipientName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  recipientPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addressLine: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  slotPill: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  slotPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  billLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  billVal: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  freeText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  discountText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgePaid: {
    backgroundColor: '#E8F5E9',
  },
  badgePending: {
    backgroundColor: '#FFF3E0',
  },
  badgeCancelled: {
    backgroundColor: '#FFEBEE',
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  textPaid: {
    color: colors.primaryDark,
  },
  textPending: {
    color: '#E65100',
  },
  textCancelled: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  grandTotalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  grandTotalVal: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  bottomActions: {
    marginTop: spacing.sm,
  },
  trackFullBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackFullBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  reorderBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
});

export default OrderDetailsScreen;
