import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';

export const HomeHeader = ({ onPressLocation, onPressNotifications }) => {
  const { selectedAddress, unreadNotifCount } = useAppContext();

  return (
    <View style={styles.container}>
      {/* Location Section */}
      <TouchableOpacity
        style={styles.locationWrapper}
        activeOpacity={0.7}
        onPress={onPressLocation}>
        <View style={styles.iconCircle}>
          <Text style={styles.locationIcon}>📍</Text>
        </View>
        <View style={styles.locationTexts}>
          <View style={styles.deliverToRow}>
            <Text style={styles.deliverLabel}>Deliver to</Text>
            <View style={styles.addressTag}>
              <Text style={styles.addressTagText}>
                {selectedAddress?.label || 'Home'}
              </Text>
            </View>
            <Text style={styles.caret}>▾</Text>
          </View>
          <Text style={styles.addressSnippet} numberOfLines={1}>
            {selectedAddress?.shortAddress || 'Select delivery location'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Notification Bell Icon */}
      <TouchableOpacity
        style={styles.bellButton}
        activeOpacity={0.7}
        onPress={onPressNotifications}>
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadNotifCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  locationIcon: {
    fontSize: 18,
  },
  locationTexts: {
    flex: 1,
  },
  deliverToRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliverLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  addressTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    marginLeft: 6,
  },
  addressTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  caret: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: typography.weights.bold,
  },
  addressSnippet: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginTop: 1,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
  },
  bellIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
});

export default HomeHeader;
