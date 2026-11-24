import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';
import { SearchBar, ProductCard } from '../../components/home';
import { SortFilterBar, CategoryPills } from '../../components/categories';
import {
  ProductFilterModal,
  PRICE_RANGES,
} from '../../components/products/ProductFilterModal';
import { VEG_CATEGORIES, ALL_PRODUCTS } from '../../constants/mockData';

export const ProductListingScreen = ({ navigation, route }) => {
  const { cartCount, cartSubtotal, selectedAddress } = useAppContext();

  // Route Params
  const initialCategory = route?.params?.categoryId || 'all';
  const screenTitle = route?.params?.title || 'All Products';
  const initialSort = route?.params?.sort || 'popularity';

  // Local State
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState(initialSort);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter State
  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: 'all',
    discountOnly: false,
    rating: 'all',
    inStockOnly: false,
  });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.priceRange !== 'all') count++;
    if (appliedFilters.discountOnly) count++;
    if (appliedFilters.rating !== 'all') count++;
    if (appliedFilters.inStockOnly) count++;
    return count;
  }, [appliedFilters]);

  // Sync category if route params update
  useEffect(() => {
    if (route?.params?.categoryId) {
      setSelectedCategoryId(route.params.categoryId);
    }
  }, [route?.params?.categoryId]);

  // Current category object
  const currentCategory = useMemo(() => {
    if (selectedCategoryId === 'all') return null;
    return VEG_CATEGORIES.find(c => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId]);

  // 1. Filter by Category
  const categoryProducts = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return ALL_PRODUCTS;
    }
    return ALL_PRODUCTS.filter(p => p.categoryId === selectedCategoryId);
  }, [selectedCategoryId]);

  // 2. Filter by Search Query
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return categoryProducts;
    const q = searchQuery.toLowerCase().trim();
    return categoryProducts.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tag && p.tag.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [searchQuery, categoryProducts]);

  // 3. Apply Multi-Criteria Filters
  const filteredProducts = useMemo(() => {
    return searchedProducts.filter(product => {
      // Price Range Filter
      if (appliedFilters.priceRange !== 'all') {
        const pr = PRICE_RANGES.find(r => r.id === appliedFilters.priceRange);
        if (pr) {
          if (product.price < pr.min || product.price > pr.max) {
            return false;
          }
        }
      }

      // Discounted Only Filter
      if (appliedFilters.discountOnly) {
        const hasDiscount = Boolean(
          product.originalPrice && product.originalPrice > product.price,
        );
        if (!hasDiscount) return false;
      }

      // Rating Filter
      if (appliedFilters.rating !== 'all') {
        const minRating = parseFloat(appliedFilters.rating.replace('_', '.'));
        if (minRating && (product.rating || 0) < minRating) {
          return false;
        }
      }

      // In Stock Filter
      if (appliedFilters.inStockOnly) {
        if (product.inStock === false) return false;
      }

      return true;
    });
  }, [searchedProducts, appliedFilters]);

  // 4. Sort Products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (activeSort) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'highest_discount':
        return list.sort((a, b) => {
          const discA = a.originalPrice
            ? (a.originalPrice - a.price) / a.originalPrice
            : 0;
          const discB = b.originalPrice
            ? (b.originalPrice - b.price) / b.originalPrice
            : 0;
          return discB - discA;
        });
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popularity':
      default:
        return list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
  }, [filteredProducts, activeSort]);

  const handleSelectCategory = catId => {
    setSelectedCategoryId(catId);
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setAppliedFilters({
      priceRange: 'all',
      discountOnly: false,
      rating: 'all',
      inStockOnly: false,
    });
  };

  const handleResetAll = () => {
    setSelectedCategoryId('all');
    setSearchQuery('');
    handleClearFilters();
    setActiveSort('popularity');
  };

  const handleNavigateCart = () => {
    navigation.navigate('MainTabs', { screen: 'Cart' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.container}>
        {/* 1. Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerTitles}>
              <Text style={styles.title} numberOfLines={1}>
                {currentCategory ? currentCategory.name : screenTitle}
              </Text>
              <View style={styles.locationSnippetRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText} numberOfLines={1}>
                  Delivering to: {selectedAddress?.shortAddress || 'Your Address'}
                </Text>
              </View>
            </View>
          </View>

          {/* Filter Modal Trigger */}
          <TouchableOpacity
            style={[
              styles.filterHeaderBtn,
              activeFilterCount > 0 && styles.filterHeaderBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setFilterModalVisible(true)}>
            <Text style={styles.filterHeaderIcon}>🌪️</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Product Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search vegetables..."
        />

        {/* 3. Category Switcher Pills */}
        <CategoryPills
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />

        {/* 4. Sorting & Filter Bar */}
        <SortFilterBar
          activeSort={activeSort}
          onSelectSort={setActiveSort}
          onPressFilter={() => setFilterModalVisible(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Active Filter Summary Bar */}
        {activeFilterCount > 0 && (
          <View style={styles.activeFilterPillBar}>
            <Text style={styles.activeFilterPillText}>
              Filters active: {activeFilterCount} applied
            </Text>
            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={styles.activeFilterPillClear}>Clear Filters ✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Product Grid Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Item Count & Subheading */}
          <View style={styles.itemCountHeader}>
            <Text style={styles.itemCountText}>
              Showing {sortedProducts.length} vegetable
              {sortedProducts.length === 1 ? '' : 's'}
              {currentCategory ? ` in ${currentCategory.name}` : ''}
            </Text>
            <Text style={styles.sortIndicator}>
              {activeSort === 'price_asc'
                ? '• Price: Low to High'
                : activeSort === 'price_desc'
                ? '• Price: High to Low'
                : activeSort === 'highest_discount'
                ? '• Highest Discount'
                : activeSort === 'rating'
                ? '• Top Rated'
                : '• Popular'}
            </Text>
          </View>

          {/* 5. Product Grid or Empty State */}
          {sortedProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🥬🔍</Text>
              <Text style={styles.emptyTitle}>No Vegetables Found</Text>
              <Text style={styles.emptySubtitle}>
                We couldn't find any items matching your active search or
                filters.
              </Text>
              <TouchableOpacity
                style={styles.resetBtn}
                activeOpacity={0.8}
                onPress={handleResetAll}>
                <Text style={styles.resetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {sortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="grid"
                  onPress={item =>
                    navigation.navigate('ProductDetails', { product: item })
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Floating Cart Mini-Bar */}
        {cartCount > 0 && (
          <View style={styles.floatingCartContainer}>
            <TouchableOpacity
              style={styles.floatingCartBar}
              activeOpacity={0.9}
              onPress={handleNavigateCart}>
              <View style={styles.cartInfoLeft}>
                <View style={styles.cartCountBadge}>
                  <Text style={styles.cartCountText}>{cartCount}</Text>
                </View>
                <View style={styles.cartTexts}>
                  <Text style={styles.cartItemsCount}>
                    {cartCount} {cartCount === 1 ? 'item' : 'items'} in basket
                  </Text>
                  <Text style={styles.cartSubtotalText}>₹{cartSubtotal}</Text>
                </View>
              </View>
              <View style={styles.cartActionRight}>
                <Text style={styles.viewCartText}>View Cart</Text>
                <Text style={styles.viewCartArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Modal */}
        <ProductFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          currentFilters={appliedFilters}
          onApplyFilters={setAppliedFilters}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  backArrow: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  locationSnippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationIcon: {
    fontSize: 11,
    marginRight: 3,
  },
  locationText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  filterHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
  },
  filterHeaderBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterHeaderIcon: {
    fontSize: 16,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  filterBadgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  activeFilterPillBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  activeFilterPillText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  activeFilterPillClear: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  itemCountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  itemCountText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.semiBold,
  },
  sortIndicator: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  resetBtnText: {
    color: colors.textInverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 12,
    left: spacing.md,
    right: spacing.md,
    zIndex: 99,
  },
  floatingCartBar: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  cartInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartCountBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cartCountText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  cartTexts: {
    justifyContent: 'center',
  },
  cartItemsCount: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  cartSubtotalText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  cartActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    color: colors.textInverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginRight: 4,
  },
  viewCartArrow: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
});

export default ProductListingScreen;
