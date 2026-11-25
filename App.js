/**
 * VegDeliveryApp - React Native Mobile Application
 * Entry point
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/constants/colors';

const App = () => {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={colors.surface}
            translucent={false}
          />
          <AppNavigator />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
