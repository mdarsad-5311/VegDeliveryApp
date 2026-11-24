import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import useAppContext from '../../hooks/useAppContext';

const MENU_OPTIONS = [
  {
    icon: '📦',
    title: 'My Orders',
    subtitle: 'Active, completed & past deliveries',
    route: 'Orders',
  },
  {
    icon: '📍',
    title: 'Saved Addresses',
    subtitle: 'Home, Office & other delivery locations',
    route: 'AddressList',
  },
  {
    icon: '💬',
    title: 'Help & Customer Support',
    subtitle: 'FAQs, toll-free call & ticket reporting',
    route: 'HelpSupport',
  },
  {
    icon: '💳',
    title: 'Payment Methods',
    subtitle: 'UPI, Cards & Cash on Delivery',
  },
  {
    icon: '🔔',
    title: 'Notifications',
    subtitle: 'Daily harvest & discount offers',
  },
  {
    icon: '🌱',
    title: 'Subscription Farm Box',
    subtitle: 'Weekly recurring vegetable deliveries',
  },
  {
    icon: '⚙️',
    title: 'App Settings',
    subtitle: 'Theme, app language & preferences',
  },
];

export const ProfileScreen = ({ navigation }) => {
  const { user, selectedAddress, logoutUser } = useAppContext();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const displayPhone = user?.phone
    ? user.phone.startsWith('+91')
      ? user.phone
      : `+91 ${user.phone}`
    : '+91 98765 43210';

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logoutUser();

    // Reset navigation stack directly to Login, preventing back navigation into authenticated screens
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleMenuPress = item => {
    if (item.route) {
      navigation.navigate(item.route);
    } else if (item.title === 'Payment Methods') {
      Alert.alert(
        'Payment Methods',
        'FreshVeg supports Cash on Delivery (COD), UPI (GPay, PhonePe, Paytm), and major Credit/Debit Cards.',
        [{ text: 'OK' }],
      );
    } else if (item.title === 'Notifications') {
      Alert.alert(
        'Notifications',
        'You are subscribed to farm-fresh harvest drops and morning offers!',
        [{ text: 'Great' }],
      );
    } else if (item.title === 'Subscription Farm Box') {
      Alert.alert(
        'Subscription Farm Box',
        'Weekly automated farm box feature is coming soon! You will get custom curated leafy and root veggies every Sunday.',
        [{ text: 'Sounds Good' }],
      );
    } else if (item.title === 'App Settings') {
      Alert.alert(
        'App Settings',
        'Language: English (Default)\nTheme: Clean Green (System Default)\nNotification Sounds: Enabled',
        [{ text: 'OK' }],
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="My Account" subtitle="Profile & Account Management" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.avatar || '🥦'}</Text>
              </View>
              <TouchableOpacity
                style={styles.editAvatarPill}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('EditProfile')}
                accessibilityLabel="Edit profile picture">
                <Text style={styles.editAvatarIcon}>✏️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Kira Sharma'}</Text>
              <Text style={styles.userEmail}>
                {user?.email || 'kira.sharma@freshveg.in'}
              </Text>
              <Text style={styles.userPhone}>{displayPhone}</Text>
            </View>

            <TouchableOpacity
              style={styles.editProfileBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}
              accessibilityLabel="Edit Profile">
              <Text style={styles.editProfileBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Subtitle / Bio Bar */}
          <View style={styles.bioBar}>
            <Text style={styles.bioText}>
              🌿 {user?.bio || 'Farm fresh vegetable enthusiast'}
            </Text>
            <Text style={styles.locationTag} numberOfLines={1}>
              📍 {selectedAddress?.shortAddress || 'Pune, MH'}
            </Text>
          </View>
        </Card>

        {/* Menu Items Container */}
        <View style={styles.menuContainer}>
          {MENU_OPTIONS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item)}
              accessibilityLabel={item.title}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}

          {/* Logout Menu Row */}
          <TouchableOpacity
            style={[styles.menuRow, styles.logoutRow]}
            activeOpacity={0.7}
            onPress={() => setLogoutModalVisible(true)}
            accessibilityLabel="Log Out">
            <Text style={styles.menuIcon}>🚪</Text>
            <View style={styles.menuTexts}>
              <Text style={[styles.menuTitle, styles.logoutTitle]}>Log Out</Text>
              <Text style={styles.menuSubtitle}>Sign out of this device</Text>
            </View>
            <Text style={[styles.chevron, styles.logoutChevron]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Version Info */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>
            FreshVeg App v1.0.0 (CLI Setup) • 100% Organic Delivery
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.logoutIconCircle}>
              <Text style={styles.logoutIcon}>🚪</Text>
            </View>

            <Text style={styles.modalTitle}>Log Out?</Text>
            <Text style={styles.modalSub}>
              Are you sure you want to sign out of your FreshVeg account? Your
              saved addresses and order history will remain safely stored.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                activeOpacity={0.8}
                onPress={() => setLogoutModalVisible(false)}
                accessibilityLabel="Cancel logout">
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                activeOpacity={0.8}
                onPress={handleLogout}
                accessibilityLabel="Confirm Log Out">
                <Text style={styles.confirmLogoutBtnText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  avatarText: {
    fontSize: 30,
  },
  editAvatarPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  editAvatarIcon: {
    fontSize: 9,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  editProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  bioBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    marginTop: spacing.sm,
    paddingTop: 8,
  },
  bioText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  locationTag: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
    marginLeft: 8,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  logoutRow: {
    backgroundColor: '#FFFBFB',
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  logoutTitle: {
    color: colors.error,
    fontWeight: typography.weights.bold,
  },
  menuSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: colors.textMuted,
  },
  logoutChevron: {
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  versionText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoutIcon: {
    fontSize: 26,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: spacing.sm,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
});

export default ProfileScreen;
