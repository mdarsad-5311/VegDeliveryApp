import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const ORDER_STAGES_DEFAULT = [
  {
    step: 1,
    title: 'Order Placed',
    desc: 'Order received and verified',
    icon: '📝',
  },
  {
    step: 2,
    title: 'Order Confirmed',
    desc: 'Farm inventory reserved',
    icon: '✅',
  },
  {
    step: 3,
    title: 'Preparing Order',
    desc: 'Harvested & packed fresh',
    icon: '🧺',
  },
  {
    step: 4,
    title: 'Out for Delivery',
    desc: 'Partner on the way to you',
    icon: '🛵',
  },
  {
    step: 5,
    title: 'Delivered',
    desc: 'Handed over at doorstep',
    icon: '🎉',
  },
];

export const OrderTimeline = ({
  timeline = [],
  currentStage = 1,
  isCancelled = false,
  cancelReason = '',
}) => {
  if (isCancelled) {
    return (
      <View style={styles.container}>
        {/* Step 1: Placed */}
        <View style={styles.stepRow}>
          <View style={styles.indicatorCol}>
            <View style={[styles.circle, styles.circleCompleted]}>
              <Text style={styles.circleCheck}>✓</Text>
            </View>
            <View style={[styles.verticalLine, styles.verticalLineCancelled]} />
          </View>
          <View style={styles.contentCol}>
            <View style={styles.stepHeaderRow}>
              <Text style={styles.stepTitle}>Order Placed</Text>
              <Text style={styles.stepTime}>
                {timeline[0]?.time || 'Placed'}
              </Text>
            </View>
            <Text style={styles.stepDesc}>Order received and verified</Text>
          </View>
        </View>

        {/* Step 2: Cancelled */}
        <View style={styles.stepRow}>
          <View style={styles.indicatorCol}>
            <View style={[styles.circle, styles.circleCancelled]}>
              <Text style={styles.circleCancelIcon}>✕</Text>
            </View>
          </View>
          <View style={styles.contentCol}>
            <View style={styles.stepHeaderRow}>
              <Text style={[styles.stepTitle, styles.cancelledTitle]}>
                Order Cancelled
              </Text>
              <Text style={styles.stepTime}>
                {timeline[timeline.length - 1]?.time || 'Cancelled'}
              </Text>
            </View>
            <Text style={styles.cancelledDesc}>
              {cancelReason || 'Order was cancelled as requested.'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {ORDER_STAGES_DEFAULT.map((stage, idx) => {
        const matchingTimeline = timeline.find(t => t.step === stage.step);
        const isCompleted =
          matchingTimeline?.completed || currentStage >= stage.step;
        const isCurrent =
          matchingTimeline?.current || currentStage === stage.step;
        const isLast = idx === ORDER_STAGES_DEFAULT.length - 1;
        const timeText = matchingTimeline?.time || '';

        return (
          <View key={stage.step} style={styles.stepRow}>
            {/* Visual Indicator Column */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isCurrent && styles.circleCurrent,
                ]}>
                {isCompleted && !isCurrent ? (
                  <Text style={styles.circleCheck}>✓</Text>
                ) : isCurrent ? (
                  <View style={styles.currentDot} />
                ) : (
                  <Text style={styles.circleIndex}>{stage.step}</Text>
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.verticalLine,
                    isCompleted && styles.verticalLineCompleted,
                  ]}
                />
              )}
            </View>

            {/* Content Column */}
            <View style={[styles.contentCol, isLast && styles.contentColLast]}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.titleWrap}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isCurrent && styles.stepTitleCurrent,
                      !isCompleted && !isCurrent && styles.stepTitlePending,
                    ]}>
                    {stage.title}
                  </Text>
                  {isCurrent && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>IN PROGRESS</Text>
                    </View>
                  )}
                </View>
                {timeText ? (
                  <Text style={styles.stepTime}>{timeText}</Text>
                ) : null}
              </View>
              <Text
                style={[
                  styles.stepDesc,
                  isCurrent && styles.stepDescCurrent,
                  !isCompleted && !isCurrent && styles.stepDescPending,
                ]}>
                {matchingTimeline?.desc || stage.desc}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: spacing.sm,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  circleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleCurrent: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  circleCancelled: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  circleCheck: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  circleCancelIcon: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  circleIndex: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    minHeight: 36,
    backgroundColor: '#E0E0E0',
    marginVertical: 2,
  },
  verticalLineCompleted: {
    backgroundColor: colors.primary,
  },
  verticalLineCancelled: {
    backgroundColor: colors.error,
  },
  contentCol: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  contentColLast: {
    paddingBottom: spacing.xs,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  stepTitleCurrent: {
    color: colors.primaryDark,
  },
  stepTitlePending: {
    color: colors.textMuted,
  },
  cancelledTitle: {
    color: colors.error,
  },
  activePill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    marginLeft: 6,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  stepTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  stepDescCurrent: {
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  stepDescPending: {
    color: colors.textMuted,
  },
  cancelledDesc: {
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
  },
});

export default OrderTimeline;
