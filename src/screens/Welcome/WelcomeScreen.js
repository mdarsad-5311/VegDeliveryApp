import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WelcomeIllustration from '../../components/illustrations/WelcomeIllustration';
import FreshVegLogo from '../../components/illustrations/FreshVegLogo';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  const handleSkipDirectly = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
        translucent={false}
      />
      <View style={styles.container}>
        {/* Top Header / Branding */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <FreshVegLogo size={36} />
            <Text style={styles.brandTitle}>FreshVeg</Text>
          </View>
          <TouchableOpacity onPress={handleSkipDirectly} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Illustration Container */}
        <View style={styles.illustrationWrapper}>
          <WelcomeIllustration width={Math.min(width * 0.85, 320)} height={240} />
        </View>

        {/* Bottom Card Content */}
        <View style={styles.bottomCard}>
          {/* Farm Fresh Pill */}
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>🌱 FARM TO HOME</Text>
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            Fresh Vegetables at Your Doorstep
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            Get farm-fresh vegetables delivered straight to your home. Harvested daily with natural goodness and hygiene.
          </Text>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.85}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <View style={styles.arrowCircle}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Secondary Trust Note */}
          <Text style={styles.trustNote}>
            ✓ 100% Organic &nbsp;•&nbsp; ✓ Hand-picked Daily &nbsp;•&nbsp; ✓ Express Delivery
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginLeft: spacing.xs,
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
    fontWeight: typography.weights.semiBold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  illustrationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  bottomCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  pillBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  pillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    letterSpacing: 1,
  },
  heading: {
    fontSize: typography.sizes.xxl - 2,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: borderRadius.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    marginRight: spacing.sm,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textInverse,
  },
  trustNote: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
