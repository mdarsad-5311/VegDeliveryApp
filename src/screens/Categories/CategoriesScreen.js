import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/theme';
import useAppContext from '../../hooks/useAppContext';
import { SearchBar, ProductCard } from '../../components/home';
import {
  CategoryCard,
  SortFilterBar,
  CategoryPills,
} from '../../components/categories';
import { VEG_CATEGORIES, ALL_PRODUCTS } from '../../constants/mockData';
import {
  categoryAPI,
  productAPI,
  normalizeCategory,
  normalizeProduct,
  formatApiError,
} from '../../services';

export const CategoriesScreen = ({ navigation, route }) => {
  const { cartCount, cartSubtotal, selectedAddress } = useAppContext();

  // State
  const initialCategory = route?.params?.categoryId || 'all';
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('popularity');

  // Backend Data State
  const [categories, setCategories] = useState(VEG_CATEGORIES);
  const [products, setProducts] = useState(ALL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Search & Race Protection State
  const [isSearching, setIsSearching] = useState(false);
  const [backendSearchResults, setBackendSearchResults] = useState(null);
  const searchReqIdRef = useRef(0);

  // Sync if route params change
  useEffect(() => {
    if (route?.params?.categoryId) {
      setSelectedCategoryId(route.params.categoryId);
    }
  }, [route?.params?.categoryId]);

  // Fetch Categories from Backend
  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll();
      const raw = Array.isArray(res.data) ? res.data : res.data.results || [];
      if (raw.length > 0) {
        setCategories(raw.map(normalizeCategory));
      }
    } catch (_) {
      // Fallback kept
    }
  }, []);

  // Fetch Products based on selected category, sort, and search
  const fetchProducts = useCallback(
    async (isPullRefresh = false) => {
      if (isPullRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setApiError(null);

      try {
        const params = { page_size: 50 };

        if (selectedCategoryId !== 'all') {
          params.category = selectedCategoryId;
        }

        if (activeSort === 'price_asc') {
          params.ordering = 'price';
        } else if (activeSort === 'price_desc') {
          params.ordering = '-price';
        } else if (activeSort === 'popularity') {
          params.ordering = '-created_at';
        }

        const res = await productAPI.getAll(params);
        const raw = Array.isArray(res.data) ? res.data : res.data.results || [];
        if (raw.length > 0) {
          setProducts(raw.map(normalizeProduct));
        } else if (selectedCategoryId !== 'all') {
          // If category has no items on backend, set empty array
          setProducts([]);
        }
      } catch (err) {
        setApiError(formatApiError(err));
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategoryId, activeSort],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Current category object
  const currentCategory = useMemo(() => {
    if (selectedCategoryId === 'all') return null;
    return (
      categories.find(
        c => c.id === selectedCategoryId || c.slug === selectedCategoryId,
      ) || null
    );
  }, [selectedCategoryId, categories]);

  // Search handling with debounce and race-condition protection
  useEffect(() => {
    if (!searchQuery.trim()) {
      setBackendSearchResults(null);
      setIsSearching(false);
      return;
    }

    const currentReqId = ++searchReqIdRef.current;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const params = {};
        if (selectedCategoryId !== 'all') {
          params.category = selectedCategoryId;
        }
        const res = await productAPI.search(searchQuery.trim(), params);
        if (currentReqId === searchReqIdRef.current) {
          const raw = Array.isArray(res.data)
            ? res.data
            : res.data.results || [];
          setBackendSearchResults(raw.map(normalizeProduct));
          setIsSearching(false);
        }
      } catch (err) {
        if (currentReqId === searchReqIdRef.current) {
          // Fallback to local filter
          const q = searchQuery.toLowerCase().trim();
          const fallback = products.filter(
            p =>
              p.name.toLowerCase().includes(q) ||
              (p.category && p.category.toLowerCase().includes(q)) ||
              (p.tag && p.tag.toLowerCase().includes(q)) ||
              (p.description && p.description.toLowerCase().includes(q)),
          );
          setBackendSearchResults(fallback);
          setIsSearching(false);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategoryId, products]);

  // Combined product list (searched or active products)
  const activeProducts = useMemo(() => {
    if (backendSearchResults !== null) return backendSearchResults;
    return products;
  }, [backendSearchResults, products]);

  // Sort products client-side for immediate responsive feedback
  const sortedProducts = useMemo(() => {
    const list = [...activeProducts];
    switch (activeSort) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popularity':
      default:
        return list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
  }, [activeProducts, activeSort]);

  // Handle select category
  const handleSelectCategory = catId => {
    setSelectedCategoryId(catId);
    setSearchQuery('');
  };

  const handleBackToAll = () => {
    setSelectedCategoryId('all');
    setSearchQuery('');
  };

  const handleNavigateCart = () => {
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.container}>
        {/* 1. Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {selectedCategoryId !== 'all' ? (
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={handleBackToAll}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
            ) : null}
            <View>
              <Text style={styles.title}>Shop by Category</Text>
              <View style={styles.locationSnippetRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText} numberOfLines={1}>
                  Delivering to:{' '}
                  {selectedAddress?.shortAddress || 'Your Address'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={
            currentCategory
              ? `Search in ${currentCategory.name}...`
              : 'Search in all categories...'
          }
        />

        {/* API Error Banner (if offline/unreachable) */}
        {apiError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              Unable to reach live catalog server. Showing offline items.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchProducts()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 3. Category Switcher Pills */}
        <CategoryPills
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />

        {/* 4. Sort Filter Bar (when viewing products) */}
        <SortFilterBar
          activeSort={activeSort}
          onSelectSort={setActiveSort}
        />

        {/* Main Content Area */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchProducts(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }>
          {/* VIEW A: All Categories Cards Overview (when 'all' is selected and no search) */}
          {selectedCategoryId === 'all' && !searchQuery.trim() && (
            <View style={styles.overviewSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Main Vegetable Categories
                </Text>
                <Text style={styles.sectionSub}>
                  Select a category to view fresh items
                </Text>
              </View>

              {/* Category Cards */}
              {categories.map(cat => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onPress={() => handleSelectCategory(cat.id)}
                />
              ))}

              <View style={styles.allProductsHeader}>
                <View style={styles.allProductsHeaderTitleCol}>
                  <Text style={styles.sectionTitle}>
                    All Fresh Farm Products
                  </Text>
                  <Text style={styles.sectionCount}>
                    ({sortedProducts.length} items available)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.fullGridBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('ProductListing', {
                      categoryId: 'all',
                      title: 'All Vegetables Grid',
                    })
                  }>
                  <Text style={styles.fullGridBtnText}>Full Grid ⊞</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* VIEW B: Category-wise Header when category is selected */}
          {selectedCategoryId !== 'all' &&
            !searchQuery.trim() &&
            currentCategory && (
              <View style={styles.categoryBanner}>
                <View style={styles.categoryBannerLeft}>
                  <View
                    style={[
                      styles.bannerIconCircle,
                      { backgroundColor: currentCategory.bgColor },
                    ]}>
                    <Text style={styles.bannerEmoji}>
                      {currentCategory.icon}
                    </Text>
                  </View>
                  <View style={styles.bannerTexts}>
                    <Text style={styles.bannerTitle}>
                      {currentCategory.name}
                    </Text>
                    <Text style={styles.bannerSubtitle}>
                      {currentCategory.description}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.bannerCountBadge}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('ProductListing', {
                      categoryId: currentCategory.id,
                      title: currentCategory.name,
                    })
                  }>
                  <Text style={styles.bannerCountText}>
                    {sortedProducts.length} items ⊞
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* Search Active Notification */}
          {searchQuery.trim().length > 0 && (
            <View style={styles.searchActiveBar}>
              <Text style={styles.searchActiveText}>
                {isSearching
                  ? `Searching for "${searchQuery}"...`
                  : `Showing results for "${searchQuery}" (${sortedProducts.length} found)`}
              </Text>
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.searchActiveClear}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading Indicator */}
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading fresh produce...</Text>
            </View>
          ) : sortedProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍🥦</Text>
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                We couldn't find any products matching "{searchQuery}" in{' '}
                {currentCategory ? currentCategory.name : 'this category'}.
              </Text>
              <TouchableOpacity
                style={styles.clearFilterButton}
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategoryId('all');
                }}>
                <Text style={styles.clearFilterText}>Show All Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {sortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="grid"
                  onPress={p =>
                    navigation.navigate('ProductDetails', {
                      product: p,
                      productId: p.id,
                    })
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
    fontSize: 20,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
    marginTop: -2,
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
    fontSize: 10,
    marginRight: 4,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSecondary,
    maxWidth: 220,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    color: '#E65100',
    marginRight: spacing.sm,
  },
  retryButton: {
    backgroundColor: '#E65100',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  retryText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  overviewSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sectionSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  allProductsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  allProductsHeaderTitleCol: {
    flex: 1,
  },
  sectionCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  fullGridBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  fullGridBtnText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  categoryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  bannerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  bannerEmoji: {
    fontSize: 20,
  },
  bannerTexts: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  bannerSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  bannerCountBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  bannerCountText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  searchActiveBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  searchActiveText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
  },
  searchActiveClear: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.md,
  },
  clearFilterButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  clearFilterText: {
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

export default CategoriesScreen;
