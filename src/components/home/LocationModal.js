import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';

export const LocationModal = ({ visible, onClose, onAddNewAddress }) => {
  const { addresses, selectedAddress, setSelectedAddress } = useAppContext();

  const handleSelect = addr => {
    setSelectedAddress(addr);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Delivery Location</Text>
              <Text style={styles.subtitle}>Select your preferred address</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Address List */}
          <ScrollView style={styles.addressList}>
            {addresses.map(item => {
              const isSelected = selectedAddress?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.addressCard,
                    isSelected && styles.selectedCard,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.addressIcon}>{item.icon}</Text>
                  <View style={styles.addressInfo}>
                    <View style={styles.labelRow}>
                      <Text style={styles.addressLabel}>{item.label}</Text>
                      {item.tag && (
                        <View style={styles.tagBadge}>
                          <Text style={styles.tagText}>{item.tag}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.fullAddress} numberOfLines={2}>
                      {item.fullAddress}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.selectedRadio,
                    ]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Add New Address Placeholder */}
            <TouchableOpacity
              style={styles.addAddressBtn}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onAddNewAddress && onAddNewAddress();
              }}>
              <Text style={styles.addIcon}>➕</Text>
              <Text style={styles.addText}>Add New Delivery Address</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  addressList: {
    marginVertical: spacing.xs,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  addressIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  addressInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  addressLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  tagBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  fullAddress: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  addIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  addText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});

export default LocationModal;
