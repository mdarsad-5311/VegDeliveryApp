import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY_AUTH_TOKEN = '@vegdelivery_auth_token';

/**
 * Platform-Aware API Base URL:
 * - Android Emulator: 10.0.2.2 routes to host machine localhost (127.0.0.1)
 * - iOS Simulator: localhost (127.0.0.1)
 * - Physical Device: override with your machine's LAN IP (e.g. global.__API_BASE_URL__ = 'http://192.168.1.100:8000/api')
 */
export const getBaseURL = () => {
  if (global.__API_BASE_URL__) {
    return global.__API_BASE_URL__;
  }
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api'
    : 'http://localhost:8000/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let onUnauthorizedCallback = null;

export const setOnUnauthorizedCallback = callback => {
  onUnauthorizedCallback = callback;
};

// Request interceptor: Attach Token from AsyncStorage
apiClient.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (err) {
      // Proceed without token if storage read fails
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor: Global error formatting & 401 handling
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      } catch (_) {}
      if (typeof onUnauthorizedCallback === 'function') {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Formats API errors into user-friendly message strings or field dicts
 */
export const formatApiError = error => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your internet connection.';
    }
    return 'Unable to connect to the FreshVeg server. Please ensure the backend is running.';
  }

  const data = error.response.data;
  if (!data) {
    return 'An unexpected server error occurred. Please try again.';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
    return data.non_field_errors[0];
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    for (const key of keys) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        return data[key][0];
      }
      if (typeof data[key] === 'string') {
        return data[key];
      }
    }
  }

  return data;
};

// Authentication Endpoints
export const authAPI = {
  register: payload => apiClient.post('/auth/register/', payload),
  login: payload => apiClient.post('/auth/login/', payload),
  logout: () => apiClient.post('/auth/logout/'),
  getProfile: () => apiClient.get('/auth/profile/'),
  updateProfile: payload => apiClient.patch('/auth/profile/', payload),
  changePassword: payload => apiClient.post('/auth/change-password/', payload),
};

/**
 * Media Base URL for resolving product and category images
 */
export const getMediaBaseURL = () => {
  const apiBase = getBaseURL();
  return apiBase.replace(/\/api\/?$/, '');
};

/**
 * Resolves relative and absolute image URLs safely across Android and iOS
 */
export const resolveImageUrl = imageUri => {
  if (!imageUri || typeof imageUri !== 'string') return null;
  const trimmed = imageUri.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If running on Android emulator, rewrite localhost/127.0.0.1 to 10.0.2.2
    if (Platform.OS === 'android') {
      if (trimmed.includes('localhost:8000')) {
        return trimmed.replace('localhost:8000', '10.0.2.2:8000');
      }
      if (trimmed.includes('127.0.0.1:8000')) {
        return trimmed.replace('127.0.0.1:8000', '10.0.2.2:8000');
      }
    }
    return trimmed;
  }

  const base = getMediaBaseURL();
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
};

/**
 * Vegetable fallback emoji generator
 */
export const getFallbackEmoji = (name = '', categoryName = '') => {
  const text = `${name} ${categoryName}`.toLowerCase();
  if (text.includes('tomat')) return '🍅';
  if (text.includes('potat')) return '🥔';
  if (text.includes('carrot')) return '🥕';
  if (text.includes('onion')) return '🧅';
  if (
    text.includes('spinach') ||
    text.includes('palak') ||
    text.includes('coriander') ||
    text.includes('leaf') ||
    text.includes('methi') ||
    text.includes('mint')
  ) {
    return '🥬';
  }
  if (text.includes('broccoli')) return '🥦';
  if (text.includes('corn') || text.includes('maize')) return '🌽';
  if (
    text.includes('chilli') ||
    text.includes('pepper') ||
    text.includes('capsicum')
  ) {
    return '🌶️';
  }
  if (text.includes('cucumb')) return '🥒';
  if (text.includes('garlic')) return '🧄';
  if (text.includes('ginger')) return '🫚';
  if (text.includes('pea')) return '🫛';
  if (text.includes('mushroom')) return '🍄';
  if (text.includes('brinjal') || text.includes('eggplant')) return '🍆';
  if (text.includes('lemon')) return '🍋';
  if (text.includes('cabbage')) return '🥬';
  if (text.includes('cauliflow')) return '🥦';
  if (text.includes('fruit') || text.includes('apple')) return '🍎';
  return '🥦';
};

