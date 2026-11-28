import {
  cartAPI,
  addressAPI,
  normalizeBackendAddress,
  normalizeAddressPayload,
  formatApiError,
  apiClient,
} from '../src/services';
import { getEmojiForProduct } from '../src/context/AppContext';

describe('Phase 3B: Cart & Address API Integration Suite', () => {
  const originalGet = apiClient.get;
  const originalPost = apiClient.post;
  const originalPatch = apiClient.patch;
  const originalDelete = apiClient.delete;

  afterEach(() => {
    apiClient.get = originalGet;
    apiClient.post = originalPost;
    apiClient.patch = originalPatch;
    apiClient.delete = originalDelete;
    jest.clearAllMocks();
  });

  describe('1. Cart API Endpoints', () => {
    it('calls GET /cart/ via cartAPI.getCart', async () => {
      const mockCart = {
        id: 1,
        customer: 10,
        items: [
          {
            id: 101,
            product_id: 1,
            product_name: 'Organic Spinach',
            product_price: '35.00',
            product_image: 'http://localhost:8000/media/products/spinach.jpg',
            quantity: 2,
            unit: '250g',
            subtotal: '70.00',
          },
        ],
        subtotal: '70.00',
        delivery_charge: '30.00',
        discount: '0.00',
        final_total: '100.00',
      };

      apiClient.get = jest.fn().mockResolvedValueOnce({ data: mockCart });

      const res = await cartAPI.getCart();
      expect(apiClient.get).toHaveBeenCalledWith('/cart/');
      expect(res.data).toEqual(mockCart);
      expect(res.data.items.length).toBe(1);
      expect(res.data.final_total).toBe('100.00');
    });

    it('calls POST /cart/add/ with product_id and quantity via cartAPI.addItem', async () => {
      const mockResponse = {
        message: 'Product added to cart',
        item: { id: 102, product_id: 2, quantity: 3, subtotal: '120.00' },
        cart: { id: 1, subtotal: '190.00', delivery_charge: '0.00', final_total: '190.00' },
      };

      apiClient.post = jest.fn().mockResolvedValueOnce({ data: mockResponse });

      const res = await cartAPI.addItem(2, 3);
      expect(apiClient.post).toHaveBeenCalledWith('/cart/add/', {
        product_id: 2,
        quantity: 3,
      });
      expect(res.data).toEqual(mockResponse);
    });

    it('defaults quantity to 1 when adding item without explicit quantity', async () => {
      apiClient.post = jest.fn().mockResolvedValueOnce({ data: { message: 'Added' } });

      await cartAPI.addItem(5);
      expect(apiClient.post).toHaveBeenCalledWith('/cart/add/', {
        product_id: 5,
        quantity: 1,
      });
    });

    it('calls PATCH /cart/update/:id/ with quantity via cartAPI.updateItem', async () => {
      const mockResponse = {
        message: 'Cart item updated',
        item: { id: 102, quantity: 5, subtotal: '200.00' },
        cart: { id: 1, subtotal: '270.00', final_total: '270.00' },
      };

      apiClient.patch = jest.fn().mockResolvedValueOnce({ data: mockResponse });

      const res = await cartAPI.updateItem(102, 5);
      expect(apiClient.patch).toHaveBeenCalledWith('/cart/update/102/', {
        quantity: 5,
      });
      expect(res.data).toEqual(mockResponse);
    });

    it('calls DELETE /cart/remove/:id/ via cartAPI.removeItem', async () => {
      const mockResponse = {
        message: 'Cart item removed',
        cart: { id: 1, items: [], subtotal: '0.00', final_total: '0.00' },
      };

      apiClient.delete = jest.fn().mockResolvedValueOnce({ data: mockResponse });

      const res = await cartAPI.removeItem(102);
      expect(apiClient.delete).toHaveBeenCalledWith('/cart/remove/102/');
      expect(res.data.message).toBe('Cart item removed');
    });

    it('calls POST /cart/clear/ via cartAPI.clearCart', async () => {
      const mockResponse = {
        message: 'Cart cleared successfully',
        cart: { id: 1, items: [], subtotal: '0.00', final_total: '0.00' },
      };

      apiClient.post = jest.fn().mockResolvedValueOnce({ data: mockResponse });

      const res = await cartAPI.clearCart();
      expect(apiClient.post).toHaveBeenCalledWith('/cart/clear/');
      expect(res.data.message).toBe('Cart cleared successfully');
    });
  });

  describe('2. Address API Endpoints', () => {
    it('calls GET /addresses/ via addressAPI.getAll', async () => {
      const mockAddresses = [
        {
          id: 1,
          full_name: 'Kira Sharma',
          phone_number: '9876543210',
          address_line_1: 'Flat 402, Green Meadows',
          address_line_2: 'Baner Road',
          landmark: 'Near D-Mart',
          city: 'Pune',
          state: 'Maharashtra',
          postal_code: '411045',
          address_type: 'home',
          is_default: true,
        },
      ];

      apiClient.get = jest.fn().mockResolvedValueOnce({ data: mockAddresses });

      const res = await addressAPI.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('/addresses/');
      expect(res.data).toEqual(mockAddresses);
    });

    it('calls GET /addresses/:id/ via addressAPI.getById', async () => {
      const mockAddress = {
        id: 2,
        full_name: 'Kira Sharma',
        address_type: 'work',
      };

      apiClient.get = jest.fn().mockResolvedValueOnce({ data: mockAddress });

      const res = await addressAPI.getById(2);
      expect(apiClient.get).toHaveBeenCalledWith('/addresses/2/');
      expect(res.data).toEqual(mockAddress);
    });

    it('calls POST /addresses/ with normalized payload via addressAPI.create', async () => {
      const formInput = {
        fullName: 'Kiran Kumar',
        mobile: '9876543210',
        houseNumber: 'Flat 101, Sunshine Heights',
        street: 'Kothrud Road',
        landmark: 'Near MIT College',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411038',
        type: 'Home',
        isDefault: true,
      };

      const mockCreated = {
        id: 5,
        full_name: 'Kiran Kumar',
        phone_number: '9876543210',
        address_line_1: 'Flat 101, Sunshine Heights',
        address_line_2: 'Kothrud Road',
        landmark: 'Near MIT College',
        city: 'Pune',
        state: 'Maharashtra',
        postal_code: '411038',
        address_type: 'home',
        is_default: true,
      };

      apiClient.post = jest.fn().mockResolvedValueOnce({ data: mockCreated });

      const res = await addressAPI.create(formInput);
      expect(apiClient.post).toHaveBeenCalledWith('/addresses/', {
        full_name: 'Kiran Kumar',
        phone_number: '9876543210',
        address_line_1: 'Flat 101, Sunshine Heights',
        address_line_2: 'Kothrud Road',
        landmark: 'Near MIT College',
        city: 'Pune',
        state: 'Maharashtra',
        postal_code: '411038',
        address_type: 'home',
        is_default: true,
      });
      expect(res.data).toEqual(mockCreated);
    });

    it('calls PATCH /addresses/:id/ with normalized payload via addressAPI.update', async () => {
      const updateData = {
        street: 'New DP Road, Aundh',
        pincode: '411007',
        type: 'Office',
      };

      apiClient.patch = jest.fn().mockResolvedValueOnce({
        data: { id: 5, address_line_2: 'New DP Road, Aundh', address_type: 'work' },
      });

      const res = await addressAPI.update(5, updateData);
      expect(apiClient.patch).toHaveBeenCalledWith('/addresses/5/', expect.objectContaining({
        address_line_2: 'New DP Road, Aundh',
        postal_code: '411007',
        address_type: 'work',
      }));
      expect(res.data.id).toBe(5);
    });

    it('calls DELETE /addresses/:id/ via addressAPI.delete', async () => {
      apiClient.delete = jest.fn().mockResolvedValueOnce({ status: 204 });

      const res = await addressAPI.delete(5);
      expect(apiClient.delete).toHaveBeenCalledWith('/addresses/5/');
      expect(res.status).toBe(204);
    });

    it('calls PATCH /addresses/:id/set-default/ via addressAPI.setDefault', async () => {
      const mockResult = { id: 5, is_default: true };
      apiClient.patch = jest.fn().mockResolvedValueOnce({ data: mockResult });

      const res = await addressAPI.setDefault(5);
      expect(apiClient.patch).toHaveBeenCalledWith('/addresses/5/set-default/');
      expect(res.data.is_default).toBe(true);
    });
  });

  describe('3. Address Schema Normalization', () => {
    it('normalizes backend address to frontend UI structure', () => {
      const backendAddress = {
        id: 12,
        full_name: 'Rohan Deshmukh',
        phone_number: '9822012345',
        address_line_1: 'Plot 42, Model Colony',
        address_line_2: 'Shivajinagar',
        landmark: 'Behind Akashwani',
        city: 'Pune',
        state: 'Maharashtra',
        postal_code: '411005',
        address_type: 'home',
        is_default: true,
      };

      const normalized = normalizeBackendAddress(backendAddress);

      expect(normalized.id).toBe(12);
      expect(normalized.fullName).toBe('Rohan Deshmukh');
      expect(normalized.mobile).toBe('9822012345');
      expect(normalized.phone).toBe('+91 9822012345');
      expect(normalized.type).toBe('Home');
      expect(normalized.icon).toBe('🏠');
      expect(normalized.tag).toBe('DEFAULT');
      expect(normalized.houseNumber).toBe('Plot 42, Model Colony');
      expect(normalized.street).toBe('Shivajinagar');
      expect(normalized.city).toBe('Pune');
      expect(normalized.state).toBe('Maharashtra');
      expect(normalized.pincode).toBe('411005');
      expect(normalized.isDefault).toBe(true);
      expect(normalized.line1).toBe('Plot 42, Model Colony, Shivajinagar');
      expect(normalized.line2).toContain('Behind Akashwani');
      expect(normalized.line2).toContain('Pune, Maharashtra - 411005');
      expect(normalized.fullAddress).toContain('Plot 42, Model Colony');
      expect(normalized._backend).toEqual(backendAddress);
    });

    it('maps work address type to Office with office emoji', () => {
      const backendWorkAddress = {
        id: 15,
        full_name: 'Pooja Patil',
        phone_number: '+91 9850011223',
        address_line_1: 'Tower 3, Cybercity',
        address_line_2: 'Magarpatta',
        city: 'Pune',
        state: 'Maharashtra',
        postal_code: '411028',
        address_type: 'work',
        is_default: false,
      };

      const normalized = normalizeBackendAddress(backendWorkAddress);
      expect(normalized.type).toBe('Office');
      expect(normalized.icon).toBe('🏢');
      expect(normalized.tag).toBe('OFFICE');
      expect(normalized.isDefault).toBe(false);
      expect(normalized.phone).toBe('+91 9850011223');
    });

    it('unwraps response object when address is nested under address key', () => {
      const responseData = {
        message: 'Address created successfully.',
        address: {
          id: 20,
          full_name: 'Sneha Kulkarni',
          phone_number: '9890012345',
          address_line_1: 'Flat 502, Orchid Towers',
          address_line_2: 'Baner',
          city: 'Pune',
          state: 'Maharashtra',
          postal_code: '411045',
          address_type: 'home',
          is_default: true,
        },
      };

      const normalized = normalizeBackendAddress(responseData);
      expect(normalized.id).toBe(20);
      expect(normalized.fullName).toBe('Sneha Kulkarni');
      expect(normalized.isDefault).toBe(true);
      expect(normalized.type).toBe('Home');
    });

    it('normalizes frontend form data to DRF AddressSerializer schema', () => {
      const formData = {
        fullName: 'Amitabh Joshi',
        mobile: '+91 91234 56789',
        houseNumber: 'Flat 204, Riverview',
        street: 'Kalyani Nagar',
        landmark: 'Near Jogger Park',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411006',
        type: 'Office',
        isDefault: false,
      };

      const payload = normalizeAddressPayload(formData);

      expect(payload).toEqual({
        full_name: 'Amitabh Joshi',
        phone_number: '9123456789',
        address_line_1: 'Flat 204, Riverview',
        address_line_2: 'Kalyani Nagar',
        landmark: 'Near Jogger Park',
        city: 'Pune',
        state: 'Maharashtra',
        postal_code: '411006',
        address_type: 'work',
        is_default: false,
      });
    });

    it('handles null and undefined input gracefully in normalizers', () => {
      expect(normalizeBackendAddress(null)).toBeNull();
      expect(normalizeBackendAddress(undefined)).toBeNull();
      expect(normalizeAddressPayload(null)).toEqual({});
      expect(normalizeAddressPayload(undefined)).toEqual({});
    });
  });

  describe('4. Emoji Matching Helper', () => {
    it('returns appropriate emojis based on vegetable product names', () => {
      expect(getEmojiForProduct('Organic Fresh Tomato')).toBe('🍅');
      expect(getEmojiForProduct('Nashik Red Onion')).toBe('🧅');
      expect(getEmojiForProduct('Baby Potatoes')).toBe('🥔');
      expect(getEmojiForProduct('Crisp Ooty Carrots')).toBe('🥕');
      expect(getEmojiForProduct('Fresh Palak Spinach')).toBe('🥬');
      expect(getEmojiForProduct('Broccoli Crowns')).toBe('🥦');
      expect(getEmojiForProduct('Fresh Coriander Dhaniya')).toBe('🌿');
      expect(getEmojiForProduct('Green Chillies (Mirch)')).toBe('🌶️');
      expect(getEmojiForProduct('Fresh Ginger (Adrak)')).toBe('🫚');
      expect(getEmojiForProduct('Garlic Pods (Lahsun)')).toBe('🧄');
      expect(getEmojiForProduct('Green Bell Pepper Capsicum')).toBe('🫑');
      expect(getEmojiForProduct('Crisp Cucumber (Kheera)')).toBe('🥒');
      expect(getEmojiForProduct('Sweet Golden Corn (Bhutta)')).toBe('🌽');
      expect(getEmojiForProduct('Fresh Yellow Lemon (Nimbu)')).toBe('🍋');
      expect(getEmojiForProduct('Unknown Exotic Veggie')).toBe('🥦');
      expect(getEmojiForProduct('')).toBe('🥦');
      expect(getEmojiForProduct(null)).toBe('🥦');
    });
  });

  describe('5. API Error Formatting', () => {
    it('formats network timeout error properly', () => {
      const timeoutError = { code: 'ECONNABORTED' };
      expect(formatApiError(timeoutError)).toContain('timed out');
    });

    it('formats DRF validation error object into clear string', () => {
      const fieldError = {
        response: {
          data: {
            postal_code: ['Postal code must be exactly 6 digits.'],
          },
        },
      };
      expect(formatApiError(fieldError)).toContain('Postal code must be exactly 6 digits.');
    });

    it('formats DRF detail error string', () => {
      const detailError = {
        response: {
          data: {
            detail: 'Authentication credentials were not provided.',
          },
        },
      };
      expect(formatApiError(detailError)).toBe('Authentication credentials were not provided.');
    });
  });
});
