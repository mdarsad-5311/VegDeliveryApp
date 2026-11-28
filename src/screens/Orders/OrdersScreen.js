import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { CancelOrderModal } from '../../components/orders/CancelOrderModal';

export const OrdersScreen = ({ navigation }) => {
  const {
    orders,
    isOrdersLoading,
    fetchOrders,
    cancelOrder,
    reorder,
    isAuthenticated,
  } = useAppContext();
  const [selectedTab, setSelectedTab] = useState('active'); // 'active' | 'completed' | 'cancelled'
  const [cancelModalOrderId, setCancelModalOrderId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch orders from backend on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  }, [fetchOrders]);

  // Categorize orders
  const activeOrders = useMemo(
    () =>
      orders.filter(
        o =>
          o.status !== 'Delivered' &&
          o.status !== 'Cancelled' &&
          o.order_status !== 'delivered' &&
          o.order_status !== 'cancelled',
      ),
    [orders],
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        o => o.status === 'Delivered' || o.order_status === 'delivered',
      ),
    [orders],
  );

  const cancelledOrders = useMemo(
    () =>
      orders.filter(
        o => o.status === 'Cancelled' || o.order_status === 'cancelled',
      ),
    [orders],
  );

  const displayedOrders = useMemo(() => {
    switch (selectedTab) {
      case 'active':
        return activeOrders;
      case 'completed':
        return completedOrders;
      case 'cancelled':
        return cancelledOrders;
      default:
        return activeOrders;
    }
  }, [selectedTab, activeOrders, completedOrders, cancelledOrders]);

  const tabs = [
    { id: 'active', label: 'Active', count: activeOrders.length },
    { id: 'completed', label: 'Completed', count: completedOrders.length },
    { id: 'cancelled', label: 'Cancelled', count: cancelledOrders.length },
  ];

  const handleOpenCancel = order => {
    const rawStatus = (order.order_status || order.status || '').toLowerCase();
    const isEligible =
      rawStatus === 'pending' ||
      rawStatus === 'confirmed' ||
      rawStatus === 'order placed' ||
      rawStatus === 'order confirmed';

    if (!isEligible) {
      Alert.alert(
        'Cancellation Unavailable',
        'Orders that are packed or dispatched for delivery cannot be cancelled.',
        [{ text: 'OK' }],
      );
      return;
    }
    setCancelModalOrderId(order.id);
  };

  const handleConfirmCancel = async reason => {
    const id = cancelModalOrderId;
    setCancelModalOrderId(null);
    if (!id) return;

    const res = await cancelOrder(id, reason);
    if (res.success) {
      Alert.alert(
        'Order Cancelled',
        `Order ${id} has been moved to Cancelled orders.`,
        [{ text: 'OK' }],
      );
    } else {
      Alert.alert('Error', res.message || 'Unable to cancel order.');
    }
  };

  const handleReorder = orderId => {
    const res = reorder(orderId);
    if (res.success) {
      Alert.alert(
        'Added to Basket',
        `${res.message}\n\nGo to Cart now to checkout?`,
        [
          { text: 'Keep Browsing', style: 'cancel' },
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
          },
        ],
      );
    } else {
      Alert.alert('Reorder', res.message || 'Unable to reorder items.');
    }
  };

  const getStatusBadgeStyle = status => {
    if (status === 'Delivered') {
      return { bg: '#E8F5E9', text: colors.primaryDark };
    }
    if (status === 'Cancelled') {
      return { bg: '#FFEBEE', text: colors.error };
    }
    if (status === 'Out for Delivery') {
      return { bg: '#FFF3E0', text: '#E65100' };
    }
    return { bg: '#E3F2FD', text: '#1565C0' };
  };

  const renderOrderItem = ({ item }) => {
    const badgeStyle = getStatusBadgeStyle(item.status);
    const itemsPreview =
      item.items && item.items.length > 0
        ? item.items
            .slice(0, 2)
            .map(i => `${i.emoji || '🥬'} ${i.name}`)
            .join(', ') + (item.items.length > 2 ? ` +${item.items.length - 2} more` : '')
        : `${item.itemsCount || 0} items`;

    return (
      <View style={styles.orderCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.statusText, { color: badgeStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <Text style={styles.itemsText} numberOfLines={2}>
            {itemsPreview}
          </Text>
          {item.slot ? (
            <Text style={styles.slotText}>🕒 {item.slot}</Text>
          ) : null}
          {item.address?.shortAddress ? (
            <Text style={styles.addressText}>
              📍 Delivering to: {item.address.shortAddress}
            </Text>
          ) : null}
          {item.cancelReason ? (
            <Text style={styles.cancelReasonText}>
              Reason: {item.cancelReason}
            </Text>
          ) : null}
        </View>

        {/* Card Footer with Price and Actions */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalVal}>₹{item.grandTotal}</Text>
          </View>

          <View style={styles.actionsRow}>
            {item.status !== 'Delivered' && item.status !== 'Cancelled' ? (
              <>
                <TouchableOpacity
                  style={styles.cancelActionBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Cancel Order"
                  onPress={() => handleOpenCancel(item)}>
                  <Text style={styles.cancelActionText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.trackActionBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('OrderTracking', {
                      orderId: item.id,
                      order: item,
                    })
                  }>
                  <Text style={styles.trackActionText}>Track 🚚</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.reorderActionBtn}
                activeOpacity={0.8}
                onPress={() => handleReorder(item.id)}>
                <Text style={styles.reorderActionText}>🔄 Reorder</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.detailsActionBtn}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('OrderDetails', {
                  orderId: item.id,
                  order: item,
                })
              }>
              <Text style={styles.detailsActionText}>Details →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isOrdersLoading && orders.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptySubtitle, { marginTop: spacing.md }]}>
            Loading your orders...
          </Text>
        </View>
      );
    }

    const isAct = selectedTab === 'active';
    const isComp = selectedTab === 'completed';
    const icon = isAct ? '📦' : isComp ? '🥬' : '🚫';
    const title = isAct
      ? 'No Active Orders'
      : isComp
      ? 'No Completed Orders'
      : 'No Cancelled Orders';
    const subtitle = isAct
      ? 'You have no orders currently in transit. Order farm-fresh vegetables now!'
      : isComp
      ? 'When you receive deliveries, your fulfilled orders will show here.'
      : 'You have not cancelled any fresh produce orders.';

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Text style={styles.emptyIconText}>{icon}</Text>
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
        {isAct && (
          <TouchableOpacity
            style={styles.browseBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
            <Text style={styles.browseBtnText}>Explore Fresh Vegetables →</Text>
          </TouchableOpacity>
        )}
      </View>
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
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            }}
            accessibilityLabel="Go back">
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.headerSubtitle}>
              {orders.length} total harvest orders
            </Text>
          </View>
        </View>

        {/* 3 Tabs: Active, Completed, Cancelled */}
        <View style={styles.tabBar}>
          {tabs.map(tab => {
            const isSelected = selectedTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, isSelected && styles.tabItemSelected]}
                activeOpacity={0.8}
                onPress={() => setSelectedTab(tab.id)}>
                <Text
                  style={[
                    styles.tabLabel,
                    isSelected && styles.tabLabelSelected,
                  ]}>
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.tabCountBadge,
                    isSelected && styles.tabCountBadgeSelected,
                  ]}>
                  <Text
                    style={[
                      styles.tabCountText,
                      isSelected && styles.tabCountTextSelected,
                    ]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Orders List */}
        <FlatList
          data={displayedOrders}
          keyExtractor={item => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />

        {/* Cancel Modal */}
        <CancelOrderModal
          visible={!!cancelModalOrderId}
          orderId={cancelModalOrderId || ''}
          onClose={() => setCancelModalOrderId(null)}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.md,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  tabItemSelected: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  tabLabelSelected: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  tabCountBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountBadgeSelected: {
    backgroundColor: '#E8F5E9',
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
  },
  tabCountTextSelected: {
    color: colors.primaryDark,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  orderCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
  },
  orderId: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  cardBody: {
    paddingVertical: 10,
  },
  itemsText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    lineHeight: 18,
    fontWeight: typography.weights.medium,
  },
  slotText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addressText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  cancelReasonText: {
    fontSize: 11,
    color: colors.error,
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  totalVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: '#FFEBEE',
  },
  cancelActionText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.error,
  },
  trackActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  trackActionText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  reorderActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: '#E8F5E9',
  },
  reorderActionText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  detailsActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  detailsActionText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyIconText: {
    fontSize: 30,
  },
  emptyTitle: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  browseBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
});

export default OrdersScreen;
