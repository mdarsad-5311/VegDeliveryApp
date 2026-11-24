import React from 'react';
import { Text, StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/Home/HomeScreen';
import CategoriesScreen from '../screens/Categories/CategoriesScreen';
import CartScreen from '../screens/Cart/CartScreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import colors from '../constants/colors';
import typography from '../constants/typography';
import useAppContext from '../hooks/useAppContext';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused, badgeCount }) => {
  const icons = {
    Home: '🏠',
    Categories: '🥬',
    Cart: '🛒',
    Favorites: '❤️',
    Profile: '👤',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.focusedIconText]}>
        {icons[name] || '•'}
      </Text>
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
      {focused && <View style={styles.activeDot} />}
    </View>
  );
};

export const TabNavigator = () => {
  const { cartCount, favorites } = useAppContext();
  const insets = useSafeAreaInsets();

  // Dynamic bottom inset handling for physical devices:
  // On Android with 3-button navigation, insets.bottom is typically 48-56dp.
  // On Android with gesture navigation, insets.bottom is typically 16-24dp.
  // We ensure a robust minimum safe area padding so labels and icons are never covered.
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 8);
  const barHeight = 56 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let badge = 0;
          if (route.name === 'Cart') {
            badge = cartCount;
          } else if (route.name === 'Favorites') {
            badge = favorites?.length || 0;
          }
          return (
            <TabIcon
              name={route.name}
              focused={focused}
              badgeCount={badge}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: barHeight,
          paddingBottom: bottomInset + 2,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        tabBarLabelStyle: styles.tabBarLabel,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 32,
    height: 26,
  },
  iconText: {
    fontSize: 21,
  },
  focusedIconText: {
    transform: [{ scale: 1.15 }],
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
});

export default TabNavigator;
