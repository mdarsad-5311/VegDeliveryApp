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
import {
  SearchBar,
  ProductCard,
} from '../../components/home';
import {
  CategoryCard,
  SortFilterBar,
  CategoryPills,
} from '../../components/categories';
import {
  VEG_CATEGORIES,
  ALL_PRODUCTS,
} from '../../constants/mockData';

export const CategoriesScreen = ({ navigation, route }) => {
  const { cartCount, cartSubtotal, selectedAddress } = useAppContext();

  // State
  const initialCategory = route?.params?.categoryId || 'all';
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('popularity');

  // Sync if route params change
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

  // Filter products by selected category
  const categoryProducts = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return ALL_PRODUCTS;
    }
    return ALL_PRODUCTS.filter(p => p.categoryId === selectedCategoryId);
  }, [selectedCategoryId]);

  // Filter products by search query
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

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...searchedProducts];
    switch (activeSort) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'popularity':
      default:
        return list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
  }, [searchedProducts, activeSort]);

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
                  Delivering to: {selectedAddress?.shortAddress || 'Your Address'}
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

        {/* 3. Category Switcher Pills */}
        <CategoryPills
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
          contentContainerStyle={styles.scrollContent}>
          {/* VIEW A: All Categories Cards Overview (when 'all' is selected and no search) */}
          {selectedCategoryId === 'all' && !searchQuery.trim() && (
            <View style={styles.overviewSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Main Vegetable Categories</Text>
                <Text style={styles.sectionSub}>
                  Select a category to view fresh items
                </Text>
              </View>

              {/* 4 Main Category Cards */}
              {VEG_CATEGORIES.map(cat => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onPress={() => handleSelectCategory(cat.id)}
                />
              ))}

              <View style={styles.allProductsHeader}>
                <View style={styles.allProductsHeaderTitleCol}>
                  <Text style={styles.sectionTitle}>All Fresh Farm Products</Text>
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
          {selectedCategoryId !== 'all' && !searchQuery.trim() && currentCategory && (
            <View style={styles.categoryBanner}>
              <View style={styles.categoryBannerLeft}>
                <View
                  style={[
                    styles.bannerIconCircle,
                    { backgroundColor: currentCategory.bgColor },
                  ]}>
                  <Text style={styles.bannerEmoji}>{currentCategory.icon}</Text>
                </View>
                <View style={styles.bannerTexts}>
                  <Text style={styles.bannerTitle}>{currentCategory.name}</Text>
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
                Showing results for "{searchQuery}" ({sortedProducts.length} found)
              </Text>
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.searchActiveClear}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Product Grid or Empty State */}
          {sortedProducts.length === 0 ? (
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
                    navigation.navigate('ProductDetails', { product: p })
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
    fontSize: 18,
    color: colors.primary,
    fontWeight: typography.weights.bold,
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
  scrollContent: {
    paddingBottom: 90,
  },
  overviewSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  allProductsHeaderTitleCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  fullGridBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  fullGridBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  sectionCount: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginLeft: 6,
  },
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  bannerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  bannerEmoji: {
    fontSize: 26,
  },
  bannerTexts: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  bannerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  bannerCountBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingVertical: 8,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  searchActiveText: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.weights.semiBold,
    flex: 1,
  },
  searchActiveClear: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
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
    marginBottom: spacing.lg,
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
