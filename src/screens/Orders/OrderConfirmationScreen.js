import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';

export const OrderConfirmationScreen = ({ route, navigation }) => {
  const { order, orderId } = route.params || {};
  const { getOrderById } = useAppContext();

  // If order is passed directly, use it, or fetch from context
  const activeOrder = order || (orderId ? getOrderById(orderId) : null);

  const displayOrderId = activeOrder?.id || orderId || '#FV-98421';
  const displayTotal = activeOrder?.grandTotal || 0;
  const items = activeOrder?.items || [];
  const address = activeOrder?.address;
  const deliverySlot = activeOrder?.slot || 'Instant Delivery (20-30 mins)';
  const paymentMethod = activeOrder?.paymentMethod || 'Cash on Delivery (COD)';

  const handleTrackOrder = () => {
    navigation.navigate('OrderTracking', {
      orderId: displayOrderId,
      order: activeOrder,
    });
  };

  const handleViewOrders = () => {
    navigation.navigate('Orders');
  };

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Success Banner Card */}
          <View style={styles.celebrationCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.partyIcon}>🎉</Text>
            </View>
            <Text style={styles.title}>Order Confirmed!</Text>
            <Text style={styles.subtitle}>
              Thank you for shopping fresh. Your organic veggies have been booked
              and sent to our packing station.
            </Text>

            <View style={styles.orderIdPill}>
              <Text style={styles.orderIdLabel}>ORDER ID</Text>
              <Text style={styles.orderIdValue}>{displayOrderId}</Text>
            </View>
          </View>

          {/* Delivery ETA Highlight */}
          <View style={styles.etaCard}>
            <Text style={styles.etaIcon}>⚡</Text>
            <View style={styles.etaTextCol}>
              <Text style={styles.etaTitle}>Estimated Delivery</Text>
              <Text style={styles.etaTime}>{deliverySlot}</Text>
              <Text style={styles.etaSub}>
                Farm-fresh produce harvested and packed with 100% hygiene.
              </Text>
            </View>
          </View>

          {/* Ordered Items Preview */}
          {items.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  Items Ordered ({items.length})
                </Text>
              </View>
              <View style={styles.itemsList}>
                {items.map((item, idx) => (
                  <View key={item.id || idx} style={styles.itemRow}>
                    <View
                      style={[
                        styles.itemEmojiBox,
                        { backgroundColor: item.accentColor || '#E8F5E9' },
                      ]}>
                      <Text style={styles.itemEmoji}>{item.emoji || '🥬'}</Text>
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemUnit}>
                        {item.unit} • Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      ₹{item.subtotal || item.price * item.quantity}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Order Details & Address Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery & Payment</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Delivery Address</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {address?.fullAddress ||
                  address?.shortAddress ||
                  'Saved Delivery Location'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Mode</Text>
              <Text style={styles.infoValue}>{paymentMethod}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Amount</Text>
              <Text style={[styles.infoValue, styles.totalHighlight]}>
                ₹{displayTotal}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.8}
              onPress={handleTrackOrder}
              accessibilityLabel="Track Order">
              <Text style={styles.primaryBtnText}>Track Order 🚚</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.8}
              onPress={handleViewOrders}
              accessibilityLabel="View My Orders">
              <Text style={styles.secondaryBtnText}>View My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tertiaryBtn}
              activeOpacity={0.7}
              onPress={handleContinueShopping}
              accessibilityLabel="Continue Shopping">
              <Text style={styles.tertiaryBtnText}>Continue Shopping →</Text>
            </TouchableOpacity>
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  celebrationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  partyIcon: {
    fontSize: 34,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  orderIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  orderIdLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginRight: 6,
  },
  orderIdValue: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  etaIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  etaTextCol: {
    flex: 1,
  },
  etaTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  etaTime: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  etaSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemEmojiBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemEmoji: {
    fontSize: 18,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  itemUnit: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    maxWidth: '60%',
    textAlign: 'right',
  },
  totalHighlight: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  actionContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  primaryBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  secondaryBtn: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  tertiaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
});

export default OrderConfirmationScreen;
