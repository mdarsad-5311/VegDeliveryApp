import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';

const FAQS = [
  {
    category: 'Orders & Tracking',
    items: [
      {
        q: 'How do I track my fresh vegetable delivery?',
        a: 'You can track your order in real-time by opening the "My Orders" tab and tapping "Track 🚚". You will see our 5-stage progress timeline and delivery partner details.',
      },
      {
        q: 'Can I cancel my order after placing it?',
        a: 'Yes, orders can be cancelled anytime before they are marked as Delivered. Open your order in "My Orders" or "Order Details" and select "Cancel Order" with your cancellation reason.',
      },
      {
        q: 'What if a vegetable item is out of stock?',
        a: 'We harvest daily from certified local farms. If an item cannot be sourced with 100% freshness, you will receive an instant notification and full refund.',
      },
    ],
  },
  {
    category: 'Payments & Refunds',
    items: [
      {
        q: 'What payment methods are supported?',
        a: 'We accept Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), and Credit/Debit Cards.',
      },
      {
        q: 'How do refunds work if vegetables are damaged?',
        a: 'We offer a 100% Freshness Guarantee! If you are unsatisfied with any vegetable upon delivery, our delivery partner handles instant returns or customer care issues a full refund within 24 hours.',
      },
      {
        q: 'Is there a minimum order amount for free delivery?',
        a: 'Delivery is completely FREE on all orders of ₹199 or more. For smaller orders, a nominal ₹30 partner delivery fee applies.',
      },
    ],
  },
  {
    category: 'Delivery & Hygiene',
    items: [
      {
        q: 'What are your delivery time slots?',
        a: 'We offer Instant Delivery (20 - 30 minutes) for on-demand cooking, as well as pre-scheduled Morning (7 - 9 AM) and Evening (6 - 8 PM) slots.',
      },
      {
        q: 'Do you offer contactless doorstep delivery?',
        a: 'Yes! All orders are packed in sanitized, eco-friendly breathable bags and our delivery partners follow strict contactless handover protocols.',
      },
    ],
  },
];

