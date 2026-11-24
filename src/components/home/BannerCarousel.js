import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import { PROMO_BANNERS } from '../../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;

export const BannerCarousel = ({ onBannerPress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < PROMO_BANNERS.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + spacing.sm}
        contentContainerStyle={styles.scrollContent}>
        {PROMO_BANNERS.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            style={[styles.bannerCard, { backgroundColor: banner.bgColor }]}
            activeOpacity={0.9}
            onPress={() => onBannerPress && onBannerPress(banner)}>
            {/* Background Decorative Circles */}
            <View
              style={[
                styles.decorCircle1,
                { backgroundColor: banner.accentColor },
              ]}
            />
            <View
              style={[
                styles.decorCircle2,
                { backgroundColor: banner.accentColor },
              ]}
            />

            {/* Left Content Area */}
            <View style={styles.cardContent}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: banner.badgeColor },
                  ]}>
                  <Text style={styles.badgeText}>{banner.badge}</Text>
                </View>
                <View style={styles.discountPill}>
                  <Text style={styles.discountText}>{banner.discount}</Text>
                </View>
              </View>

              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSubtitle} numberOfLines={2}>
                {banner.subtitle}
              </Text>

              <View style={styles.ctaRow}>
                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>{banner.ctaText} →</Text>
                </View>
                {banner.code && (
                  <View style={styles.couponTag}>
                    <Text style={styles.couponText}>Code: {banner.code}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Right Side Illustration */}
            <View style={styles.illustrationSide}>
              <Text style={styles.bannerEmoji}>{banner.emoji}</Text>
              <View style={styles.freshGlow} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationDots}>
        {PROMO_BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              activeIndex === i ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  bannerCard: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 160,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  decorCircle1: {
    position: 'absolute',
    right: -20,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.2,
  },
  decorCircle2: {
    position: 'absolute',
    right: 50,
    bottom: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.15,
  },
  cardContent: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  discountPill: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  discountText: {
    color: '#E65100',
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    lineHeight: 22,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  ctaText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  couponTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderStyle: 'dashed',
  },
  couponText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: typography.weights.semiBold,
  },
  illustrationSide: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bannerEmoji: {
    fontSize: 56,
  },
  freshGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: colors.border,
  },
});

export default BannerCarousel;
