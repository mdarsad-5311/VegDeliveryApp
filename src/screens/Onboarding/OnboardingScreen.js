import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrganicIllustration from '../../components/illustrations/OrganicIllustration';
import EasyOrderingIllustration from '../../components/illustrations/EasyOrderingIllustration';
import FastDeliveryIllustration from '../../components/illustrations/FastDeliveryIllustration';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    heading: 'Fresh & Organic',
    description:
      'Enjoy fresh and healthy vegetables directly from trusted farms. Hand-selected every morning to ensure maximum nutritional value.',
    badge: '100% FARM FRESH',
    badgeColor: colors.primary,
    badgeBg: colors.primaryLight,
    illustration: <OrganicIllustration width={Math.min(width * 0.85, 320)} height={230} />,
  },
  {
    id: '2',
    heading: 'Easy & Quick Ordering',
    description:
      'Choose your favorite vegetables and order them in just a few taps. Browse leafy greens, root veggies, and herbs effortlessly.',
    badge: 'SEAMLESS EXPERIENCE',
    badgeColor: colors.secondary,
    badgeBg: colors.secondaryLight,
    illustration: <EasyOrderingIllustration width={Math.min(width * 0.85, 320)} height={230} />,
  },
  {
    id: '3',
    heading: 'Fast Home Delivery',
    description:
      'Get fresh vegetables delivered safely to your doorstep with our fast, contactless express delivery network.',
    badge: 'EXPRESS DOORSTEP DELIVERY',
    badgeColor: colors.primaryDark,
    badgeBg: colors.primaryLight,
    illustration: <FastDeliveryIllustration width={Math.min(width * 0.85, 320)} height={230} />,
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Hardware Back Button Handler for Android
  useEffect(() => {
    const onBackPress = () => {
      if (currentIndex > 0) {
        flatListRef.current?.scrollToIndex({
          index: currentIndex - 1,
          animated: true,
        });
        return true;
      }
      return false; // Let default back action occur (return to Welcome)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => backHandler.remove();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    navigation.replace('Login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const renderSlideItem = ({ item }) => {
    return (
      <View style={styles.slideContainer}>
        {/* Visual Illustration */}
        <View style={styles.illustrationBox}>{item.illustration}</View>

        {/* Slide Content Card */}
        <View style={styles.contentCard}>
          <View style={[styles.badgePill, { backgroundColor: item.badgeBg }]}>
            <Text style={[styles.badgeText, { color: item.badgeColor }]}>
              {item.badge}
            </Text>
          </View>
          <Text style={styles.slideHeading}>{item.heading}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
        translucent={false}
      />
      <View style={styles.container}>
        {/* Top Header with Skip Button */}
        <View style={styles.topHeader}>
          <Text style={styles.stepIndicator}>
            Step {currentIndex + 1} of {SLIDES.length}
          </Text>
          {!isLastSlide ? (
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderSkip} />
          )}
        </View>

        {/* Horizontal FlatList Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlideItem}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          extraData={currentIndex}
        />

        {/* Bottom Navigation Area */}
        <View style={styles.bottomBar}>
          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {SLIDES.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              );
            })}
          </View>

          {/* Action Button: Next or Get Started */}
          <View style={styles.actionsContainer}>
            {isLastSlide ? (
              <TouchableOpacity
                style={styles.getStartedBtn}
                onPress={handleComplete}
                activeOpacity={0.85}>
                <Text style={styles.getStartedBtnText}>Get Started</Text>
                <Text style={styles.btnArrow}>→</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.nextRow}>
                <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
                  <Text style={styles.secondarySkipText}>Skip All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={handleNext}
                  activeOpacity={0.85}>
                  <Text style={styles.nextBtnText}>Next</Text>
                  <Text style={styles.nextArrow}>›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  stepIndicator: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  skipButtonText: {
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
    fontWeight: typography.weights.semiBold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  placeholderSkip: {
    width: 40,
  },
  slideContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  illustrationBox: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  badgePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  slideHeading: {
    fontSize: typography.sizes.xl + 2,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    lineHeight: 30,
  },
  slideDescription: {
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.xs,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 26,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: colors.border,
  },
  actionsContainer: {
    minHeight: 52,
    justifyContent: 'center',
  },
  nextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondarySkipText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  nextBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    marginRight: spacing.xs,
  },
  nextArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textInverse,
  },
  getStartedBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: borderRadius.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  getStartedBtnText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
    marginRight: spacing.sm,
  },
  btnArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textInverse,
  },
});

export default OnboardingScreen;
