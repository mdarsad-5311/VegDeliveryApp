import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const AddressCard = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const {
    fullName,
    mobile,
    phone,
    houseNumber,
    street,
    landmark,
    city,
    state,
    pincode,
    type = 'Home',
    isDefault = false,
    fullAddress,
  } = address;

  const displayType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  const typeIcon = displayType === 'Home' ? '🏠' : displayType === 'Office' ? '🏢' : '📍';
  const displayPhone = phone || (mobile ? `+91 ${mobile}` : '');

  // Build clean formatted address text
  const addressLine =
    fullAddress ||
    [
      houseNumber,
      street,
      landmark ? `Near ${landmark}` : '',
      city,
      state ? `${state} - ${pincode}` : pincode,
    ]
      .filter(Boolean)
      .join(', ');

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      activeOpacity={0.85}
      onPress={() => onSelect && onSelect(address)}
      accessibilityRole="button"
      accessibilityLabel={`Address ${displayType}, ${fullName || ''}`}>
      {/* Top Row: Radio, Type Badge, Default Badge */}
      <View style={styles.topRow}>
        <View style={styles.radioWrapper}>
          <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeIcon}>{typeIcon}</Text>
            <Text style={styles.typeText}>{displayType}</Text>
          </View>
        </View>

        {isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>DEFAULT</Text>
          </View>
        )}
      </View>

      {/* Recipient Details */}
      <View style={styles.body}>
        {fullName ? <Text style={styles.fullName}>{fullName}</Text> : null}
        {displayPhone ? (
          <Text style={styles.phoneText}>📞 {displayPhone}</Text>
        ) : null}

        {/* Address String */}
        <Text style={styles.addressText} numberOfLines={3}>
          {addressLine}
        </Text>
      </View>

      {/* Bottom Actions Row */}
      <View style={styles.actionsRow}>
        <View style={styles.statusCol}>
          {isSelected ? (
            <View style={styles.selectedPill}>
              <Text style={styles.selectedPillText}>✓ Delivering Here</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectBtn}
              activeOpacity={0.7}
              onPress={() => onSelect && onSelect(address)}>
              <Text style={styles.selectBtnText}>Deliver Here</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonsGroup}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => onEdit && onEdit(address)}
            accessibilityLabel="Edit address">
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            activeOpacity={0.7}
            onPress={() => onDelete && onDelete(address)}
            accessibilityLabel="Delete address">
            <Text style={styles.deleteIcon}>🗑️</Text>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: '#F7FCF7',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  radioWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
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
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  typeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  typeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  defaultBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: '#E65100',
    letterSpacing: 0.5,
  },
  body: {
    marginLeft: 28,
    marginBottom: spacing.sm,
  },
  fullName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  phoneText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  addressText: {
    fontSize: typography.sizes.xs + 1,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs + 4,
    marginLeft: 28,
  },
  statusCol: {
    flex: 1,
  },
  selectedPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  selectedPillText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  selectBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
  },
  selectBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  buttonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
  actionIcon: {
    fontSize: 11,
    marginRight: 3,
  },
  actionText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: typography.weights.semiBold,
  },
  deleteBtn: {
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 11,
    marginRight: 2,
  },
  deleteText: {
    fontSize: 11,
    color: colors.error,
    fontWeight: typography.weights.semiBold,
  },
});

export default AddressCard;