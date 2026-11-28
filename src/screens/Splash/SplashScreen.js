import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import FreshVegLogo from '../../components/illustrations/FreshVegLogo';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';

const { width } = Dimensions.get('window');

export const SplashScreen = ({ navigation }) => {
  const { verifySession } = useAppContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    // Smooth entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Verify session in parallel with minimum splash presentation time (1400ms)
    // so animation displays smoothly without flickering
    const startTime = Date.now();
    const MIN_SPLASH_TIME = 1400;

    verifySession()
      .then(result => {
        if (!isMounted) return;
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed);

        setTimeout(() => {
          if (!isMounted) return;
          if (result && result.authenticated) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('Welcome');
          }
        }, remaining);
      })
      .catch(() => {
        if (!isMounted) return;
        setTimeout(() => {
          if (isMounted) navigation.replace('Welcome');
        }, 300);
      });

    return () => {
      isMounted = false;
    };
  }, [fadeAnim, scaleAnim, textFadeAnim, navigation, verifySession]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
        translucent={false}
      />

      {/* Decorative Subtle Background Rings */}
      <View style={[styles.bgRing, styles.ring1]} />
      <View style={[styles.bgRing, styles.ring2]} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        {/* App Logo */}
        <View style={styles.logoWrapper}>
          <FreshVegLogo size={130} light />
        </View>

        {/* Brand Name */}
        <Animated.View style={[{ opacity: textFadeAnim }, styles.brandContainer]}>
          <Text style={styles.appName}>FreshVeg</Text>
          <View style={styles.taglineBadge}>
            <Text style={styles.tagline}>Fresh Vegetables, Delivered Fresh</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Bottom Organic Farm Indicator */}
      <View style={styles.bottomFooter}>
        <View style={styles.pulseDot} />
        <Text style={styles.footerText}>100% Farm Fresh Guarantee</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ring1: {
    width: width * 1.15,
    height: width * 1.15,
  },
  ring2: {
    width: width * 1.5,
    height: width * 1.5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: 42,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  taglineBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagline: {
    fontSize: typography.sizes.sm + 1,
    color: colors.primaryLight,
    fontWeight: typography.weights.medium,
    letterSpacing: 0.5,
  },
  brandContainer: {
    alignItems: 'center',
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    marginRight: spacing.xs + 2,
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: typography.weights.semiBold,
  },
});

export default SplashScreen;
