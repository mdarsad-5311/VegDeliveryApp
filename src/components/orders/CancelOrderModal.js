import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Delivery time is taking too long',
  'Need to modify items or quantities',
  'Changed delivery address',
  'Found alternative at local store',
  'Other reason',
];

export const CancelOrderModal = ({
  visible,
  orderId,
  onClose,
  onConfirmCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customNote, setCustomNote] = useState('');

  const handleConfirm = () => {
    const finalReason =
      selectedReason === 'Other reason' && customNote.trim()
        ? `Other: ${customNote.trim()}`
        : selectedReason;
    onConfirmCancel(finalReason);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.warningIconCircle}>
              <Text style={styles.warningIcon}>⚠️</Text>
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.title}>Cancel Order?</Text>
              <Text style={styles.orderIdSub}>Order ID: {orderId}</Text>
            </View>
          </View>

          <Text style={styles.warningMessage}>
            Are you sure you want to cancel? Fresh produce picked for your order
            will be returned to the farm shelf.
          </Text>

          <Text style={styles.sectionTitle}>Please select a reason:</Text>

          {/* Reasons List */}
          <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
            {CANCELLATION_REASONS.map((reason, idx) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.reasonOption,
                    isSelected && styles.reasonOptionSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedReason(reason)}>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.reasonText,
                      isSelected && styles.reasonTextSelected,
                    ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {selectedReason === 'Other reason' && (
              <TextInput
                style={styles.customInput}
                placeholder="Briefly describe your reason..."
                placeholderTextColor={colors.textMuted}
                value={customNote}
                onChangeText={setCustomNote}
                maxLength={100}
              />
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.keepBtn}
              activeOpacity={0.8}
              onPress={onClose}>
              <Text style={styles.keepBtnText}>Keep Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmCancelBtn}
              activeOpacity={0.8}
              onPress={handleConfirm}>
              <Text style={styles.confirmCancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 380,
    padding: spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  warningIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  warningIcon: {
    fontSize: 22,
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  orderIdSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  warningMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  reasonsList: {
    maxHeight: 220,
    marginBottom: spacing.md,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  reasonOptionSelected: {
    borderColor: colors.error,
    backgroundColor: '#FFEBEE',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: colors.error,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.error,
  },
  reasonText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  reasonTextSelected: {
    color: colors.error,
    fontWeight: typography.weights.bold,
  },
  customInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  keepBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
});

export default CancelOrderModal;
