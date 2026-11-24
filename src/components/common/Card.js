import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import colors from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/theme';

export const Card = ({ children, style, onPress, ...props }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, style]}
      {...props}>
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});

export default Card;
