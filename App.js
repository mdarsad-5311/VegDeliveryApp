/**
 * VegDeliveryApp - React Native Mobile Application
 * Entry point
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { AppProvider } from './src/context/AppContext';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';
import { AddToCartToast } from './src/components/products/AddToCartToast';
import useAppContext from './src/hooks/useAppContext';
import colors from './src/constants/colors';

const AppContent = () => {
  const { toast, hideToast } = useAppContext();

  const handleViewCart = () => {
    hideToast();
    if (navigationRef.isReady()) {
      navigationRef.navigate('MainTabs', { screen: 'Cart' });
    }
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
        translucent={false}
      />
      <AppNavigator />
      <AddToCartToast
        visible={toast?.visible}
        message={toast?.message}
        onDismiss={hideToast}
        onViewCart={handleViewCart}
      />
    </>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