/**
 * Category fallback icon generator
 */
export const getCategoryIcon = (name = '', slug = '') => {
  const text = `${name} ${slug}`.toLowerCase();
  if (text.includes('leaf')) return '🥬';
  if (text.includes('root')) return '🥕';
  if (text.includes('season')) return '🌽';
  if (text.includes('exotic')) return '🥑';
  if (text.includes('organic')) return '🌿';
  if (text.includes('fruit')) return '🍎';
  if (text.includes('daily')) return '🥦';
  return '🥗';
};

/**
 * Normalizes backend category representation
 */
export const normalizeCategory = backendCategory => {
  if (!backendCategory) return null;
  const imageUrl = resolveImageUrl(backendCategory.image);
  const icon = getCategoryIcon(backendCategory.name, backendCategory.slug);
  const palettes = [
    { color: '#2E7D32', bgColor: '#E8F5E9' },
    { color: '#E65100', bgColor: '#FFF3E0' },
    { color: '#F57F17', bgColor: '#FFFDE7' },
    { color: '#C2185B', bgColor: '#FCE4EC' },
    { color: '#00695C', bgColor: '#E0F2F1' },
    { color: '#6A1B9A', bgColor: '#F3E5F5' },
  ];
  const idx = Math.abs((Number(backendCategory.id) || 0) % palettes.length);
  const palette = palettes[idx];

  return {
    id: backendCategory.id,
    name: backendCategory.name || 'Category',
    shortName: backendCategory.name
      ? backendCategory.name.split(' ')[0]
      : 'Category',
    slug: backendCategory.slug,
    description: backendCategory.description || 'Fresh and organic vegetables',
    image: imageUrl,
    rawImage: backendCategory.image,
    icon: icon,
    color: palette.color,
    bgColor: palette.bgColor,
    itemCount: backendCategory.products_count ?? 0,
    isActive: backendCategory.is_active ?? true,
    _backend: backendCategory,
  };
};

/**
 * Normalizes backend product representation for UI consumption
 */
export const normalizeProduct = backendProduct => {
  if (!backendProduct) return null;

  const rawPrice = parseFloat(backendProduct.price || 0);
  const rawDiscount =
    backendProduct.discount_price !== null &&
    backendProduct.discount_price !== undefined
      ? parseFloat(backendProduct.discount_price)
      : null;
  const hasDiscount =
    rawDiscount !== null && rawDiscount > 0 && rawDiscount < rawPrice;

  const sellingPrice = hasDiscount
    ? rawDiscount
    : parseFloat(
        backendProduct.final_price ||
          backendProduct.effective_price ||
          rawPrice,
      );
  const originalPrice = hasDiscount ? rawPrice : null;

  let discountBadge = null;
  if (hasDiscount && originalPrice > sellingPrice) {
    const pct = Math.round(
      ((originalPrice - sellingPrice) / originalPrice) * 100,
    );
    discountBadge = `${pct}% OFF`;
  }

  const imageUrl = resolveImageUrl(backendProduct.image);
  const fallbackEmoji = getFallbackEmoji(
    backendProduct.name,
    backendProduct.category_details?.name,
  );

  const stockQty = backendProduct.stock_quantity ?? 0;
  const isAvailable = backendProduct.is_available ?? true;
  const inStock = backendProduct.in_stock ?? (stockQty > 0 && isAvailable);

  return {
    id: backendProduct.id,
    name: backendProduct.name || 'Fresh Vegetable',
    slug: backendProduct.slug,
    sku: backendProduct.sku,
    category: backendProduct.category_details?.name || 'Vegetables',
    categoryId: backendProduct.category || backendProduct.category_details?.id,
    categoryDetails: backendProduct.category_details,
    price: sellingPrice,
    originalPrice: originalPrice,
    discountPrice: rawDiscount,
    discountBadge: discountBadge,
    unit: backendProduct.unit || '1 kg',
    stockQuantity: stockQty,
    availableStock: stockQty,
    stockStatus: inStock ? 'in_stock' : 'out_of_stock',
    isAvailable: isAvailable,
    isActive: backendProduct.is_active ?? true,
    isFeatured: backendProduct.is_featured ?? false,
    inStock: inStock,
    description: backendProduct.description || '',
    image: imageUrl,
    rawImage: backendProduct.image,
    emoji: fallbackEmoji,
    accentColor: '#E8F5E9',
    rating: 4.8,
    reviews: 120,
    tag: backendProduct.is_featured
      ? 'Featured'
      : hasDiscount
      ? 'Special Offer'
      : 'Fresh',
    _backend: backendProduct,
  };
};

