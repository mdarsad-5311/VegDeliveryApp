import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';
import { AddressForm } from '../../components/address/AddressForm';

export const EditAddressScreen = ({ navigation, route }) => {
  const { addresses, updateAddress } = useAppContext();
  const addressParam = route.params?.address;
  const addressIdParam = route.params?.addressId;

  const targetAddress =
    addressParam ||
    (addressIdParam
      ? addresses.find(a => a.id === addressIdParam)
      : null);

  const handleUpdate = async formData => {
    if (!targetAddress?.id) return;
    const res = await updateAddress(targetAddress.id, formData);
    if (res && res.success) {
      navigation.goBack();
    }
  };

  if (!targetAddress) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Address</Text>
        </View>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Address not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.headerTitle}>Edit Address</Text>
            <Text style={styles.headerSubtitle}>
              Update delivery location details
            </Text>
          </View>
        </View>

        {/* Form preloaded with target address */}
        <AddressForm
          initialData={targetAddress}
          onSubmit={handleUpdate}
          onCancel={() => navigation.goBack()}
          submitLabel="Save Changes"
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
  errorBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
  },
});

export default EditAddressScreen;