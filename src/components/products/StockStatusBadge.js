import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const StockStatusBadge = ({ stockInfo, style }) => {
  if (!stockInfo) return null;

  const { status, label, badgeColor, bgColor } = stockInfo;

  const dotColor =
    status === 'out_of_stock'
      ? colors.error
      : status === 'limited_stock'
      ? '#E65100'
      : colors.success;

  return (
    <View
      style={[
        styles.badgeContainer,
        { backgroundColor: bgColor, borderColor: badgeColor },
        style,
      ]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.label, { color: badgeColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});

export default StockStatusBadge;
