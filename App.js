/**
 * VegDeliveryApp - React Native Mobile Application
 * Entry point
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/constants/colors';

const App = () => {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.surface}
          translucent={false}
        />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
};

export default App;