// Category Endpoints
export const categoryAPI = {
  getAll: (params = {}) => apiClient.get('/categories/', { params }),
  getById: id => apiClient.get(`/categories/${id}/`),
};

// Product Endpoints
export const productAPI = {
  getAll: (params = {}) => apiClient.get('/products/', { params }),
  getById: id => apiClient.get(`/products/${id}/`),
  getFeatured: (params = {}) =>
    apiClient.get('/products/', { params: { is_featured: true, ...params } }),
  search: (query, params = {}) =>
    apiClient.get('/products/', { params: { search: query, ...params } }),
};

/**
 * Normalizes backend address format into UI address object
 */
export const normalizeBackendAddress = rawAddr => {
  if (!rawAddr) return null;
  const addr =
    rawAddr.address && typeof rawAddr.address === 'object'
      ? rawAddr.address
      : rawAddr;
  const typeMap = { home: 'Home', work: 'Office', other: 'Other' };
  const type =
    typeMap[addr.address_type?.toLowerCase()] || addr.address_type || 'Home';
  const icon = type === 'Home' ? '🏠' : type === 'Office' ? '🏢' : '📍';
  const tag = addr.is_default ? 'DEFAULT' : type.toUpperCase();
  const houseNumber = (addr.address_line_1 || '').trim();
  const street = (addr.address_line_2 || '').trim();
  const landmark = addr.landmark ? `${addr.landmark.trim()}, ` : '';
  const city = (addr.city || '').trim();
  const state = (addr.state || '').trim();
  const pincode = (addr.postal_code || '').trim();

  const line1 = [houseNumber, street].filter(Boolean).join(', ') || 'Address';
  const line2 = `${landmark}${city}${city && state ? ', ' : ''}${state}${
    pincode ? ' - ' + pincode : ''
  }`.trim();
  const fullAddress = [line1, line2].filter(Boolean).join(', ') || line1;
  const shortAddress = [houseNumber, street || city].filter(Boolean).join(', ');
  const phone = addr.phone_number?.startsWith('+91')
    ? addr.phone_number
    : `+91 ${addr.phone_number}`;

  return {
    ...addr,
    id: addr.id,
    fullName: addr.full_name,
    mobile: addr.phone_number,
    phone: phone,
    type,
    icon,
    tag,
    label: type,
    houseNumber,
    street,
    city,
    state,
    pincode,
    line1,
    line2,
    fullAddress,
    shortAddress,
    isDefault: Boolean(addr.is_default),
    _backend: addr,
  };
};

/**
 * Normalizes frontend form data into DRF AddressSerializer schema
 */
export const normalizeAddressPayload = formData => {
  if (!formData) return {};
  const typeMap = {
    Home: 'home',
    home: 'home',
    Office: 'work',
    work: 'work',
    Other: 'other',
    other: 'other',
  };

  return {
    full_name: formData.full_name || formData.fullName || '',
    phone_number: (
      formData.phone_number ||
      formData.mobile ||
      formData.phone ||
      ''
    )
      .replace(/[^0-9]/g, '')
      .slice(-10),
    address_line_1:
      formData.address_line_1 ||
      formData.houseNumber ||
      formData.line1 ||
      '',
    address_line_2:
      formData.address_line_2 || formData.street || formData.line2 || '',
    landmark: formData.landmark || '',
    city: formData.city || '',
    state: formData.state || '',
    postal_code:
      formData.postal_code ||
      formData.pincode ||
      formData.postalCode ||
      '',
    address_type:
      typeMap[formData.address_type] ||
      typeMap[formData.type] ||
      'home',
    is_default: Boolean(
      formData.is_default !== undefined
        ? formData.is_default
        : formData.isDefault,
    ),
  };
};

// Cart Endpoints
export const cartAPI = {
  // Fetch current user's cart: GET /api/cart/
  getCart: () => apiClient.get('/cart/'),

  // Add product to cart: POST /api/cart/add/ with { product_id, quantity }
  addItem: (productId, quantity = 1) =>
    apiClient.post('/cart/add/', {
      product_id: parseInt(productId, 10),
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
    }),

  // Update cart item quantity: PATCH /api/cart/update/{item_id}/ with { quantity }
  updateItem: (itemId, quantity) =>
    apiClient.patch(`/cart/update/${itemId}/`, {
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
    }),

  // Remove individual item from cart: DELETE /api/cart/remove/{item_id}/
  removeItem: itemId => apiClient.delete(`/cart/remove/${itemId}/`),

  // Clear entire cart: POST /api/cart/clear/
  clearCart: () => apiClient.post('/cart/clear/'),
};