export const HelpSupportScreen = ({ navigation }) => {
  const { orders } = useAppContext();

  // Accordion state: { [categoryIndex_itemIndex]: boolean }
  const [expandedFaqs, setExpandedFaqs] = useState({ '0_0': true });

  // Issue Reporting Modal state
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedIssueCategory, setSelectedIssueCategory] =
    useState('Damaged produce');
  const [issueDescription, setIssueDescription] = useState('');
  const [selectedOrderForIssue, setSelectedOrderForIssue] = useState(
    orders[0]?.id || 'General Support',
  );

  const toggleFaq = key => {
    setExpandedFaqs(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCallSupport = () => {
    Alert.alert(
      'Call FreshVeg Customer Care',
      'Toll-Free Helpline: 1800-FRESH-VEG (+91 1800 266 8344)\n\nAvailable 7:00 AM – 10:00 PM every day.',
      [{ text: 'Simulate Call' }, { text: 'Cancel', style: 'cancel' }],
    );
  };

  const handleEmailSupport = () => {
    Alert.alert(
      'Email Support',
      'Contact our support team at support@freshveg.in\n\nWe respond to all customer queries within 2 hours.',
      [{ text: 'OK' }],
    );
  };

  const handleWhatsAppChat = () => {
    Alert.alert(
      'WhatsApp Customer Chat',
      'Opening FreshVeg WhatsApp Help Desk (+91 98765 43210)...\n\nInstant support for delivery and replacement requests.',
      [{ text: 'Start Chat' }, { text: 'Close', style: 'cancel' }],
    );
  };

  const handleSubmitIssue = () => {
    if (!issueDescription.trim()) {
      Alert.alert(
        'Details Required',
        'Please describe the issue you encountered so our farm support team can assist you.',
        [{ text: 'OK' }],
      );
      return;
    }

    setReportModalVisible(false);
    setIssueDescription('');
    Alert.alert(
      'Ticket Submitted',
      `Your support ticket for ${selectedOrderForIssue} (${selectedIssueCategory}) has been registered. Our care executive will reach out within 30 minutes!`,
      [{ text: 'Great, thanks!' }],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back">
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>
              FAQs, assistance & order help
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Quick Contact Cards */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionHeading}>Contact Customer Support</Text>
            <View style={styles.contactRow}>
              {/* Call */}
              <TouchableOpacity
                style={styles.contactCard}
                activeOpacity={0.8}
                onPress={handleCallSupport}
                accessibilityLabel="Call Customer Support">
                <View style={[styles.contactIconCircle, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={styles.contactIcon}>📞</Text>
                </View>
                <Text style={styles.contactTitle}>Call Us</Text>
                <Text style={styles.contactSub}>Toll-Free Helpline</Text>
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity
                style={styles.contactCard}
                activeOpacity={0.8}
                onPress={handleWhatsAppChat}
                accessibilityLabel="WhatsApp Chat">
                <View style={[styles.contactIconCircle, { backgroundColor: '#E8F8F5' }]}>
                  <Text style={styles.contactIcon}>💬</Text>
                </View>
                <Text style={styles.contactTitle}>WhatsApp</Text>
                <Text style={styles.contactSub}>Fast 2-Min Reply</Text>
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                style={styles.contactCard}
                activeOpacity={0.8}
                onPress={handleEmailSupport}
                accessibilityLabel="Email Customer Support">
                <View style={[styles.contactIconCircle, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={styles.contactIcon}>✉️</Text>
                </View>
                <Text style={styles.contactTitle}>Email</Text>
                <Text style={styles.contactSub}>support@freshveg.in</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Report an Issue CTA Banner */}
          <View style={styles.reportBanner}>
            <View style={styles.reportBannerLeft}>
              <Text style={styles.reportBannerIcon}>🚨</Text>
              <View style={styles.reportBannerTexts}>
                <Text style={styles.reportBannerTitle}>Have an issue with an order?</Text>
                <Text style={styles.reportBannerSub}>
                  Damaged produce, missing items or delivery delay
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.reportBtn}
              activeOpacity={0.8}
              onPress={() => setReportModalVisible(true)}
              accessibilityLabel="Report Issue">
              <Text style={styles.reportBtnText}>Report Issue</Text>
            </TouchableOpacity>
          </View>

          {/* Frequently Asked Questions */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>

            {FAQS.map((cat, catIdx) => (
              <View key={catIdx} style={styles.categoryCard}>
                <Text style={styles.categoryTitle}>{cat.category}</Text>

                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}_${itemIdx}`;
                  const isExpanded = !!expandedFaqs[key];

                  return (
                    <View key={itemIdx} style={styles.faqItem}>
                      <TouchableOpacity
                        style={styles.faqQuestionRow}
                        activeOpacity={0.7}
                        onPress={() => toggleFaq(key)}>
                        <Text style={styles.faqQuestionText}>{item.q}</Text>
                        <Text style={styles.faqChevron}>
                          {isExpanded ? '▲' : '▼'}
                        </Text>
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.faqAnswerBox}>
                          <Text style={styles.faqAnswerText}>{item.a}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Operating Hours Info Card */}
          <View style={styles.hoursCard}>
            <Text style={styles.hoursIcon}>⏰</Text>
            <View style={styles.hoursTextCol}>
              <Text style={styles.hoursTitle}>Customer Care Hours</Text>
              <Text style={styles.hoursText}>
                Monday to Sunday: 7:00 AM – 10:00 PM IST
              </Text>
              <Text style={styles.hoursSub}>
                100% Farm-to-Kitchen Guarantee with instant replacement.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Report an Issue Modal */}
        <Modal
          visible={reportModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setReportModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Report an Issue</Text>
                <TouchableOpacity
                  onPress={() => setReportModalVisible(false)}
                  style={styles.modalCloseIconBtn}>
                  <Text style={styles.modalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                Tell us what went wrong and we will make it right.
              </Text>

              {/* Order selector */}
              <Text style={styles.inputLabel}>Select Order</Text>
              <View style={styles.orderSelectRow}>
                {orders.slice(0, 2).map(o => (
                  <TouchableOpacity
                    key={o.id}
                    style={[
                      styles.orderChip,
                      selectedOrderForIssue === o.id && styles.orderChipSelected,
                    ]}
                    onPress={() => setSelectedOrderForIssue(o.id)}>
                    <Text
                      style={[
                        styles.orderChipText,
                        selectedOrderForIssue === o.id &&
                          styles.orderChipTextSelected,
                      ]}>
                      {o.id} ({o.status})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Problem Type radio selection */}
              <Text style={styles.inputLabel}>Issue Type</Text>
              <View style={styles.issueTypesGrid}>
                {[
                  'Damaged produce',
                  'Missing item',
                  'Delivery delay',
                  'Billing question',
                ].map((type, idx) => {
                  const isSel = selectedIssueCategory === type;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.issueTypeChip,
                        isSel && styles.issueTypeChipSelected,
                      ]}
                      onPress={() => setSelectedIssueCategory(type)}>
                      <Text
                        style={[
                          styles.issueTypeText,
                          isSel && styles.issueTypeTextSelected,
                        ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description TextArea */}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.modalTextArea}
                placeholder="Describe what occurred with your delivery or items..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={issueDescription}
                onChangeText={setIssueDescription}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitModalBtn}
                activeOpacity={0.8}
                onPress={handleSubmitIssue}>
                <Text style={styles.submitModalBtnText}>
                  Submit Support Request →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  backArrow: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  contactSection: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  contactSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  reportBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  reportBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportBannerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  reportBannerTexts: {
    flex: 1,
  },
  reportBannerTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: '#E65100',
  },
  reportBannerSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reportBtn: {
    backgroundColor: '#E65100',
    paddingVertical: 9,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  faqSection: {
    marginBottom: spacing.lg,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 10,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    paddingRight: 8,
  },
  faqChevron: {
    fontSize: 12,
    color: colors.textMuted,
  },
  faqAnswerBox: {
    marginTop: 8,
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: borderRadius.sm,
  },
  faqAnswerText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  hoursIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  hoursTextCol: {
    flex: 1,
  },
  hoursTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  hoursText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
    fontWeight: typography.weights.medium,
  },
  hoursSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 380,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalCloseIconBtn: {
    padding: 4,
  },
  modalCloseIcon: {
    fontSize: 16,
    color: colors.textMuted,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 6,
  },
  orderSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  orderChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  orderChipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: colors.primary,
  },
  orderChipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  orderChipTextSelected: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  issueTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  issueTypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  issueTypeChipSelected: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.error,
  },
  issueTypeText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  issueTypeTextSelected: {
    color: colors.error,
    fontWeight: typography.weights.bold,
  },
  modalTextArea: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    padding: 10,
    minHeight: 70,
    textAlignVertical: 'top',
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  submitModalBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitModalBtnText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
});

export default HelpSupportScreen;
