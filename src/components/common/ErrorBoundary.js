import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, log to crash reporting service (e.g. Crashlytics / Sentry)
    if (__DEV__) {
      console.warn('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error: this.state.error, resetError: this.handleReset })
          : fallback;
      }

      return (
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🌱</Text>
            </View>

            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              FreshVeg ran into an unexpected problem. Don't worry, your cart items
              and saved addresses are safely preserved.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.devErrorBox}>
                <Text style={styles.devErrorTitle}>Debug Info (Dev Only):</Text>
                <Text style={styles.devErrorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.devStackText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.8}
              onPress={this.handleReset}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  devErrorBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    maxHeight: 140,
    width: '100%',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  devErrorTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#E65100',
    marginBottom: 4,
  },
  devErrorText: {
    fontSize: 11,
    color: '#BF360C',
    fontFamily: 'monospace',
  },
  devStackText: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
  },
});

export default ErrorBoundary;
