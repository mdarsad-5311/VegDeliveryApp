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
import { AddressCard } from '../../components/address/AddressCard';

export const AddressListScreen = ({ navigation, route }) => {
  const {
    addresses,
    selectedAddress,
    selectDeliveryAddress,
    deleteAddress,
    setDefaultAddress,
    fetchAddresses,
    isAuthenticated,
  } = useAppContext();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isAuthenticated && typeof fetchAddresses === 'function') {
      await fetchAddresses();
    }
    setRefreshing(false);
  }, [isAuthenticated, fetchAddresses]);

  const isSelectMode = !!route.params?.selectMode;

  const handleSelectAddress = async addr => {
    await selectDeliveryAddress(addr.id);
    if (isSelectMode) {
      navigation.goBack();
    }
  };

  const handleSetDefaultAddress = async addr => {
    if (typeof setDefaultAddress === 'function') {
      await setDefaultAddress(addr.id);
    }
  };

  const handleEditAddress = addr => {
    navigation.navigate('EditAddress', { address: addr });
  };

  const handleDeleteAddress = addr => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${addr.fullName || addr.type || 'this address'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAddress(addr.id);
          },
        },
      ],
    );
  };

  const handleAddNew = () => {
    navigation.navigate('AddAddress');
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
            <Text style={styles.headerTitle}>
              {isSelectMode ? 'Select Delivery Address' : 'Saved Addresses'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {addresses.length} saved location{addresses.length === 1 ? '' : 's'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addHeaderBtn}
            activeOpacity={0.7}
            onPress={handleAddNew}
            accessibilityLabel="Add new address">
            <Text style={styles.addHeaderBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {addresses.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>📍</Text>
            </View>
            <Text style={styles.emptyTitle}>No Saved Addresses</Text>
            <Text style={styles.emptySubtitle}>
              You haven't saved any delivery addresses yet. Add your home or office address for fast delivery!
            </Text>
            <TouchableOpacity
              style={styles.addAddressPrimaryBtn}
              activeOpacity={0.8}
              onPress={handleAddNew}
              accessibilityLabel="Add your first address">
              <Text style={styles.addAddressPrimaryBtnText}>
                + Add New Address
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Address List */
          <View style={styles.listWrapper}>
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
              <Text style={styles.sectionNotice}>
                {isSelectMode
                  ? 'Tap an address to select it for this order'
                  : 'Manage your delivery locations'}
              </Text>

              {addresses.map(addr => {
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    isSelected={isSelected}
                    onSelect={handleSelectAddress}
                    onEdit={handleEditAddress}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                );
              })}
            </ScrollView>

            {/* Bottom Add Address Bar */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.bottomAddBtn}
                activeOpacity={0.8}
                onPress={handleAddNew}
                accessibilityLabel="Add New Delivery Address">
                <Text style={styles.bottomAddBtnText}>
                  + Add New Delivery Address
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  addHeaderBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  addHeaderBtnText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  listWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  sectionNotice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm + 2,
    fontWeight: typography.weights.medium,
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
  addAddressPrimaryBtn: {
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
  addAddressPrimaryBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bottomAddBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomAddBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
});

export default AddressListScreen;