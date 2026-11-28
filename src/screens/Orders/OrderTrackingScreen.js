import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';
import { OrderTimeline } from '../../components/orders/OrderTimeline';

export const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId, order } = route.params || {};
  const { getOrderById, fetchOrderDetails, isAuthenticated } = useAppContext();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const displayOrderId = orderId || order?.id || '#FV-84912';

  // Fetch latest tracking status from backend on mount
  useEffect(() => {
    if (isAuthenticated && displayOrderId) {
      fetchOrderDetails(displayOrderId);
    }
  }, [isAuthenticated, displayOrderId, fetchOrderDetails]);

  const onRefresh = useCallback(async () => {
    if (displayOrderId) {
      setIsRefreshing(true);
      await fetchOrderDetails(displayOrderId);
      setIsRefreshing(false);
    }
  }, [displayOrderId, fetchOrderDetails]);

  const contextOrder = displayOrderId ? getOrderById(displayOrderId) : null;
  const activeOrder = contextOrder || order || {};

  const status = activeOrder.status || 'Order Placed';
  const rawStatus = (activeOrder.order_status || status).toLowerCase();
  const isCancelled = status === 'Cancelled' || rawStatus === 'cancelled';
  const isDelivered = status === 'Delivered' || rawStatus === 'delivered';
  const stage =
    activeOrder.stage !== undefined
      ? activeOrder.stage
      : isDelivered
      ? 5
      : isCancelled
      ? 0
      : 2;

  const partner = activeOrder.deliveryPartner || {
    name: 'Ramesh Kumar',
    phone: '+91 98220 12345',
    rating: '4.9',
    deliveries: '1,240+',
    vehicle: 'Electric Cargo Scooter (MH-12-VG-4521)',
    avatar: '🛵',
  };
  const address = activeOrder.address;
  const items = activeOrder.items || [];
  const grandTotal = activeOrder.grandTotal || 0;
  const timeline = activeOrder.timeline || [];

  const handleCallPartner = () => {
    Alert.alert(
      'Calling Delivery Partner',
      `Connecting to ${partner.name} (${partner.phone})...\n\nPlease let the driver know if you have specific gate or door delivery instructions.`,
      [{ text: 'End Call' }],
    );
  };

  const handleSupportHelp = () => {
    Alert.alert(
      'FreshVeg Support',
      `Need help with Order ${displayOrderId}? Our customer care team is available 24/7 on WhatsApp or toll-free at 1800-FRESH-VEG.`,
      [{ text: 'Close' }],
    );
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
            <Text style={styles.headerTitle}>Track Delivery</Text>
            <Text style={styles.headerSubtitle}>Order {displayOrderId}</Text>
          </View>
          <TouchableOpacity
            style={styles.helpBtn}
            activeOpacity={0.7}
            onPress={handleSupportHelp}>
            <Text style={styles.helpText}>Help?</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }>
          {/* Status & ETA Card */}
          <View
            style={[
              styles.statusCard,
              isCancelled ? styles.statusCardCancelled : styles.statusCardActive,
            ]}>
            <View style={styles.statusHeaderRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>
                  {status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.etaBadgeText}>
                {isCancelled
                  ? 'Order Cancelled'
                  : activeOrder?.estimatedDelivery || '20 - 30 mins'}
              </Text>
            </View>

            <Text style={styles.statusHeading}>
              {isCancelled
                ? 'This order has been cancelled'
                : status === 'Delivered'
                ? 'Delivered to your doorstep! 🎉'
                : status === 'Out for Delivery'
                ? 'Your harvest is on its way! 🛵'
                : status === 'Preparing Order'
                ? 'Harvested & freshly packed in Baner 🧺'
                : 'Order received and being confirmed 📝'}
            </Text>

            <Text style={styles.statusSub}>
              {isCancelled
                ? `Reason: ${activeOrder?.cancelReason || 'Cancelled by customer'}`
                : status === 'Delivered'
                ? 'Hope you enjoy your fresh farm vegetables! Rate your experience below.'
                : 'Hand-picked from verified partner farms, chilled, and handled with hygiene.'}
            </Text>
          </View>

          {/* 5-Stage Live Timeline */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Live Delivery Progress</Text>
            <OrderTimeline
              timeline={timeline}
              currentStage={stage}
              isCancelled={isCancelled}
              cancelReason={activeOrder?.cancelReason}
            />
          </View>

          {/* Delivery Partner Card (only for non-cancelled orders) */}
          {!isCancelled && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Delivery Partner</Text>
              <View style={styles.partnerRow}>
                <View style={styles.partnerAvatar}>
                  <Text style={styles.partnerAvatarText}>{partner.avatar}</Text>
                </View>

                <View style={styles.partnerInfo}>
                  <View style={styles.partnerNameRow}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingStar}>★</Text>
                      <Text style={styles.ratingText}>{partner.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.vehicleText}>{partner.vehicle}</Text>
                  <Text style={styles.deliveriesCount}>
                    {partner.deliveries} deliveries completed
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.callBtn}
                  activeOpacity={0.8}
                  onPress={handleCallPartner}
                  accessibilityLabel="Call Delivery Partner">
                  <Text style={styles.callIcon}>📞</Text>
                  <Text style={styles.callText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Destination Delivery Address */}
          <View style={styles.card}>
            <View style={styles.addressTitleRow}>
              <Text style={styles.cardIcon}>📍</Text>
              <Text style={styles.cardTitle}>Delivery Destination</Text>
            </View>

            <View style={styles.addressBody}>
              <Text style={styles.addressRecipient}>
                {address?.fullName || 'Recipient'} • {address?.phone || address?.mobile || '+91 98765 43210'}
              </Text>
              <Text style={styles.addressText}>
                {address?.fullAddress || address?.line1 || 'Baner Road, Pune'}
              </Text>
              <View style={styles.contactlessRow}>
                <Text style={styles.contactlessIcon}>🍃</Text>
                <Text style={styles.contactlessText}>
                  Contactless doorstep delivery requested
                </Text>
              </View>
            </View>
          </View>

          {/* Order Summary Recap */}
          <View style={styles.card}>
            <View style={styles.orderSummaryHeader}>
              <Text style={styles.cardTitle}>
                Order Items ({items.length || activeOrder?.itemsCount || 0})
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('OrderDetails', {
                    orderId: displayOrderId,
                    order: activeOrder,
                  })
                }>
                <Text style={styles.viewDetailsLink}>View Full Details →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemsSummaryList}>
              {items.slice(0, 3).map((item, idx) => (
                <View key={item.id || idx} style={styles.miniItemRow}>
                  <Text style={styles.miniItemEmoji}>{item.emoji || '🥬'}</Text>
                  <Text style={styles.miniItemName} numberOfLines={1}>
                    {item.name} ({item.unit}) × {item.quantity}
                  </Text>
                  <Text style={styles.miniItemPrice}>
                    ₹{item.subtotal || item.price * item.quantity}
                  </Text>
                </View>
              ))}
              {items.length > 3 && (
                <Text style={styles.moreItemsText}>
                  +{items.length - 3} more items in this harvest box
                </Text>
              )}
            </View>

            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>₹{grandTotal}</Text>
            </View>
          </View>
        </ScrollView>
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
  helpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F0F0F0',
  },
  helpText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statusCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
  },
  statusCardActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  statusCardCancelled: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusPill: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.surface,
    letterSpacing: 0.5,
  },
  etaBadgeText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statusHeading: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  statusSub: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
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
  cardTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  partnerAvatarText: {
    fontSize: 24,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partnerName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  ratingStar: {
    fontSize: 10,
    color: '#F57F17',
    marginRight: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#F57F17',
  },
  vehicleText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deliveriesCount: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  callIcon: {
    fontSize: 12,
  },
  callText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  addressBody: {
    marginTop: 2,
  },
  addressRecipient: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  contactlessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  contactlessIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  contactlessText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  viewDetailsLink: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  itemsSummaryList: {
    marginTop: 4,
  },
  miniItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  miniItemEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  miniItemName: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
  },
  miniItemPrice: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  moreItemsText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
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
  },
  totalLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
});

export default OrderTrackingScreen;