// Address Endpoints
export const addressAPI = {
  // List all addresses: GET /api/addresses/
  getAll: () => apiClient.get('/addresses/'),

  // Retrieve address: GET /api/addresses/{id}/
  getById: id => apiClient.get(`/addresses/${id}/`),

  // Create address: POST /api/addresses/
  create: payload =>
    apiClient.post('/addresses/', normalizeAddressPayload(payload)),

  // Update address: PATCH /api/addresses/{id}/
  update: (id, payload) =>
    apiClient.patch(`/addresses/${id}/`, normalizeAddressPayload(payload)),

  // Delete address: DELETE /api/addresses/{id}/
  delete: id => apiClient.delete(`/addresses/${id}/`),

  // Set default address: PATCH /api/addresses/{id}/set-default/
  setDefault: id => apiClient.patch(`/addresses/${id}/set-default/`),
};

// Delivery Slot Endpoints
export const deliverySlotAPI = {
  // List Slots: GET /api/delivery/slots/
  getSlots: (params = {}) => apiClient.get('/delivery/slots/', { params }),
};

// Helper to format HH:MM:SS to 12-hour HH:MM AM/PM
export const format12Hour = timeStr => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const min = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
  return `${hourStr}:${min} ${ampm}`;
};

// Order Status Display Mapping
export const ORDER_STATUS_MAP = {
  pending: { label: 'Order Placed', stage: 1, color: '#1565C0', bg: '#E3F2FD' },
  confirmed: { label: 'Order Confirmed', stage: 2, color: '#1565C0', bg: '#E3F2FD' },
  processing: { label: 'Preparing Order', stage: 3, color: '#E65100', bg: '#FFF3E0' },
  packed: { label: 'Order Packed', stage: 3, color: '#E65100', bg: '#FFF3E0' },
  out_for_delivery: { label: 'Out for Delivery', stage: 4, color: '#E65100', bg: '#FFF3E0' },
  delivered: { label: 'Delivered', stage: 5, color: '#2E7D32', bg: '#E8F5E9' },
  cancelled: { label: 'Cancelled', stage: 0, color: '#D32F2F', bg: '#FFEBEE' },
};

/**
 * Normalizes backend delivery slot object
 */
export const normalizeDeliverySlot = slot => {
  if (!slot) return null;
  const isAvailable =
    slot.is_available !== undefined ? slot.is_available : slot.is_active;
  const isFull = Boolean(slot.is_full);
  const startTime = format12Hour(slot.start_time);
  const endTime = format12Hour(slot.end_time);
  const formattedTime =
    slot.formatted_time ||
    (startTime && endTime ? `${startTime} - ${endTime}` : slot.name);

  return {
    id: slot.id,
    backendId: slot.id,
    name: slot.name,
    title: slot.name,
    time: formattedTime,
    startTime: slot.start_time,
    endTime: slot.end_time,
    deliveryDate: slot.delivery_date,
    maxOrders: slot.max_orders,
    bookedOrders: slot.booked_orders || 0,
    availableCapacity:
      slot.available_capacity !== undefined
        ? slot.available_capacity
        : slot.max_orders,
    isAvailable: isAvailable && !isFull,
    isFull,
    isActive: Boolean(slot.is_active),
    badge: isFull
      ? 'FULL'
      : slot.name.includes('Instant')
      ? 'FASTEST'
      : 'AVAILABLE',
    desc: slot.name.includes('Morning')
      ? 'Fresh dawn harvest straight from farms'
      : slot.name.includes('Evening')
      ? 'Hand-picked for dinner cooking'
      : slot.name.includes('Instant')
      ? 'Farm fresh harvest right to your doorstep'
      : 'Convenient scheduled delivery',
    _backend: slot,
  };
};

/**
 * Normalizes backend order object to UI order format
 */
