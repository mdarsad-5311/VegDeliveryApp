import React, { useState, useMemo } from 'react';
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

export const HomeScreen = ({ navigation }) => {
  const { cartCount, cartSubtotal } = useAppContext();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modals state
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);

  // Combine all products for searching
  const allProducts = useMemo(() => {
    return [
      ...POPULAR_VEGETABLES,
      ...BEST_SELLING_PRODUCTS,
      ...RECOMMENDED_PRODUCTS,
    ];
  }, []);

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allProducts.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.tag && item.tag.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)),
    );
  }, [searchQuery, allProducts]);

  // Handle Category Click -> Navigates to Category screen with category selected
  const handleCategoryPress = category => {
    navigation.navigate('Categories', { categoryId: category.id });
  };

  // Filter products by selected category if active
  const displayedRecommended = useMemo(() => {
    if (!selectedCategory) return RECOMMENDED_PRODUCTS;
    const catName = selectedCategory.name.toLowerCase();
    const filtered = RECOMMENDED_PRODUCTS.filter(p =>
      p.category.toLowerCase().includes(catName),
    );
    return filtered.length > 0 ? filtered : RECOMMENDED_PRODUCTS;
  }, [selectedCategory]);

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
    navigation.navigate('ProductDetails', { product });
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* SEARCH ACTIVE VIEW */}
          {searchQuery.trim().length > 0 ? (
            <View style={styles.searchResultsContainer}>
              <View style={styles.searchHeader}>
                <Text style={styles.searchCountText}>
                  Found {searchResults.length} result
                  {searchResults.length === 1 ? '' : 's'} for "{searchQuery}"
                </Text>
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchText}>Clear</Text>
                </TouchableOpacity>
              </View>

              {searchResults.length === 0 ? (
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
                      key={item.id}
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
                {VEG_CATEGORIES.map(category => (
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
                {POPULAR_VEGETABLES.map(product => (
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
                {BEST_SELLING_PRODUCTS.map(product => (
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
          onAddNewAddress={() => navigation.navigate('AddressList')}
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
    paddingBottom: 90, // Space for bottom tab bar and floating cart
  },
  categoriesScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  horizontalProductsScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  activeFilterText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  activeFilterClose: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: typography.weights.bold,
    paddingLeft: spacing.sm,
  },
  searchResultsContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  searchCountText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  clearSearchText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 54,
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
  },
  trustBanner: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
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
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  trustDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    height: '80%',
    alignSelf: 'center',
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
