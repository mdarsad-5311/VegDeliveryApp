import {
  categoryAPI,
  productAPI,
  normalizeCategory,
  normalizeProduct,
  resolveImageUrl,
  getFallbackEmoji,
  getCategoryIcon,
  getMediaBaseURL,
  formatApiError,
  apiClient,
} from '../src/services';

describe('Phase 3A: Product Catalog API & Normalization Suite', () => {
  const originalGet = apiClient.get;

  afterEach(() => {
    apiClient.get = originalGet;
    jest.clearAllMocks();
  });

  describe('Category API', () => {
    it('calls GET /categories/ via categoryAPI.getAll', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Leafy Vegetables',
          slug: 'leafy-vegetables',
          description: 'Fresh organic greens',
          image: '/media/categories/leafy.jpg',
          is_active: true,
          products_count: 5,
        },
      ];

      apiClient.get = jest.fn().mockResolvedValueOnce({ data: mockCategories });

      const res = await categoryAPI.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('/categories/', { params: {} });
      expect(res.data).toEqual(mockCategories);
    });

    it('calls GET /categories/:id/ via categoryAPI.getById', async () => {
      const mockCategory = {
        id: 2,
        name: 'Root Vegetables',
        slug: 'root-vegetables',
        image: null,
      };

      apiClient.get = jest.fn().mockResolvedValueOnce({ data: mockCategory });

      const res = await categoryAPI.getById(2);
      expect(apiClient.get).toHaveBeenCalledWith('/categories/2/');
      expect(res.data).toEqual(mockCategory);
    });

    it('normalizes category with image, fallback icon and count', () => {
      const raw = {
        id: 3,
        name: 'Seasonal Harvest',
        slug: 'seasonal-harvest',
        description: 'Veggies in season',
        image: '/media/categories/season.png',
        products_count: 8,
        is_active: true,
      };

      const normalized = normalizeCategory(raw);
      expect(normalized.id).toBe(3);
      expect(normalized.name).toBe('Seasonal Harvest');
      expect(normalized.shortName).toBe('Seasonal');
      expect(normalized.icon).toBe('🌽');
      expect(normalized.itemCount).toBe(8);
      expect(normalized.image).toContain('/media/categories/season.png');
      expect(normalized.bgColor).toBeDefined();
    });
  });

  describe('Product API', () => {
    it('calls GET /products/ with params via productAPI.getAll', async () => {
      apiClient.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { results: [], count: 0 } });

      await productAPI.getAll({ category: 2, ordering: 'price' });
      expect(apiClient.get).toHaveBeenCalledWith('/products/', {
        params: { category: 2, ordering: 'price' },
      });
    });

    it('calls GET /products/:id/ via productAPI.getById', async () => {
      const mockProduct = { id: 10, name: 'Farm Spinach', price: '30.00' };
      apiClient.get = jest.fn().mockResolvedValueOnce({ data: mockProduct });

      const res = await productAPI.getById(10);
      expect(apiClient.get).toHaveBeenCalledWith('/products/10/');
      expect(res.data).toEqual(mockProduct);
    });

    it('calls GET /products/ with is_featured=true via productAPI.getFeatured', async () => {
      apiClient.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { results: [] } });

      await productAPI.getFeatured({ page_size: 5 });
      expect(apiClient.get).toHaveBeenCalledWith('/products/', {
        params: { is_featured: true, page_size: 5 },
      });
    });

    it('calls GET /products/ with search query via productAPI.search', async () => {
      apiClient.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { results: [] } });

      await productAPI.search('tomato', { category: 1 });
      expect(apiClient.get).toHaveBeenCalledWith('/products/', {
        params: { search: 'tomato', category: 1 },
      });
    });

    it('normalizes product with pricing, discount badge, stock and fallback emoji', () => {
      const backendProduct = {
        id: 101,
        name: 'Organic Tomatoes',
        slug: 'organic-tomatoes',
        sku: 'VEG-TOM-001',
        category: 1,
        category_details: {
          id: 1,
          name: 'Daily Vegetables',
          slug: 'daily-vegetables',
        },
        description: 'Juicy ripe tomatoes',
        image: '/media/products/tomato.jpg',
        price: '40.00',
        discount_price: '30.00',
        effective_price: '30.00',
        final_price: '30.00',
        unit: '1 kg',
        stock_quantity: 25,
        is_available: true,
        is_active: true,
        is_featured: true,
        in_stock: true,
      };

      const normalized = normalizeProduct(backendProduct);

      expect(normalized.id).toBe(101);
      expect(normalized.name).toBe('Organic Tomatoes');
      expect(normalized.price).toBe(30);
      expect(normalized.originalPrice).toBe(40);
      expect(normalized.discountBadge).toBe('25% OFF');
      expect(normalized.availableStock).toBe(25);
      expect(normalized.inStock).toBe(true);
      expect(normalized.stockStatus).toBe('in_stock');
      expect(normalized.emoji).toBe('🍅');
      expect(normalized.isFeatured).toBe(true);
      expect(normalized.image).toContain('/media/products/tomato.jpg');
    });

    it('normalizes non-discounted product correctly', () => {
      const backendProduct = {
        id: 102,
        name: 'Fresh Carrots',
        price: '50.00',
        discount_price: null,
        final_price: '50.00',
        stock_quantity: 0,
        is_available: false,
      };

      const normalized = normalizeProduct(backendProduct);
      expect(normalized.price).toBe(50);
      expect(normalized.originalPrice).toBeNull();
      expect(normalized.discountBadge).toBeNull();
      expect(normalized.inStock).toBe(false);
      expect(normalized.stockStatus).toBe('out_of_stock');
      expect(normalized.emoji).toBe('🥕');
    });
  });

  describe('Image URL Resolution', () => {
    it('resolves relative /media/ URLs using base media URL', () => {
      const resolved = resolveImageUrl('/media/products/cabbage.jpg');
      expect(resolved).toBeTruthy();
      expect(resolved).toContain('/media/products/cabbage.jpg');
      expect(resolved.startsWith('http://') || resolved.startsWith('https://')).toBe(true);
    });

    it('preserves valid absolute http/https URLs', () => {
      const url = 'https://cdn.freshveg.in/images/carrots.png';
      expect(resolveImageUrl(url)).toBe(url);
    });

    it('returns null for empty, null, or invalid image URIs', () => {
      expect(resolveImageUrl(null)).toBeNull();
      expect(resolveImageUrl(undefined)).toBeNull();
      expect(resolveImageUrl('')).toBeNull();
      expect(resolveImageUrl('   ')).toBeNull();
    });

    it('returns valid mediaBaseURL stripped of /api', () => {
      const mediaBase = getMediaBaseURL();
      expect(mediaBase.endsWith('/api')).toBe(false);
    });
  });

  describe('Emoji & Icon Fallbacks', () => {
    it('returns appropriate vegetable emojis based on keyword matching', () => {
      expect(getFallbackEmoji('Organic Spinach')).toBe('🥬');
      expect(getFallbackEmoji('Red Ripe Tomato')).toBe('🍅');
      expect(getFallbackEmoji('Farm Potato')).toBe('🥔');
      expect(getFallbackEmoji('Sweet Corn')).toBe('🌽');
      expect(getFallbackEmoji('Green Broccoli')).toBe('🥦');
      expect(getFallbackEmoji('Hot Green Chilli')).toBe('🌶️');
      expect(getFallbackEmoji('Fresh Ginger')).toBe('🫚');
      expect(getFallbackEmoji('White Garlic')).toBe('🧄');
      expect(getFallbackEmoji('Mushroom Button')).toBe('🍄');
      expect(getFallbackEmoji('Fresh Onion')).toBe('🧅');
      expect(getFallbackEmoji('Exotic Herb')).toBe('🥦');
    });

    it('returns appropriate category icons', () => {
      expect(getCategoryIcon('Leafy Greens', 'leafy')).toBe('🥬');
      expect(getCategoryIcon('Root Veggies', 'root')).toBe('🥕');
      expect(getCategoryIcon('Seasonal Items', 'seasonal')).toBe('🌽');
      expect(getCategoryIcon('Exotic Produce', 'exotic')).toBe('🥑');
      expect(getCategoryIcon('General Store', 'general')).toBe('🥗');
    });
  });

  describe('API Error Formatting', () => {
    it('formats timeout error', () => {
      const error = { code: 'ECONNABORTED' };
      expect(formatApiError(error)).toContain('timed out');
    });

    it('formats network connection error', () => {
      const error = {};
      expect(formatApiError(error)).toContain('Unable to connect to the FreshVeg server');
    });

    it('formats backend detail string response', () => {
      const error = { response: { data: { detail: 'Category not found.' } } };
      expect(formatApiError(error)).toBe('Category not found.');
    });
  });
});