export const normalizeBackendOrder = order => {
  if (!order) return null;
  const rawStatus = (
    order.order_status ||
    order.status ||
    'pending'
  ).toLowerCase();
  const statusInfo = ORDER_STATUS_MAP[rawStatus] || {
    label: order.order_status_display || rawStatus,
    stage: 1,
  };
  const isCancelled = rawStatus === 'cancelled';
  const isDelivered = rawStatus === 'delivered';

  const orderNumber = order.order_number || order.id || `FV-${order.id}`;

  const createdDate = order.created_at ? new Date(order.created_at) : new Date();
  const dateFormatted = createdDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const shipping = order.shipping_address || order.address || {};
  const houseNumber =
    shipping.address_line_1 || shipping.address_line1 || order.shipping_address_line_1 || '';
  const street =
    shipping.address_line_2 || shipping.address_line2 || order.shipping_address_line_2 || '';
  const landmark = shipping.landmark || order.shipping_landmark || '';
  const city = shipping.city || order.shipping_city || 'Pune';
  const state = shipping.state || order.shipping_state || 'Maharashtra';
  const pincode =
    shipping.postal_code || shipping.pincode || order.shipping_postal_code || '';
  const fullName =
    shipping.full_name || shipping.fullName || order.shipping_full_name || 'Customer';
  const phone =
    shipping.phone_number || shipping.phone || order.shipping_phone_number || '';

  const line1 =
    [houseNumber, street].filter(Boolean).join(', ') || 'Delivery Address';
  const line2 = `${landmark ? landmark + ', ' : ''}${city}${
    city && state ? ', ' : ''
  }${state}${pincode ? ' - ' + pincode : ''}`.trim();
  const fullAddress = [line1, line2].filter(Boolean).join(', ') || line1;

  const addressObj = {
    fullName,
    phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
    mobile: phone.replace(/[^0-9]/g, '').slice(-10),
    houseNumber,
    street,
    landmark,
    city,
    state,
    pincode,
    line1,
    line2,
    fullAddress,
    type: 'Home',
    icon: '📍',
    tag: 'DELIVERY',
  };

  const slotObj = order.delivery_slot_details || {};
  const slotName =
    slotObj.name ||
    (order.delivery_slot
      ? `Slot #${order.delivery_slot}`
      : 'Standard Delivery');
  const slotFormatted =
    slotObj.formatted_time ||
    (slotObj.start_time && slotObj.end_time
      ? `${slotObj.start_time} - ${slotObj.end_time}`
      : slotName);

  const items = (order.items || []).map(item => ({
    id: item.id,
    productId: item.product,
    name: item.product_name || 'Product',
    price: parseFloat(item.product_price) || 0,
    quantity: item.quantity || 1,
    unit: item.unit || '1 kg',
    subtotal: parseFloat(item.total_price) || 0,
    imageUrl: item.product_image,
    image: item.product_image,
    emoji: '🥦',
    accentColor: '#E8F5E9',
  }));

  const subtotal = parseFloat(order.subtotal) || 0;
  const deliveryFee =
    parseFloat(order.delivery_fee || order.delivery_charge) || 0;
  const discount =
    parseFloat(order.discount || order.discount_amount) || 0;
  const grandTotal =
    parseFloat(order.grand_total || order.total_amount) ||
    Math.max(0, subtotal + deliveryFee - discount);

  const paymentMethod =
    order.payment_method ||
    order.latest_payment?.payment_method_display ||
    (order.latest_payment?.payment_method === 'COD'
      ? 'Cash on Delivery (COD)'
      : order.latest_payment?.payment_method) ||
    'Cash on Delivery (COD)';

  const paymentStatus =
    order.payment_status_display ||
    (order.payment_status
      ? order.payment_status.charAt(0).toUpperCase() +
        order.payment_status.slice(1)
      : 'Pending');

  const timeStr = createdDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const timeline = [
    {
      step: 1,
      title: 'Order Placed',
      time: timeStr,
      desc: 'Order received and verified',
      completed: true,
      current: rawStatus === 'pending',
    },
    {
      step: 2,
      title: 'Order Confirmed',
      time: statusInfo.stage >= 2 ? 'Confirmed' : 'Pending confirmation',
      desc: 'Farm inventory reserved',
      completed: statusInfo.stage >= 2,
      current: rawStatus === 'confirmed',
    },
    {
      step: 3,
      title: 'Preparing Order',
      time: statusInfo.stage >= 3 ? 'In packing' : 'Upcoming',
      desc: 'Harvested & packed fresh',
      completed: statusInfo.stage >= 3,
      current: rawStatus === 'processing' || rawStatus === 'packed',
    },
    {
      step: 4,
      title: 'Out for Delivery',
      time: statusInfo.stage >= 4 ? 'Dispatched' : 'Upcoming',
      desc: order.delivery_partner_name
        ? `${order.delivery_partner_name} on the way`
        : 'Partner on the way to you',
      completed: statusInfo.stage >= 4,
      current: rawStatus === 'out_for_delivery',
    },
    {
      step: 5,
      title: 'Delivered',
      time: isDelivered
        ? order.delivered_at
          ? new Date(order.delivered_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Delivered'
        : 'Estimated at doorstep',
      desc: 'Handed over at doorstep',
      completed: isDelivered,
      current: isDelivered,
    },
  ];

  return {
    id: orderNumber,
    orderId: orderNumber,
    orderNumber,
    backendId: order.id,
    date: dateFormatted,
    createdAt: order.created_at,
    status: statusInfo.label,
    order_status: rawStatus,
    stage: statusInfo.stage,
    isCancelled,
    isDelivered,
    estimatedDelivery: isDelivered ? 'Delivered' : slotFormatted,
    slot: slotFormatted,
    paymentMethod,
    paymentStatus,
    itemsCount: order.items_count || items.length,
    subtotal,
    deliveryFee,
    discount,
    grandTotal,
    address: addressObj,
    deliveryPartner: {
      name: order.delivery_partner_name || 'Assigned Partner',
      phone: '+91 98220 12345',
      rating: '4.9',
      avatar: '🛵',
    },
    items,
    timeline,
    customerNote: order.customer_note || '',
    _backend: order,
  };
};

// Order Endpoints
export const orderAPI = {
  // Place Order / Checkout: POST /api/orders/checkout/
  checkout: payload => {
    const pm = (payload.payment_method || payload.paymentMethod || 'COD').toString();
    const formattedPaymentMethod =
      pm.toLowerCase() === 'cod'
        ? 'COD'
        : pm.toLowerCase() === 'upi'
        ? 'UPI'
        : 'online';

    return apiClient.post('/orders/checkout/', {
      address_id: parseInt(payload.address_id || payload.addressId, 10),
      delivery_slot_id:
        payload.delivery_slot_id || payload.deliverySlotId
          ? parseInt(payload.delivery_slot_id || payload.deliverySlotId, 10)
          : null,
      payment_method: formattedPaymentMethod,
      customer_note: payload.customer_note || payload.customerNote || '',
    });
  },

  // List Orders: GET /api/orders/
  getAll: (params = {}) => apiClient.get('/orders/', { params }),

  // Order Detail: GET /api/orders/{order_number}/
  getByOrderNumber: orderNumber => apiClient.get(`/orders/${orderNumber}/`),

  // Cancel Order: POST /api/orders/{order_number}/cancel/
  cancel: (orderNumber, payload = {}) =>
    apiClient.post(`/orders/${orderNumber}/cancel/`, {
      reason: payload.reason || 'Customer requested cancellation',
    }),
};

// Payment Endpoints (Step 9 & Phase 3D Razorpay)
export const paymentAPI = {
  // Initiate payment: POST /api/payments/initiate/
  initiate: payload =>
    apiClient.post('/payments/initiate/', {
      order_number: payload.order_number || payload.orderNumber,
      payment_method:
        payload.payment_method || payload.paymentMethod || 'online',
      ...(payload.amount ? { amount: payload.amount } : {}),
    }),

  // Verify payment: POST /api/payments/verify/
  verify: payload =>
    apiClient.post('/payments/verify/', {
      order_number: payload.order_number || payload.orderNumber,
      ...(payload.transaction_id
        ? { transaction_id: payload.transaction_id }
        : {}),
      ...(payload.razorpay_order_id
        ? { razorpay_order_id: payload.razorpay_order_id }
        : {}),
      ...(payload.razorpay_payment_id
        ? { razorpay_payment_id: payload.razorpay_payment_id }
        : {}),
      ...(payload.razorpay_signature
        ? { razorpay_signature: payload.razorpay_signature }
        : {}),
      ...(payload.gateway_signature
        ? { gateway_signature: payload.gateway_signature }
        : {}),
      ...(payload.amount ? { amount: payload.amount } : {}),
      ...(payload.status ? { status: payload.status } : {}),
    }),

  // Real-time payment status: GET /api/orders/{order_number}/payment-status/
  getPaymentStatus: orderNumber =>
    apiClient.get(`/orders/${orderNumber}/payment-status/`),
};

export default apiClient;
