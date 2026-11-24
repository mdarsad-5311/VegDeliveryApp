import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import SplashScreen from '../screens/Splash/SplashScreen';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import ProductListingScreen from '../screens/Products/ProductListingScreen';
import ProductDetailsScreen from '../screens/ProductDetails/ProductDetailsScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import AddressListScreen from '../screens/Address/AddressListScreen';
import AddAddressScreen from '../screens/Address/AddAddressScreen';
import EditAddressScreen from '../screens/Address/EditAddressScreen';
import OrdersScreen from '../screens/Orders/OrdersScreen';
import OrderConfirmationScreen from '../screens/Orders/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/Orders/OrderTrackingScreen';
import OrderDetailsScreen from '../screens/Orders/OrderDetailsScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import HelpSupportScreen from '../screens/Profile/HelpSupportScreen';
import colors from '../constants/colors';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}>
        {/* Onboarding Flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        {/* Authentication Flow */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        {/* Main Application Feed */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="ProductListing" component={ProductListingScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="AddressList" component={AddressListScreen} />
        <Stack.Screen name="AddAddress" component={AddAddressScreen} />
        <Stack.Screen name="EditAddress" component={EditAddressScreen} />

        {/* Order Management Flow */}
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen
          name="OrderConfirmation"
          component={OrderConfirmationScreen}
        />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />

        {/* Profile Management Flow */}
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
