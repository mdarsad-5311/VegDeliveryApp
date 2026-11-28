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
import {
  HomeHeader,
  SearchBar,
  BannerCarousel,
  CategoryItem,
  SectionHeader,
  ProductCard,
  LocationModal,
  NotificationsModal,
} from '../../components/home';
import {
  VEG_CATEGORIES,
  POPULAR_VEGETABLES,
  BEST_SELLING_PRODUCTS,
  RECOMMENDED_PRODUCTS,
} from '../../constants/mockData';
import {
  categoryAPI,
  productAPI,
  normalizeCategory,
  normalizeProduct,
  formatApiError,
} from '../../services';

export const HomeScreen = ({ navigation }) => {
  const { cartCount, cartSubtotal } = useAppContext();

  // Catalog State
  const [categories, setCategories] = useState(VEG_CATEGORIES);
  const [popularProducts, setPopularProducts] = useState(POPULAR_VEGETABLES);
  const [bestSellingProducts, setBestSellingProducts] = useState(BEST_SELLING_PRODUCTS);
  const [recommendedProducts, setRecommendedProducts] = useState(RECOMMENDED_PRODUCTS);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Search State & Race Condition Protection
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [backendSearchResults, setBackendSearchResults] = useState(null);
  const searchReqIdRef = useRef(0);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modals state
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);

  // Fetch catalog data from backend API
  const fetchCatalogData = useCallback(async (isPullRefresh = false) => {
    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setApiError(null);

    try {
      const [catRes, popRes, bestRes, recRes] = await Promise.allSettled([
        categoryAPI.getAll(),
        productAPI.getAll({ page_size: 10, ordering: '-created_at' }),
        productAPI.getFeatured({ page_size: 10 }),
        productAPI.getAll({ page_size: 20 }),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value?.data) {
        const rawCats = Array.isArray(catRes.value.data)
          ? catRes.value.data
          : catRes.value.data.results || [];
        if (rawCats.length > 0) {
          setCategories(rawCats.map(normalizeCategory));
        }
      }

      if (popRes.status === 'fulfilled' && popRes.value?.data) {
        const rawPop = Array.isArray(popRes.value.data)
          ? popRes.value.data
          : popRes.value.data.results || [];
        if (rawPop.length > 0) {
          setPopularProducts(rawPop.map(normalizeProduct));
        }
      }

      if (bestRes.status === 'fulfilled' && bestRes.value?.data) {
        const rawBest = Array.isArray(bestRes.value.data)
          ? bestRes.value.data
          : bestRes.value.data.results || [];
        if (rawBest.length > 0) {
          setBestSellingProducts(rawBest.map(normalizeProduct));
        }
      }

      if (recRes.status === 'fulfilled' && recRes.value?.data) {
        const rawRec = Array.isArray(recRes.value.data)
          ? recRes.value.data
          : recRes.value.data.results || [];
        if (rawRec.length > 0) {
          setRecommendedProducts(rawRec.map(normalizeProduct));
        }
      }
    } catch (err) {
      setApiError(formatApiError(err));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  // Combine all active products for local search fallback, deduplicated by product id
  const allProducts = useMemo(() => {
    const map = new Map();
    [...popularProducts, ...bestSellingProducts, ...recommendedProducts].forEach(
      item => {
        if (item && item.id != null && !map.has(item.id)) {
          map.set(item.id, item);
        }
      },
    );
    return Array.from(map.values());
  }, [popularProducts, bestSellingProducts, recommendedProducts]);

  // Backend search with debouncing & race-condition protection
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
        const res = await productAPI.search(searchQuery.trim());
        if (currentReqId === searchReqIdRef.current) {
          const raw = Array.isArray(res.data)
            ? res.data
            : res.data.results || [];
          setBackendSearchResults(raw.map(normalizeProduct));
          setIsSearching(false);
        }
      } catch (err) {
        if (currentReqId === searchReqIdRef.current) {
          // Fallback to local search if backend is unreachable
          const q = searchQuery.toLowerCase().trim();
          const fallback = allProducts.filter(
            item =>
              item.name.toLowerCase().includes(q) ||
              (item.category && item.category.toLowerCase().includes(q)) ||
              (item.tag && item.tag.toLowerCase().includes(q)) ||
              (item.description && item.description.toLowerCase().includes(q)),
          );
          setBackendSearchResults(fallback);
          setIsSearching(false);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, allProducts]);

  // Filtered search results, strictly deduplicated by product id
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const sourceList =
      backendSearchResults !== null
        ? backendSearchResults
        : (() => {
            const q = searchQuery.toLowerCase().trim();
            return allProducts.filter(
              item =>
                (item.name && item.name.toLowerCase().includes(q)) ||
                (item.category && item.category.toLowerCase().includes(q)) ||
                (item.tag && item.tag.toLowerCase().includes(q)) ||
                (item.description && item.description.toLowerCase().includes(q)),
            );
          })();

    const seenIds = new Set();
    return sourceList.filter(item => {
      if (!item || item.id == null) return false;
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
  }, [searchQuery, backendSearchResults, allProducts]);

  // Handle Category Click -> Navigates to Category screen with category selected
  const handleCategoryPress = category => {
    navigation.navigate('Categories', { categoryId: category.id });
  };

  // Filter products by selected category if active
  const displayedRecommended = useMemo(() => {
    if (!selectedCategory) return recommendedProducts;
    const catName = selectedCategory.name.toLowerCase();
    const filtered = recommendedProducts.filter(
      p =>
        (p.category && p.category.toLowerCase().includes(catName)) ||
        p.categoryId === selectedCategory.id,
    );
    return filtered.length > 0 ? filtered : recommendedProducts;
  }, [selectedCategory, recommendedProducts]);

  const handleBannerPress = banner => {
    navigation.navigate('ProductListing', {
      categoryId: 'all',
      title: banner.title || 'Special Offers',
    });
  };

  const handleExplorePopular = () => {
    navigation.navigate('ProductListing', {
      categoryId: 'all',
      sort: 'popularity',
      title: 'Popular Vegetables',
    });
  };

  const handleViewAllBestSelling = () => {
    navigation.navigate('ProductListing', {
      categoryId: 'all',
      sort: 'highest_discount',
      title: 'Best-Selling Vegetables',
    });
  };

  const handleViewAllRecommended = () => {
    navigation.navigate('ProductListing', {
      categoryId: selectedCategory ? selectedCategory.id : 'all',
      sort: 'rating',
      title: selectedCategory
        ? `${selectedCategory.name}`
        : 'Recommended Vegetables',
    });
  };

  const handleNavigateCart = () => {
    navigation.navigate('Cart');
  };

  const handleNavigateCategories = () => {
    navigation.navigate('Categories');
  };

  const handleProductPress = product => {
    navigation.navigate('ProductDetails', { product, productId: product.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.container}>
        {/* 1. Header Section */}
        <HomeHeader
          onPressLocation={() => setLocationModalVisible(true)}
          onPressNotifications={() => setNotificationsModalVisible(true)}
        />

        {/* 2. Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* API Error Notification Banner (if any) */}
        {apiError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              Unable to sync live catalog with backend. Showing cached items.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchCatalogData()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCatalogData(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }>
          {/* SEARCH ACTIVE VIEW */}
          {searchQuery.trim().length > 0 ? (
            <View style={styles.searchResultsContainer}>
              <View style={styles.searchHeader}>
                <Text style={styles.searchCountText}>
                  {isSearching
                    ? `Searching for "${searchQuery}"...`
                    : `Found ${searchResults.length} result${
                        searchResults.length === 1 ? '' : 's'
                      } for "${searchQuery}"`}
                </Text>
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchText}>Clear</Text>
                </TouchableOpacity>
              </View>

              {isSearching ? (
                <View style={styles.searchLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.searchLoadingText}>
                    Searching live vegetables catalog...
                  </Text>
                </View>
              ) : searchResults.length === 0 ? (
                <View style={styles.emptySearch}>
                  <Text style={styles.emptyEmoji}>🥬🔍</Text>
                  <Text style={styles.emptyTitle}>No Vegetables Found</Text>
                  <Text style={styles.emptySubtitle}>
                    We couldn't find any products matching "{searchQuery}". Try
                    searching for tomato, carrot, spinach, or organic greens.
                  </Text>
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {searchResults.map(item => (
                    <ProductCard
                      key={`search-prod-${item.id}`}
                      product={item}
                      variant="grid"
                      onPress={handleProductPress}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            /* NORMAL HOME VIEW */
            <>
              {/* 3. Promotional Banners Carousel */}
              <BannerCarousel onBannerPress={handleBannerPress} />

              {/* 4. Vegetable Categories */}
              <SectionHeader
                title="Fresh Categories"
                subtitle="Sorted farm-fresh daily"
                actionText="See All"
                onActionPress={handleNavigateCategories}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}>
                {categories.map(category => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory?.id === category.id}
                    onPress={handleCategoryPress}
                  />
                ))}
              </ScrollView>

              {/* Category Active Filter Bar */}
              {selectedCategory && (
                <View style={styles.activeFilterPill}>
                  <Text style={styles.activeFilterText}>
                    Showing: {selectedCategory.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                    <Text style={styles.activeFilterClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 5. Popular Vegetables */}
              <SectionHeader
                title="Popular Vegetables"
                subtitle="Daily kitchen essentials at best prices"
                actionText="Explore"
                onActionPress={handleExplorePopular}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalProductsScroll}>
                {popularProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="compact"
                    onPress={handleProductPress}
                  />
                ))}
              </ScrollView>

              {/* 6. Best-Selling Products */}
              <SectionHeader
                title="Best-Selling Products"
                subtitle="Customer favorites with special discounts"
                actionText="View All"
                onActionPress={handleViewAllBestSelling}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalProductsScroll}>
                {bestSellingProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="featured"
                    onPress={handleProductPress}
                  />
                ))}
              </ScrollView>

              {/* 7. Recommended Products */}
              <SectionHeader
                title="Recommended for You"
                subtitle="Freshly curated recommendations"
                actionText="View All"
                onActionPress={handleViewAllRecommended}
              />
              <View style={styles.gridContainer}>
                {displayedRecommended.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="grid"
                    onPress={handleProductPress}
                  />
                ))}
              </View>

              {/* Trust & Guarantee Banner */}
              <View style={styles.trustBanner}>
                <View style={styles.trustItem}>
                  <Text style={styles.trustIcon}>🌱</Text>
                  <Text style={styles.trustTitle}>100% Organic</Text>
                  <Text style={styles.trustSub}>Direct Farm Sourced</Text>
                </View>
                <View style={styles.trustDivider} />
                <View style={styles.trustItem}>
                  <Text style={styles.trustIcon}>⚡</Text>
                  <Text style={styles.trustTitle}>30 Min Delivery</Text>
                  <Text style={styles.trustSub}>Safe & Temperature Packed</Text>
                </View>
                <View style={styles.trustDivider} />
                <View style={styles.trustItem}>
                  <Text style={styles.trustIcon}>🔄</Text>
                  <Text style={styles.trustTitle}>No-Question Return</Text>
                  <Text style={styles.trustSub}>Instant Refund</Text>
                </View>
              </View>
            </>
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

        {/* Location Selection Modal */}
        <LocationModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
        />

        {/* Notifications Modal */}
        <NotificationsModal
          visible={notificationsModalVisible}
          onClose={() => setNotificationsModalVisible(false)}
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
  scrollContent: {
    paddingBottom: 90,
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
  categoriesScroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  activeFilterClose: {
    fontSize: 14,
    color: colors.primaryDark,
    paddingHorizontal: 4,
  },
  horizontalProductsScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  trustBanner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  trustIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  trustSub: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  trustDivider: {
    width: 1,
    height: '70%',
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
  },
  searchResultsContainer: {
    paddingTop: spacing.xs,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchCountText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  clearSearchText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  searchLoadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
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

export default HomeScreen;
