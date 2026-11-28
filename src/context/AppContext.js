import React, {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_NOTIFICATIONS } from '../constants/mockData';
import {
  authAPI,
  cartAPI,
  addressAPI,
  orderAPI,
  deliverySlotAPI,
  normalizeBackendAddress,
  normalizeBackendOrder,
  normalizeDeliverySlot,
  STORAGE_KEY_AUTH_TOKEN,
  setOnUnauthorizedCallback,
  formatApiError,
} from '../services/api';

export const AppContext = createContext();

export { STORAGE_KEY_AUTH_TOKEN };
export const STORAGE_KEY_ADDRESSES = '@vegdelivery_addresses';
export const STORAGE_KEY_SELECTED_ADDRESS_ID = '@vegdelivery_selected_address_id';
export const STORAGE_KEY_ORDERS = '@vegdelivery_orders';
export const STORAGE_KEY_USER_PROFILE = '@vegdelivery_user_profile';
export const STORAGE_KEY_CART = '@vegdelivery_cart';

export const DEFAULT_DELIVERY_CHARGE = 30;
export const FREE_DELIVERY_THRESHOLD = 199;

export const DEFAULT_USER_PROFILE = {
  name: 'Kira Sharma',
  phone: '9876543210',
  email: 'kira.sharma@freshveg.in',
  avatar: '🥦',
  bio: 'Farm fresh vegetable enthusiast',
  joinDate: 'Member since Nov 2026',
};

export const formatUserProfile = userData => {
  if (!userData) return DEFAULT_USER_PROFILE;
  return {
    id: userData.id,
    username: userData.username,
    name:
      userData.full_name ||
      `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
      userData.username ||
      'User',
    phone: userData.phone_number || userData.phone || '',
    email: userData.email || '',
    role: userData.role || 'customer',
    avatar: '🥦',
    bio: userData.bio || 'Farm fresh vegetable enthusiast',
    joinDate: userData.created_at
      ? `Member since ${new Date(userData.created_at).toLocaleDateString(
          'en-US',
          { month: 'short', year: 'numeric' },
        )}`
      : 'Member since Nov 2026',
    isVerified: Boolean(userData.is_verified),
  };
};

export const getEmojiForProduct = name => {
  if (!name) return '🥦';
  const lower = name.toLowerCase();
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('onion')) return '🧅';
  if (lower.includes('potato')) return '🥔';
  if (lower.includes('carrot')) return '🥕';
  if (lower.includes('spinach') || lower.includes('palak')) return '🥬';
  if (lower.includes('broccoli')) return '🥦';
  if (lower.includes('coriander') || lower.includes('dhaniya')) return '🌿';
  if (lower.includes('chilli') || lower.includes('chili') || lower.includes('mirch')) return '🌶️';
  if (lower.includes('ginger') || lower.includes('adrak')) return '🫚';
  if (lower.includes('garlic') || lower.includes('lahsun')) return '🧄';
  if (lower.includes('capsicum') || lower.includes('pepper')) return '🫑';
  if (lower.includes('cucumber') || lower.includes('kheera')) return '🥒';
  if (lower.includes('corn') || lower.includes('bhutta')) return '🌽';
  if (lower.includes('lemon') || lower.includes('nimbu')) return '🍋';
  return '🥦';
};

export const ORDER_STAGES = [
  { step: 1, title: 'Order Placed', desc: 'Order received and verified' },
  { step: 2, title: 'Order Confirmed', desc: 'Farm inventory reserved' },
  { step: 3, title: 'Preparing Order', desc: 'Harvested & packed fresh' },
  { step: 4, title: 'Out for Delivery', desc: 'Partner on the way to you' },
  { step: 5, title: 'Delivered', desc: 'Handed over at doorstep' },
];

export const DEFAULT_SEED_ORDERS = [
  {
    id: 'FV-84912',
    date: 'Today, 11:15 AM',
    createdAt: new Date().toISOString(),
    status: 'Out for Delivery',
    stage: 4,
    estimatedDelivery: '20 - 30 mins',
    slot: 'Instant Delivery (20-30 mins)',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Pending',
    itemsCount: 3,
    subtotal: 195,
    deliveryFee: 0,
    discount: 0,
    grandTotal: 195,
    address: {
      fullName: 'Kiran Kumar',
      phone: '+91 98765 43210',
      type: 'Home',
      tag: 'HOME',
      line1: 'Flat 402, Green Meadows, Baner Road',
      line2: 'Near D-Mart, Pune - 411045',
      fullAddress: 'Flat 402, Green Meadows, Baner Road, Near D-Mart, Pune - 411045',
      shortAddress: 'Flat 402, Green Meadows',
    },
    deliveryPartner: {
      name: 'Ramesh Kumar',
      phone: '+91 98220 12345',
      rating: '4.9',
      deliveries: '1,240+',
      vehicle: 'Electric Cargo Scooter (MH-12-VG-4521)',
      avatar: '🛵',
    },
    timeline: [
      { step: 1, title: 'Order Placed', time: '11:15 AM', completed: true },
      { step: 2, title: 'Order Confirmed', time: '11:17 AM', completed: true },
      { step: 3, title: 'Preparing Order', time: '11:22 AM', completed: true },
      { step: 4, title: 'Out for Delivery', time: '11:28 AM', completed: true, current: true },
      { step: 5, title: 'Delivered', time: 'Est. 11:45 AM', completed: false },
    ],
    items: [
      {
        id: 'spinach_fresh',
        productId: 'pop-1',
        name: 'Fresh Spinach (Palak)',
        emoji: '🥬',
        price: 35,
        unit: '250g',
        quantity: 2,
        subtotal: 70,
        accentColor: '#E8F5E9',
      },
      {
        id: 'roma_tomatoes',
        productId: 'best-1',
        name: 'Organic Vine Tomatoes',
        emoji: '🍅',
        price: 45,
        unit: '500g',
        quantity: 1,
        subtotal: 45,
        accentColor: '#FFEBEE',
      },
      {
        id: 'fresh_carrots',
        productId: 'root-1',
        name: 'Crisp Ooty Carrots',
        emoji: '🥕',
        price: 80,
        unit: '1 kg',
        quantity: 1,
        subtotal: 80,
        accentColor: '#FFF3E0',
      },
    ],
  },
  {
    id: 'FV-72105',
    date: 'Yesterday, 04:30 PM',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'Delivered',
    stage: 5,
    estimatedDelivery: 'Delivered on time',
    slot: 'Evening Slot (6:00 PM - 8:00 PM)',
    paymentMethod: 'UPI (GPay)',
    paymentStatus: 'Paid',
    itemsCount: 4,
    subtotal: 260,
    deliveryFee: 0,
    discount: 25,
    grandTotal: 235,
    address: {
      fullName: 'Kiran Kumar',
      phone: '+91 98765 43210',
      type: 'Home',
      tag: 'HOME',
      line1: 'Flat 402, Green Meadows, Baner Road',
      line2: 'Near D-Mart, Pune - 411045',
      fullAddress: 'Flat 402, Green Meadows, Baner Road, Near D-Mart, Pune - 411045',
      shortAddress: 'Flat 402, Green Meadows',
    },
    deliveryPartner: {
      name: 'Santosh Shinde',
      phone: '+91 98760 98765',
      rating: '4.8',
      deliveries: '890+',
      vehicle: 'Green Van (MH-12-EX-1011)',
      avatar: '🚚',
    },
    timeline: [
      { step: 1, title: 'Order Placed', time: '04:30 PM', completed: true },
      { step: 2, title: 'Order Confirmed', time: '04:32 PM', completed: true },
      { step: 3, title: 'Preparing Order', time: '04:45 PM', completed: true },
      { step: 4, title: 'Out for Delivery', time: '05:10 PM', completed: true },
      { step: 5, title: 'Delivered', time: '05:35 PM', completed: true, current: true },
    ],
    items: [
      {
        id: 'fresh_broccoli',
        productId: 'pop-2',
        name: 'Broccoli Crowns',
        emoji: '🥦',
        price: 90,
        unit: '500g',
        quantity: 1,
        subtotal: 90,
        accentColor: '#E8F5E9',
      },
      {
        id: 'red_onions',
        productId: 'root-2',
        name: 'Nashik Red Onions',
        emoji: '🧅',
        price: 55,
        unit: '1 kg',
        quantity: 2,
        subtotal: 110,
        accentColor: '#F3E5F5',
      },
      {
        id: 'fresh_coriander',
        productId: 'leafy-2',
        name: 'Fresh Coriander Bunch',
        emoji: '🌿',
        price: 25,
        unit: '100g',
        quantity: 1,
        subtotal: 25,
        accentColor: '#E8F8F5',
      },
      {
        id: 'green_chillies',
        productId: 'season-1',
        name: 'Spicy Green Chillies',
        emoji: '🌶️',
        price: 35,
        unit: '200g',
        quantity: 1,
        subtotal: 35,
        accentColor: '#FFEBEE',
      },
    ],
  },
  {
    id: 'FV-61984',
    date: '21 Nov 2026, 02:00 PM',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'Cancelled',
    stage: 0,
    cancelReason: 'Changed delivery address',
    estimatedDelivery: 'Cancelled',
    slot: 'Afternoon Slot (1:00 PM - 3:00 PM)',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Cancelled',
    itemsCount: 2,
    subtotal: 130,
    deliveryFee: 30,
    discount: 0,
    grandTotal: 160,
    address: {
      fullName: 'Kiran Kumar',
      phone: '+91 98765 43210',
      type: 'Office',
      tag: 'OFFICE',
      line1: 'Tower B, 4th Floor, Silicon Tech Park',
      line2: 'Whitefield, Bangalore - 560066',
      fullAddress: 'Tower B, 4th Floor, Silicon Tech Park, Whitefield, Bangalore - 560066',
      shortAddress: 'Tower B, Silicon Tech Park',
    },
    timeline: [
      { step: 1, title: 'Order Placed', time: '02:00 PM', completed: true },
      { step: 2, title: 'Order Cancelled', time: '02:08 PM', completed: true, current: true, cancelled: true },
    ],
    items: [
      {
        id: 'sweet_corn',
        productId: 'season-3',
        name: 'Sweet Golden Corn',
        emoji: '🌽',
        price: 45,
        unit: '2 pcs',
        quantity: 2,
        subtotal: 90,
        accentColor: '#FFFDE7',
      },
      {
        id: 'baby_potatoes',
        productId: 'root-3',
        name: 'Baby Potatoes',
        emoji: '🥔',
        price: 40,
        unit: '500g',
        quantity: 1,
        subtotal: 40,
        accentColor: '#FFF8E1',
      },
    ],
  },
];

export const DEFAULT_SEED_ADDRESSES = [
  {
    id: 'addr_1',
    fullName: 'Kiran Kumar',
    mobile: '9876543210',
    houseNumber: 'Flat 402, Green Meadows',
    street: 'Baner Road',
    landmark: 'Near D-Mart',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    type: 'Home',
    isDefault: true,
  },
  {
    id: 'addr_2',
    fullName: 'Kiran Kumar',
    mobile: '9876543210',
    houseNumber: 'Tower B, 4th Floor',
    street: 'Silicon Tech Park, Whitefield',
    landmark: 'Opposite Metro Station',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066',
    type: 'Office',
    isDefault: false,
  },
  {
    id: 'addr_3',
    fullName: 'Mrs. Sunita Sharma',
    mobile: '9812345678',
    houseNumber: 'House 12',
    street: 'Rose Garden Layout, Indiranagar',
    landmark: 'Near BDA Complex',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    type: 'Other',
    isDefault: false,
  },
];

export const formatAddressObject = addr => {
  if (!addr) return null;
  const type = addr.type || 'Home';
  const icon = type === 'Home' ? '🏠' : type === 'Office' ? '🏢' : '📍';
  const tag = addr.isDefault ? 'DEFAULT' : type.toUpperCase();
  const houseNumber = (addr.houseNumber || '').trim();
  const street = (addr.street || '').trim();
  const landmark = addr.landmark ? `${addr.landmark.trim()}, ` : '';
  const city = (addr.city || '').trim();
  const state = (addr.state || '').trim();
  const pincode = (addr.pincode || '').trim();

  const line1 =
    addr.line1 ||
    [houseNumber, street].filter(Boolean).join(', ') ||
    'Address';
  const line2 =
    addr.line2 ||
    `${landmark}${city}${city && state ? ', ' : ''}${state}${
      pincode ? ' - ' + pincode : ''
    }`.trim();
  const fullAddress =
    addr.fullAddress ||
    [line1, line2].filter(Boolean).join(', ') ||
    line1;
  const shortAddress =
    addr.shortAddress || [houseNumber, street || city].filter(Boolean).join(', ');
  const phone =
    addr.phone ||
    (addr.mobile
      ? addr.mobile.startsWith('+91')
        ? addr.mobile
        : `+91 ${addr.mobile}`
      : '+91 98765 43210');

  return {
    ...addr,
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
    phone,
  };
};

export const AppProvider = ({ children }) => {
  // Cart state: { [productId]: { product, quantity, unit, cartItemId, itemSubtotal } }
  const [cart, setCart] = useState({});
  const [backendCart, setBackendCart] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [isCartHydrated, setIsCartHydrated] = useState(false);

  // Global Toast State
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message, type = 'success') => {
    if (!message) return;
    setToast({
      visible: true,
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Favorites state: Set of product IDs stored as array
  const [favorites, setFavorites] = useState(['pop-1', 'best-1']);

  // Selected delivery address
  const [addresses, setAddresses] = useState(() =>
    DEFAULT_SEED_ADDRESSES.map(formatAddressObject),
  );
  const [selectedAddress, setSelectedAddress] = useState(() =>
    formatAddressObject(DEFAULT_SEED_ADDRESSES[0]),
  );

  // Notifications
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Orders state
  const [orders, setOrders] = useState(DEFAULT_SEED_ORDERS);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Delivery Slots state
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  // User profile
  const [user, setUser] = useState(DEFAULT_USER_PROFILE);

  // Authentication & Session State
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Load addresses, selected address, orders & profile from AsyncStorage on app mount
  useEffect(() => {
    let isMounted = true;
    const loadFromStorage = async () => {
      try {
        const storedJson = await AsyncStorage.getItem(STORAGE_KEY_ADDRESSES);
        const storedSelectedId = await AsyncStorage.getItem(
          STORAGE_KEY_SELECTED_ADDRESS_ID,
        );
        const storedOrdersJson = await AsyncStorage.getItem(STORAGE_KEY_ORDERS);
        const storedUserJson = await AsyncStorage.getItem(STORAGE_KEY_USER_PROFILE);

        let parsedAddresses = [];
        if (storedJson) {
          const raw = JSON.parse(storedJson);
          if (Array.isArray(raw) && raw.length > 0) {
            parsedAddresses = raw.map(formatAddressObject);
          }
        }

        if (parsedAddresses.length === 0) {
          parsedAddresses = DEFAULT_SEED_ADDRESSES.map(formatAddressObject);
          await AsyncStorage.setItem(
            STORAGE_KEY_ADDRESSES,
            JSON.stringify(parsedAddresses),
          );
        }

        let parsedOrders = [];
        if (storedOrdersJson) {
          const rawOrders = JSON.parse(storedOrdersJson);
          if (Array.isArray(rawOrders) && rawOrders.length > 0) {
            parsedOrders = rawOrders;
          }
        }

        if (parsedOrders.length === 0) {
          parsedOrders = DEFAULT_SEED_ORDERS;
          await AsyncStorage.setItem(
            STORAGE_KEY_ORDERS,
            JSON.stringify(DEFAULT_SEED_ORDERS),
          );
        }

        let parsedUser = DEFAULT_USER_PROFILE;
        if (storedUserJson) {
          try {
            const rawUser = JSON.parse(storedUserJson);
            if (rawUser && rawUser.name) {
              parsedUser = { ...DEFAULT_USER_PROFILE, ...rawUser };
            }
          } catch (e) {
            console.warn('Failed to parse stored user profile:', e);
          }
        } else {
          await AsyncStorage.setItem(
            STORAGE_KEY_USER_PROFILE,
            JSON.stringify(DEFAULT_USER_PROFILE),
          );
        }

        let parsedCart = {};
        const storedCartJson = await AsyncStorage.getItem(STORAGE_KEY_CART);
        if (storedCartJson) {
          try {
            const rawCart = JSON.parse(storedCartJson);
            if (rawCart && typeof rawCart === 'object') {
              parsedCart = rawCart;
            }
          } catch (e) {
            console.warn('Failed to parse stored cart:', e);
          }
        }

        if (!isMounted) return;
        setAddresses(parsedAddresses);
        setOrders(parsedOrders);
        setUser(parsedUser);
        if (Object.keys(parsedCart).length > 0) {
          setCart(parsedCart);
        }
        setIsCartHydrated(true);

        let targetSelected = null;
        if (storedSelectedId) {
          targetSelected = parsedAddresses.find(a => a.id === storedSelectedId);
        }
        if (!targetSelected) {
          targetSelected =
            parsedAddresses.find(a => a.isDefault) || parsedAddresses[0] || null;
        }

        setSelectedAddress(targetSelected);
        if (targetSelected) {
          await AsyncStorage.setItem(
            STORAGE_KEY_SELECTED_ADDRESS_ID,
            targetSelected.id,
          );
        }
      } catch (err) {
        console.warn('AsyncStorage address load error:', err);
      }
    };

    loadFromStorage();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync cart changes to AsyncStorage for persistence
  useEffect(() => {
    if (!isCartHydrated) return;
    AsyncStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart)).catch(err => {
      console.warn('Failed to persist cart to storage:', err);
    });
  }, [cart, isCartHydrated]);

  // Calculate total items in cart
  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cart]);

  // Calculate total price of cart items (authoritative backend totals when authenticated)
  const cartSubtotal = useMemo(() => {
    if (isAuthenticated && backendCart && backendCart.subtotal !== undefined) {
      return parseFloat(backendCart.subtotal) || 0;
    }
    return Object.values(cart).reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
      0,
    );
  }, [isAuthenticated, backendCart, cart]);

  // Configurable delivery fee and final total
  const deliveryFee = useMemo(() => {
    if (isAuthenticated && backendCart && backendCart.delivery_charge !== undefined) {
      return parseFloat(backendCart.delivery_charge) || 0;
    }
    return cartSubtotal >= FREE_DELIVERY_THRESHOLD || cartSubtotal === 0
      ? 0
      : DEFAULT_DELIVERY_CHARGE;
  }, [isAuthenticated, backendCart, cartSubtotal]);

  const cartTotal = useMemo(() => {
    if (isAuthenticated && backendCart && backendCart.final_total !== undefined) {
      const backendFinal = parseFloat(backendCart.final_total) || 0;
      const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
      return Math.max(0, backendFinal - couponDiscount);
    }
    const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
    return Math.max(0, cartSubtotal + deliveryFee - couponDiscount);
  }, [isAuthenticated, backendCart, cartSubtotal, deliveryFee, appliedCoupon]);

  // Fetch current user's cart from backend
  const fetchBackendCart = useCallback(async () => {
    if (!isAuthenticated) return null;
    setIsCartLoading(true);
    try {
      const res = await cartAPI.getCart();
      if (res && res.data) {
        const serverCart = res.data;
        setBackendCart(serverCart);
        if (Array.isArray(serverCart.items)) {
          const syncedCart = {};
          serverCart.items.forEach(item => {
            syncedCart[item.product_id] = {
              cartItemId: item.id,
              product: {
                id: item.product_id,
                name: item.product_name,
                price: parseFloat(item.product_price),
                unit: item.unit || '1 kg',
                image: item.product_image,
                imageUrl: item.product_image,
                emoji: getEmojiForProduct(item.product_name),
                accentColor: '#E8F5E9',
              },
              unit: item.unit || '1 kg',
              quantity: item.quantity,
              itemSubtotal: parseFloat(item.subtotal),
            };
          });
          setCart(syncedCart);
        }
        setIsCartLoading(false);
        return serverCart;
      }
    } catch (err) {
      console.warn('Failed to fetch backend cart:', err);
    } finally {
      setIsCartLoading(false);
    }
    return null;
  }, [isAuthenticated]);

  // Add item to cart with quantity, unit and stock validation
  const addToCart = useCallback(
    (product, quantityToAdd = 1, selectedUnit = null) => {
      if (!product || !product.id) {
        return { success: false, message: 'Invalid product' };
      }

      const maxStock =
        product.availableStock !== undefined
          ? product.availableStock
          : product.inStock === false
          ? 0
          : 50;

      const existingKey = Object.keys(cart).find(k => k == product.id);
      const existing = existingKey ? cart[existingKey] : null;
      const wasExisting = !!existing;
      const currentQty = existing ? existing.quantity : 0;
      let newQty = currentQty + quantityToAdd;
      let isExceeded = false;

      if (newQty > maxStock) {
        newQty = maxStock;
        isExceeded = true;
      }

      const updatedQty = newQty;

      setCart(prev => {
        if (newQty <= 0) {
          const copy = { ...prev };
          delete copy[product.id];
          delete copy[String(product.id)];
          return copy;
        }

        const activeUnit = selectedUnit?.label || product.unit || '1 kg';
        const unitMultiplier = selectedUnit?.multiplier || 1;
        const calculatedPrice = selectedUnit?.price
          ? selectedUnit.price
          : Math.round(product.price * unitMultiplier);

        return {
          ...prev,
          [product.id]: {
            cartItemId: existing?.cartItemId || null,
            product: {
              ...product,
              price: calculatedPrice,
              unit: activeUnit,
            },
            unit: activeUnit,
            quantity: updatedQty,
          },
        };
      });

      const message = isExceeded
        ? `Maximum available stock reached (${maxStock} items)`
        : wasExisting
        ? `Updated ${product.name} quantity to ${updatedQty}`
        : `Added ${product.name} to cart!`;

      showToast(message, isExceeded ? 'warning' : 'success');

      // If authenticated, sync with backend
      const numId = parseInt(product.id, 10);
      if (isAuthenticated && !isNaN(numId) && numId > 0) {
        cartAPI
          .addItem(numId, quantityToAdd)
          .then(res => {
            if (res?.data?.cart) {
              setBackendCart(res.data.cart);
              if (res.data.item) {
                setCart(prev => {
                  const itemEntry =
                    prev[product.id] || prev[String(product.id)];
                  if (itemEntry) {
                    return {
                      ...prev,
                      [product.id]: {
                        ...itemEntry,
                        cartItemId: res.data.item.id,
                      },
                    };
                  }
                  return prev;
                });
              }
            }
          })
          .catch(err => {
            console.warn('Backend cart add failed:', err);
          });
      }

      return {
        success: true,
        exceeded: isExceeded,
        quantity: updatedQty,
        message,
      };
    },
    [cart, showToast, isAuthenticated],
  );

  // Update specific item quantity directly
  const updateCartQuantity = useCallback(
    (productId, quantity) => {
      if (!productId) return;
      const existingKey = Object.keys(cart).find(k => k == productId);
      const existing = existingKey ? cart[existingKey] : null;

      setCart(prev => {
        if (quantity <= 0) {
          const copy = { ...prev };
          delete copy[productId];
          delete copy[String(productId)];
          return copy;
        }
        if (!existing) return prev;
        return {
          ...prev,
          [productId]: {
            ...existing,
            quantity,
          },
        };
      });

      if (isAuthenticated && existing?.cartItemId) {
        if (quantity <= 0) {
          cartAPI
            .removeItem(existing.cartItemId)
            .then(res => {
              if (res?.data?.cart) setBackendCart(res.data.cart);
            })
            .catch(err => console.warn('Backend remove item failed:', err));
        } else {
          cartAPI
            .updateItem(existing.cartItemId, quantity)
            .then(res => {
              if (res?.data?.cart) setBackendCart(res.data.cart);
            })
            .catch(err => console.warn('Backend update item failed:', err));
        }
      }
    },
    [cart, isAuthenticated],
  );

  // Decrement item from cart (never decreases below 1)
  const removeFromCart = useCallback(
    productId => {
      if (!productId) return;
      const existingKey = Object.keys(cart).find(k => k == productId);
      const existing = existingKey ? cart[existingKey] : null;
      if (!existing) return;
      if (existing.quantity <= 1) {
        return; // Stepper decrement never reduces below 1
      }
      const nextQty = existing.quantity - 1;

      setCart(prev => {
        return {
          ...prev,
          [productId]: {
            ...existing,
            quantity: nextQty,
          },
        };
      });

      if (isAuthenticated && existing?.cartItemId) {
        cartAPI
          .updateItem(existing.cartItemId, nextQty)
          .then(res => {
            if (res?.data?.cart) setBackendCart(res.data.cart);
          })
          .catch(err => console.warn('Backend decrement item failed:', err));
      }
    },
    [cart, isAuthenticated],
  );

  // Get current quantity of product in cart
  const getItemQuantity = useCallback(
    productId => {
      if (productId === undefined || productId === null) return 0;
      return (
        cart[productId]?.quantity ||
        cart[String(productId)]?.quantity ||
        cart[Number(productId)]?.quantity ||
        0
      );
    },
    [cart],
  );

  // Get full cart item entry
  const getItemCartData = useCallback(
    productId => {
      if (productId === undefined || productId === null) return null;
      return (
        cart[productId] ||
        cart[String(productId)] ||
        cart[Number(productId)] ||
        null
      );
    },
    [cart],
  );

  // Remove item completely from cart
  const removeCartItem = useCallback(
    productId => {
      if (!productId) return;
      const existingKey = Object.keys(cart).find(k => k == productId);
      const existing = existingKey ? cart[existingKey] : null;

      setCart(prev => {
        const copy = { ...prev };
        delete copy[productId];
        delete copy[String(productId)];
        if (existing) {
          showToast(`Removed ${existing.product?.name || 'item'} from cart`, 'info');
        }
        return copy;
      });

      if (isAuthenticated && existing?.cartItemId) {
        cartAPI
          .removeItem(existing.cartItemId)
          .then(res => {
            if (res?.data?.cart) setBackendCart(res.data.cart);
          })
          .catch(err => console.warn('Backend delete item failed:', err));
      }
    },
    [cart, showToast, isAuthenticated],
  );

  // Clear all items in cart
  const clearCart = useCallback(() => {
    setCart({});
    setBackendCart(null);
    setAppliedCoupon(null);
    showToast('Shopping cart cleared', 'info');
    AsyncStorage.removeItem(STORAGE_KEY_CART).catch(err => {
      console.warn('Failed to clear cart storage:', err);
    });
    if (isAuthenticated) {
      cartAPI
        .clearCart()
        .then(res => {
          if (res?.data?.cart) setBackendCart(res.data.cart);
        })
        .catch(err => console.warn('Backend clear cart failed:', err));
    }
  }, [showToast, isAuthenticated]);

  // Apply discount coupon
  const applyCoupon = useCallback((code, currentSubtotal) => {
    if (!code) return { success: false, message: 'Please enter a coupon code' };
    const cleanCode = code.trim().toUpperCase();

    if (cleanCode === 'FRESH20') {
      const discount = Math.round((currentSubtotal || 0) * 0.2);
      const couponObj = {
        code: 'FRESH20',
        label: '20% OFF New User Offer',
        discount: Math.min(discount, 120),
      };
      setAppliedCoupon(couponObj);
      return {
        success: true,
        message: `Coupon FRESH20 applied! Saved ₹${couponObj.discount}`,
        coupon: couponObj,
      };
    }

    if (cleanCode === 'FRESHFARM') {
      const discount = Math.round((currentSubtotal || 0) * 0.15);
      const couponObj = {
        code: 'FRESHFARM',
        label: '15% OFF Farm Direct',
        discount: Math.min(discount, 80),
      };
      setAppliedCoupon(couponObj);
      return {
        success: true,
        message: `Coupon FRESHFARM applied! Saved ₹${couponObj.discount}`,
        coupon: couponObj,
      };
    }

    if (cleanCode === 'HARVEST') {
      const discount = Math.min(25, currentSubtotal || 25);
      const couponObj = {
        code: 'HARVEST',
        label: 'Flat ₹25 OFF',
        discount,
      };
      setAppliedCoupon(couponObj);
      return {
        success: true,
        message: `Coupon HARVEST applied! Saved ₹${discount}`,
        coupon: couponObj,
      };
    }

    return {
      success: false,
      message: 'Invalid coupon code. Try FRESH20, FRESHFARM, or HARVEST.',
    };
  }, []);

  // Remove active coupon
  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback(productId => {
    if (!productId) return;
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  // Check if item is favorite
  const isFavorite = useCallback(
    productId => {
      return favorites.includes(productId);
    },
    [favorites],
  );

  // Count unread notifications
  const unreadNotifCount = useMemo(() => {
    return notifications.filter(n => n.unread).length;
  }, [notifications]);

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  // --- ADDRESS MANAGEMENT METHODS ---

  // Fetch addresses from backend
  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return null;
    setIsAddressesLoading(true);
    try {
      const res = await addressAPI.getAll();
      if (res && res.data && Array.isArray(res.data)) {
        const normalizedList = res.data.map(normalizeBackendAddress);
        setAddresses(normalizedList);
        await AsyncStorage.setItem(
          STORAGE_KEY_ADDRESSES,
          JSON.stringify(normalizedList),
        );
        const defaultAddr =
          normalizedList.find(a => a.isDefault) || normalizedList[0] || null;
        setSelectedAddress(defaultAddr);
        if (defaultAddr) {
          await AsyncStorage.setItem(
            STORAGE_KEY_SELECTED_ADDRESS_ID,
            String(defaultAddr.id),
          );
        }
        return normalizedList;
      }
    } catch (err) {
      console.warn('Failed to fetch addresses from backend:', err);
    } finally {
      setIsAddressesLoading(false);
    }
    return null;
  }, [isAuthenticated]);

  // Add new address
  const addAddress = useCallback(
    async newAddressData => {
      if (isAuthenticated) {
        try {
          const res = await addressAPI.create(newAddressData);
          if (res && res.data) {
            const formatted = normalizeBackendAddress(res.data);
            setAddresses(prev => {
              const adjustedPrev = formatted.isDefault
                ? prev.map(a => ({ ...a, isDefault: false }))
                : prev;
              return [formatted, ...adjustedPrev];
            });
            if (formatted.isDefault || !selectedAddress) {
              setSelectedAddress(formatted);
              await AsyncStorage.setItem(
                STORAGE_KEY_SELECTED_ADDRESS_ID,
                String(formatted.id),
              );
            }
            showToast('Address added successfully', 'success');
            return { success: true, address: formatted };
          }
        } catch (err) {
          console.warn('Backend addAddress error:', err);
          const errMsg = formatApiError(err);
          showToast(
            typeof errMsg === 'string' ? errMsg : 'Failed to add address',
            'error',
          );
          return { success: false, message: errMsg };
        }
      }

      // Guest offline fallback
      const newId = `addr_${Date.now()}`;
      const shouldBeDefault = !!newAddressData.isDefault;

      let formattedNew = null;
      let nextList = [];

      setAddresses(prev => {
        const willBeOnly = prev.length === 0;
        const isDefault = shouldBeDefault || willBeOnly;

        formattedNew = formatAddressObject({
          ...newAddressData,
          id: newId,
          isDefault,
        });

        const adjustedPrev = isDefault
          ? prev.map(a => formatAddressObject({ ...a, isDefault: false }))
          : prev;

        nextList = [formattedNew, ...adjustedPrev];
        return nextList;
      });

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_ADDRESSES,
          JSON.stringify(nextList),
        );
        if (formattedNew?.isDefault || !selectedAddress) {
          setSelectedAddress(formattedNew);
          await AsyncStorage.setItem(STORAGE_KEY_SELECTED_ADDRESS_ID, newId);
        }
      } catch (err) {
        console.warn('Failed to save added address:', err);
      }

      return { success: true, address: formattedNew };
    },
    [isAuthenticated, selectedAddress, showToast],
  );

  // Update existing address
  const updateAddress = useCallback(
    async (addressId, updatedData) => {
      const isBackendId = typeof addressId === 'number' || !isNaN(Number(addressId)) && !String(addressId).startsWith('addr_');
      if (isAuthenticated && isBackendId) {
        try {
          const res = await addressAPI.update(Number(addressId), updatedData);
          if (res && res.data) {
            const formatted = normalizeBackendAddress(res.data);
            setAddresses(prev => {
              return prev.map(a => {
                if (a.id === addressId || a.id === Number(addressId)) {
                  return formatted;
                }
                if (formatted.isDefault) {
                  return { ...a, isDefault: false };
                }
                return a;
              });
            });
            if (formatted.isDefault || selectedAddress?.id === addressId) {
              setSelectedAddress(formatted);
              await AsyncStorage.setItem(
                STORAGE_KEY_SELECTED_ADDRESS_ID,
                String(addressId),
              );
            }
            showToast('Address updated successfully', 'success');
            return { success: true, address: formatted };
          }
        } catch (err) {
          console.warn('Backend updateAddress error:', err);
          const errMsg = formatApiError(err);
          showToast(
            typeof errMsg === 'string' ? errMsg : 'Failed to update address',
            'error',
          );
          return { success: false, message: errMsg };
        }
      }

      // Guest / local fallback
      let formattedUpdated = null;
      let nextList = [];

      setAddresses(prev => {
        const isDefault = !!updatedData.isDefault;
        nextList = prev.map(a => {
          if (a.id === addressId) {
            formattedUpdated = formatAddressObject({
              ...a,
              ...updatedData,
              id: addressId,
            });
            return formattedUpdated;
          }
          if (isDefault) {
            return formatAddressObject({ ...a, isDefault: false });
          }
          return a;
        });
        return nextList;
      });

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_ADDRESSES,
          JSON.stringify(nextList),
        );
        if (formattedUpdated?.isDefault || selectedAddress?.id === addressId) {
          setSelectedAddress(formattedUpdated);
          await AsyncStorage.setItem(
            STORAGE_KEY_SELECTED_ADDRESS_ID,
            String(addressId),
          );
        }
      } catch (err) {
        console.warn('Failed to save updated address:', err);
      }

      return { success: true, address: formattedUpdated };
    },
    [isAuthenticated, selectedAddress, showToast],
  );

  // Delete address
  const deleteAddress = useCallback(
    async addressId => {
      const isBackendId = typeof addressId === 'number' || !isNaN(Number(addressId)) && !String(addressId).startsWith('addr_');
      if (isAuthenticated && isBackendId) {
        try {
          await addressAPI.delete(Number(addressId));
          showToast('Address deleted successfully', 'info');
        } catch (err) {
          console.warn('Backend deleteAddress error:', err);
          const errMsg = formatApiError(err);
          showToast(
            typeof errMsg === 'string' ? errMsg : 'Failed to delete address',
            'error',
          );
          return { success: false, message: errMsg };
        }
      }

      let nextList = [];
      let nextSelected = null;

      setAddresses(prev => {
        nextList = prev.filter(a => a.id !== addressId && a.id !== Number(addressId));
        return nextList;
      });

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_ADDRESSES,
          JSON.stringify(nextList),
        );

        if (selectedAddress?.id === addressId || selectedAddress?.id === Number(addressId)) {
          nextSelected =
            nextList.find(a => a.isDefault) || nextList[0] || null;
          setSelectedAddress(nextSelected);
          if (nextSelected) {
            await AsyncStorage.setItem(
              STORAGE_KEY_SELECTED_ADDRESS_ID,
              String(nextSelected.id),
            );
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_ADDRESS_ID);
          }
        }
      } catch (err) {
        console.warn('Failed to delete address:', err);
      }

      return { success: true };
    },
    [isAuthenticated, selectedAddress, showToast],
  );

  // Select delivery address
  const selectDeliveryAddress = useCallback(
    async addressId => {
      const target = addresses.find(
        a => a.id === addressId || String(a.id) === String(addressId),
      );
      if (target) {
        setSelectedAddress(target);
        try {
          await AsyncStorage.setItem(
            STORAGE_KEY_SELECTED_ADDRESS_ID,
            String(addressId),
          );
        } catch (err) {
          console.warn('Failed to save selected address ID:', err);
        }
        return { success: true, address: target };
      }
      return { success: false, message: 'Address not found' };
    },
    [addresses],
  );

  // Set default address
  const setDefaultAddress = useCallback(
    async addressId => {
      const isBackendId = typeof addressId === 'number' || !isNaN(Number(addressId)) && !String(addressId).startsWith('addr_');
      if (isAuthenticated && isBackendId) {
        try {
          const res = await addressAPI.setDefault(Number(addressId));
          if (res && res.data) {
            const formatted = normalizeBackendAddress(res.data);
            setAddresses(prev =>
              prev.map(a =>
                a.id === addressId || a.id === Number(addressId)
                  ? formatted
                  : { ...a, isDefault: false },
              ),
            );
            setSelectedAddress(formatted);
            await AsyncStorage.setItem(
              STORAGE_KEY_SELECTED_ADDRESS_ID,
              String(addressId),
            );
            showToast('Default delivery address updated', 'success');
            return { success: true, address: formatted };
          }
        } catch (err) {
          console.warn('Backend setDefault error:', err);
          const errMsg = formatApiError(err);
          showToast(
            typeof errMsg === 'string'
              ? errMsg
              : 'Failed to set default address',
            'error',
          );
          return { success: false, message: errMsg };
        }
      }

      let nextList = [];
      let targetDefault = null;

      setAddresses(prev => {
        nextList = prev.map(a => {
          const isTarget = a.id === addressId;
          const formatted = formatAddressObject({ ...a, isDefault: isTarget });
          if (isTarget) targetDefault = formatted;
          return formatted;
        });
        return nextList;
      });

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_ADDRESSES,
          JSON.stringify(nextList),
        );
        if (targetDefault) {
          setSelectedAddress(targetDefault);
          await AsyncStorage.setItem(
            STORAGE_KEY_SELECTED_ADDRESS_ID,
            String(addressId),
          );
        }
      } catch (err) {
        console.warn('Failed to set default address:', err);
      }

      return { success: true, address: targetDefault };
    },
    [isAuthenticated, showToast],
  );

  // --- DELIVERY SLOTS METHODS ---

  // Fetch delivery slots from backend
  const fetchDeliverySlots = useCallback(async (dateParam = null) => {
    setIsSlotsLoading(true);
    try {
      const params = dateParam ? { date: dateParam } : {};
      const res = await deliverySlotAPI.getSlots(params);
      if (res && res.data && Array.isArray(res.data)) {
        const normalized = res.data.map(normalizeDeliverySlot);
        setDeliverySlots(normalized);
        setIsSlotsLoading(false);
        return normalized;
      }
    } catch (err) {
      console.warn('Failed to fetch delivery slots:', err);
    } finally {
      setIsSlotsLoading(false);
    }
    return [];
  }, []);

  // --- ORDER MANAGEMENT METHODS ---

  // Fetch customer orders from backend
  const fetchOrders = useCallback(
    async (params = {}) => {
      if (!isAuthenticated) return orders;
      setIsOrdersLoading(true);
      try {
        const res = await orderAPI.getAll(params);
        const list = res.data?.results || res.data;
        if (Array.isArray(list)) {
          const normalizedList = list.map(normalizeBackendOrder);
          setOrders(normalizedList);
          await AsyncStorage.setItem(
            STORAGE_KEY_ORDERS,
            JSON.stringify(normalizedList),
          );
          setIsOrdersLoading(false);
          return normalizedList;
        }
      } catch (err) {
        console.warn('Failed to fetch orders from backend:', err);
      } finally {
        setIsOrdersLoading(false);
      }
      return orders;
    },
    [isAuthenticated, orders],
  );

  // Fetch full order details
  const fetchOrderDetails = useCallback(
    async orderNumber => {
      if (!orderNumber) return null;
      if (isAuthenticated) {
        try {
          const res = await orderAPI.getByOrderNumber(orderNumber);
          if (res && res.data) {
            const normalized = normalizeBackendOrder(res.data);
            setOrders(prev =>
              prev.map(o =>
                o.id === orderNumber || o.orderNumber === orderNumber
                  ? normalized
                  : o,
              ),
            );
            return normalized;
          }
        } catch (err) {
          console.warn(`Failed to fetch details for order ${orderNumber}:`, err);
        }
      }
      return getOrderById(orderNumber);
    },
    [isAuthenticated, getOrderById],
  );

  // Place new order
  const placeOrder = useCallback(
    async orderData => {
      if (isAuthenticated) {
        try {
          let paymentMethodCode = 'COD';
          const pm = (
            orderData.payment ||
            orderData.payment_method ||
            ''
          ).toLowerCase();
          if (pm.includes('upi')) {
            paymentMethodCode = 'UPI';
          } else if (
            pm.includes('card') ||
            pm.includes('netbanking') ||
            pm.includes('online')
          ) {
            paymentMethodCode = 'online';
          }

          const targetAddressId =
            orderData.address_id ||
            orderData.address?.id ||
            selectedAddress?.id;

          const payload = {
            address_id: parseInt(targetAddressId, 10),
            delivery_slot_id:
              orderData.delivery_slot_id ||
              (orderData.deliverySlot?.id
                ? parseInt(orderData.deliverySlot.id, 10)
                : null),
            payment_method: paymentMethodCode,
            customer_note:
              orderData.customer_note || orderData.customerNote || '',
          };

          const res = await orderAPI.checkout(payload);
          if (res && res.data) {
            const rawOrder = res.data.order;
            const normalized = normalizeBackendOrder(rawOrder);

            setOrders(prev => [
              normalized,
              ...prev.filter(o => o.id !== normalized.id),
            ]);
            await AsyncStorage.setItem(
              STORAGE_KEY_ORDERS,
              JSON.stringify([
                normalized,
                ...orders.filter(o => o.id !== normalized.id),
              ]),
            );

            // Clear cart
            clearCart();

            showToast(
              res.data.message || `Order #${normalized.id} placed successfully!`,
              'success',
            );
            return normalized;
          }
        } catch (err) {
          console.warn('Backend placeOrder failed:', err);
          const errMsg = formatApiError(err);
          showToast(
            typeof errMsg === 'string' ? errMsg : 'Failed to place order',
            'error',
          );
          throw new Error(
            typeof errMsg === 'string' ? errMsg : 'Checkout failed',
          );
        }
      }

      // Guest / offline local simulation fallback
      const orderId =
        orderData.orderId ||
        `FV-${Math.floor(10000 + Math.random() * 90000)}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateStr = `Today, ${timeStr}`;

      const newOrder = {
        id: orderId,
        orderId,
        orderNumber: orderId,
        date: dateStr,
        createdAt: now.toISOString(),
        status: 'Order Placed',
        order_status: 'pending',
        stage: 1,
        estimatedDelivery: orderData.slot ? `${orderData.slot}` : '20 - 30 mins',
        slot: orderData.slot || 'Instant Delivery (20-30 mins)',
        deliveryDate: orderData.date || 'Today',
        paymentMethod: orderData.payment || 'Cash on Delivery (COD)',
        paymentStatus:
          orderData.payment &&
          orderData.payment.toLowerCase().includes('cash')
            ? 'Pending (Pay on delivery)'
            : 'Paid Online',
        itemsCount: orderData.itemsCount || 0,
        subtotal: orderData.subtotal || 0,
        deliveryFee: orderData.deliveryFee || 0,
        discount: orderData.discount || 0,
        coupon: orderData.coupon || null,
        grandTotal: orderData.grandTotal || 0,
        address: orderData.address || selectedAddress,
        deliveryPartner: {
          name: 'Ramesh Kumar',
          phone: '+91 98220 12345',
          rating: '4.9',
          deliveries: '1,240+',
          vehicle: 'Electric Cargo Scooter (MH-12-VG-4521)',
          avatar: '🛵',
        },
        timeline: [
          {
            step: 1,
            title: 'Order Placed',
            time: timeStr,
            desc: 'Order received and verified',
            completed: true,
            current: true,
          },
          {
            step: 2,
            title: 'Order Confirmed',
            time: 'In ~2 mins',
            desc: 'Farm inventory reserved',
            completed: false,
          },
          {
            step: 3,
            title: 'Preparing Order',
            time: 'In ~5 mins',
            desc: 'Harvested & packed fresh',
            completed: false,
          },
          {
            step: 4,
            title: 'Out for Delivery',
            time: 'In ~15 mins',
            desc: 'Partner on the way to you',
            completed: false,
          },
          {
            step: 5,
            title: 'Delivered',
            time: 'In ~25 mins',
            desc: 'Handed over at doorstep',
            completed: false,
          },
        ],
        items: orderData.items || [],
      };

      let nextOrders = [];
      setOrders(prev => {
        nextOrders = [newOrder, ...prev];
        return nextOrders;
      });

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_ORDERS,
          JSON.stringify(nextOrders),
        );
      } catch (err) {
        console.warn('Failed to save placed order:', err);
      }

      clearCart();
      return newOrder;
    },
    [isAuthenticated, selectedAddress, orders, clearCart, showToast],
  );

  // Cancel existing order
  const cancelOrder = useCallback(
    async (orderId, reason = 'Cancelled by user') => {
      const target = orders.find(
        o =>
          o.id === orderId ||
          o.orderNumber === orderId ||
          o.orderId === orderId,
      );

      if (
        isAuthenticated &&
        (target?.orderNumber ||
          target?.backendId ||
          String(orderId).startsWith('FV-'))
      ) {
        try {
          const orderNum = target?.orderNumber || orderId;
          const res = await orderAPI.cancel(orderNum, { reason });
          if (res && res.data) {
            const normalized = normalizeBackendOrder(res.data.order);
            setOrders(prev =>
              prev.map(o =>
                o.id === orderId || o.orderNumber === orderId ? normalized : o,
              ),
            );
            showToast('Order cancelled successfully', 'info');
            return {
              success: true,
              order: normalized,
              message: res.data.message,
            };
          }
        } catch (err) {
          console.warn('Backend cancelOrder failed:', err);
          const errMsg = formatApiError(err);
          showToast(
            typeof errMsg === 'string' ? errMsg : 'Failed to cancel order',
            'error',
          );
          return { success: false, message: errMsg };
        }
      }

      // Guest / local fallback
      let nextOrders = [];
      let cancelledOrder = null;
      let error = null;

      setOrders(prev => {
        const currentTarget = prev.find(
          o =>
            o.id === orderId ||
            o.orderNumber === orderId ||
            o.orderId === orderId,
        );
        if (!currentTarget) {
          error = 'Order not found';
          return prev;
        }
        if (currentTarget.status === 'Delivered' || currentTarget.isDelivered) {
          error = 'Delivered orders cannot be cancelled';
          return prev;
        }
        if (currentTarget.status === 'Cancelled' || currentTarget.isCancelled) {
          error = 'Order is already cancelled';
          return prev;
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        cancelledOrder = {
          ...currentTarget,
          status: 'Cancelled',
          order_status: 'cancelled',
          stage: 0,
          isCancelled: true,
          cancelReason: reason,
          paymentStatus: 'Cancelled',
          timeline: [
            ...(currentTarget.timeline || []).filter(t => t.completed),
            {
              step: 99,
              title: 'Order Cancelled',
              time: timeStr,
              desc: reason,
              completed: true,
              current: true,
              cancelled: true,
            },
          ],
        };

        nextOrders = prev.map(o => (o.id === orderId ? cancelledOrder : o));
        return nextOrders;
      });

      if (error) {
        return { success: false, message: error };
      }

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_ORDERS,
          JSON.stringify(nextOrders),
        );
      } catch (err) {
        console.warn('Failed to save cancelled order:', err);
      }

      return { success: true, order: cancelledOrder };
    },
    [isAuthenticated, orders, showToast],
  );

  // Reorder items: add items from past order back to cart
  const reorder = useCallback(
    orderId => {
      const target = orders.find(
        o =>
          o.id === orderId ||
          o.orderNumber === orderId ||
          o.orderId === orderId,
      );
      if (!target || !target.items || target.items.length === 0) {
        return { success: false, message: 'No items found in this order' };
      }

      let count = 0;
      target.items.forEach(item => {
        const prod = {
          id: item.productId || item.id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          emoji: item.emoji,
          accentColor: item.accentColor,
        };
        addToCart(prod, item.quantity, {
          label: item.unit,
          price: item.price,
        });
        count += item.quantity;
      });

      return {
        success: true,
        addedCount: count,
        message: `Added ${count} item${count > 1 ? 's' : ''} to basket!`,
      };
    },
    [orders, addToCart],
  );

  // Get order by ID
  const getOrderById = useCallback(
    orderId => {
      return (
        orders.find(
          o =>
            o.id === orderId ||
            o.orderNumber === orderId ||
            o.orderId === orderId ||
            String(o.backendId) === String(orderId),
        ) || null
      );
    },
    [orders],
  );

  // Update user profile
  const updateUserProfile = useCallback(
    async updatedData => {
      if (!updatedData) {
        return { success: false, message: 'No profile data provided.' };
      }

      if (isAuthenticated) {
        try {
          const patchPayload = {};
          if (
            updatedData.name !== undefined ||
            updatedData.full_name !== undefined
          ) {
            const rawName =
              updatedData.name !== undefined
                ? updatedData.name
                : updatedData.full_name;
            patchPayload.full_name = (rawName || '').trim();
          }
          if (updatedData.email !== undefined) {
            patchPayload.email = (updatedData.email || '').trim().toLowerCase();
          }
          if (
            updatedData.phone !== undefined ||
            updatedData.phone_number !== undefined
          ) {
            const rawPhone =
              updatedData.phone !== undefined
                ? updatedData.phone
                : updatedData.phone_number;
            patchPayload.phone_number = String(rawPhone || '').replace(/\D/g, '');
          }

          const res = await authAPI.updateProfile(patchPayload);
          const backendProfile = res?.data?.profile || res?.data;

          if (backendProfile) {
            const formatted = formatUserProfile(backendProfile);
            // Preserve frontend-only properties (avatar, bio) from existing user or updatedData
            const nextUser = {
              ...formatted,
              avatar:
                updatedData.avatar !== undefined
                  ? updatedData.avatar
                  : user?.avatar || formatted.avatar || '🥦',
              bio:
                updatedData.bio !== undefined
                  ? updatedData.bio
                  : user?.bio ||
                    formatted.bio ||
                    'Farm fresh vegetable enthusiast',
            };

            setUser(nextUser);
            await AsyncStorage.setItem(
              STORAGE_KEY_USER_PROFILE,
              JSON.stringify(nextUser),
            );

            return { success: true, user: nextUser };
          }
        } catch (err) {
          console.warn('Backend updateProfile error:', err);
          const errMsg = formatApiError(err);
          const errorMsgStr =
            typeof errMsg === 'string'
              ? errMsg
              : 'Failed to update profile. Please try again.';
          return { success: false, message: errorMsgStr };
        }
      }

      // Guest / unauthenticated fallback: local-only update
      const nextUser = {
        ...(user || DEFAULT_USER_PROFILE),
        ...updatedData,
      };
      setUser(nextUser);

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_USER_PROFILE,
          JSON.stringify(nextUser),
        );
      } catch (err) {
        console.warn('Failed to save user profile to AsyncStorage:', err);
      }

      return { success: true, user: nextUser };
    },
    [isAuthenticated, user],
  );

  // Session verification against backend
  const verifySession = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
      if (!token) {
        setAuthToken(null);
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        return { authenticated: false };
      }

      // Check token validity with backend
      try {
        const res = await authAPI.getProfile();
        if (res && res.data) {
          const profile = formatUserProfile(res.data);
          setUser(profile);
          setAuthToken(token);
          setIsAuthenticated(true);
          await AsyncStorage.setItem(
            STORAGE_KEY_USER_PROFILE,
            JSON.stringify(profile),
          );

          // Fetch authenticated cart, addresses, orders, and delivery slots in background
          try {
            const [cartRes, addrRes, orderRes, slotRes] = await Promise.all([
              cartAPI.getCart(),
              addressAPI.getAll(),
              orderAPI.getAll(),
              deliverySlotAPI.getSlots(),
            ]);
            if (cartRes?.data) {
              const serverCart = cartRes.data;
              setBackendCart(serverCart);
              if (Array.isArray(serverCart.items)) {
                const syncedCart = {};
                serverCart.items.forEach(item => {
                  syncedCart[item.product_id] = {
                    cartItemId: item.id,
                    product: {
                      id: item.product_id,
                      name: item.product_name,
                      price: parseFloat(item.product_price),
                      unit: item.unit || '1 kg',
                      image: item.product_image,
                      imageUrl: item.product_image,
                      emoji: getEmojiForProduct(item.product_name),
                      accentColor: '#E8F5E9',
                    },
                    unit: item.unit || '1 kg',
                    quantity: item.quantity,
                    itemSubtotal: parseFloat(item.subtotal),
                  };
                });
                setCart(syncedCart);
              }
            }
            if (addrRes?.data && Array.isArray(addrRes.data)) {
              const normalized = addrRes.data.map(normalizeBackendAddress);
              setAddresses(normalized);
              const def =
                normalized.find(a => a.isDefault) || normalized[0] || null;
              setSelectedAddress(def);
            }
            if (orderRes?.data) {
              const orderList = orderRes.data?.results || orderRes.data;
              if (Array.isArray(orderList) && orderList.length > 0) {
                setOrders(orderList.map(normalizeBackendOrder));
              }
            }
            if (slotRes?.data && Array.isArray(slotRes.data)) {
              setDeliverySlots(slotRes.data.map(normalizeDeliverySlot));
            }
          } catch (loadErr) {
            console.warn('Initial data load warning in verifySession:', loadErr);
          }

          setIsAuthLoading(false);
          return { authenticated: true, user: profile };
        }
      } catch (err) {
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          // Token is invalid/expired
          await AsyncStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
          setAuthToken(null);
          setIsAuthenticated(false);
          setUser(DEFAULT_USER_PROFILE);
          setIsAuthLoading(false);
          return { authenticated: false };
        }

        // Offline / Network Resilience: load cached user profile if present
        const cachedUserJson = await AsyncStorage.getItem(
          STORAGE_KEY_USER_PROFILE,
        );
        if (cachedUserJson) {
          const cachedUser = JSON.parse(cachedUserJson);
          setUser(cachedUser);
          setAuthToken(token);
          setIsAuthenticated(true);
          setIsAuthLoading(false);
          return { authenticated: true, user: cachedUser, offline: true };
        }
      }
    } catch (e) {
      console.warn('Session verification error:', e);
    }
    setAuthToken(null);
    setIsAuthenticated(false);
    setIsAuthLoading(false);
    return { authenticated: false };
  }, []);

  // Login user session
  const loginUser = useCallback(
    async (userData, token) => {
      try {
        if (token) {
          await AsyncStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
          setAuthToken(token);
        }
        if (userData) {
          const profile = formatUserProfile(userData);
          setUser(profile);
          setIsAuthenticated(true);
          await AsyncStorage.setItem(
            STORAGE_KEY_USER_PROFILE,
            JSON.stringify(profile),
          );

          // Guest cart sync: upload any pending guest cart items to backend
          const guestItems = Object.values(cart);
          if (guestItems.length > 0) {
            for (const item of guestItems) {
              const numId = parseInt(item.product?.id, 10);
              if (!isNaN(numId) && numId > 0 && item.quantity > 0) {
                try {
                  await cartAPI.addItem(numId, item.quantity);
                } catch (syncErr) {
                  console.warn('Guest cart item sync warning:', syncErr);
                }
              }
            }
          }

          // Fetch live user cart, addresses, orders, and delivery slots
          try {
            const [cartRes, addrRes, orderRes, slotRes] = await Promise.all([
              cartAPI.getCart(),
              addressAPI.getAll(),
              orderAPI.getAll(),
              deliverySlotAPI.getSlots(),
            ]);
            if (cartRes?.data) {
              const serverCart = cartRes.data;
              setBackendCart(serverCart);
              if (Array.isArray(serverCart.items)) {
                const syncedCart = {};
                serverCart.items.forEach(item => {
                  syncedCart[item.product_id] = {
                    cartItemId: item.id,
                    product: {
                      id: item.product_id,
                      name: item.product_name,
                      price: parseFloat(item.product_price),
                      unit: item.unit || '1 kg',
                      image: item.product_image,
                      imageUrl: item.product_image,
                      emoji: getEmojiForProduct(item.product_name),
                      accentColor: '#E8F5E9',
                    },
                    unit: item.unit || '1 kg',
                    quantity: item.quantity,
                    itemSubtotal: parseFloat(item.subtotal),
                  };
                });
                setCart(syncedCart);
              }
            }
            if (addrRes?.data && Array.isArray(addrRes.data)) {
              const normalized = addrRes.data.map(normalizeBackendAddress);
              setAddresses(normalized);
              const def =
                normalized.find(a => a.isDefault) || normalized[0] || null;
              setSelectedAddress(def);
            }
            if (orderRes?.data) {
              const orderList = orderRes.data?.results || orderRes.data;
              if (Array.isArray(orderList) && orderList.length > 0) {
                setOrders(orderList.map(normalizeBackendOrder));
              }
            }
            if (slotRes?.data && Array.isArray(slotRes.data)) {
              setDeliverySlots(slotRes.data.map(normalizeDeliverySlot));
            }
          } catch (fetchErr) {
            console.warn(
              'Failed to load server data on login:',
              fetchErr,
            );
          }
        }
      } catch (err) {
        console.warn('Failed to save login session:', err);
      }
    },
    [cart],
  );

  // Logout user
  const logoutUser = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore network errors during logout; sensitive local data must be purged
    }
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEY_USER_PROFILE);
      await AsyncStorage.removeItem(STORAGE_KEY_CART);
    } catch (err) {
      console.warn('Failed to clear session storage:', err);
    }
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(DEFAULT_USER_PROFILE);
    setBackendCart(null);
    setCart({});
    setAddresses(DEFAULT_SEED_ADDRESSES.map(formatAddressObject));
    setSelectedAddress(formatAddressObject(DEFAULT_SEED_ADDRESSES[0]));
    setOrders(DEFAULT_SEED_ORDERS);
    setDeliverySlots([]);
    return { success: true };
  }, []);

  // Register unauthorized response interceptor
  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      setAuthToken(null);
      setIsAuthenticated(false);
      setUser(DEFAULT_USER_PROFILE);
    });
  }, []);

  const value = useMemo(
    () => ({
      // Cart
      cart,
      backendCart,
      isCartLoading,
      fetchBackendCart,
      cartCount,
      cartSubtotal,
      deliveryFee,
      cartTotal,
      DEFAULT_DELIVERY_CHARGE,
      FREE_DELIVERY_THRESHOLD,
      addToCart,
      removeFromCart,
      getItemQuantity,
      getItemCartData,
      updateCartQuantity,
      removeCartItem,
      clearCart,
      appliedCoupon,
      applyCoupon,
      removeCoupon,

      // Toast Notification
      toast,
      showToast,
      hideToast,

      // Favorites
      favorites,
      toggleFavorite,
      isFavorite,

      // Addresses
      addresses,
      setAddresses,
      selectedAddress,
      setSelectedAddress,
      isAddressesLoading,
      fetchAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      selectDeliveryAddress,
      setDefaultAddress,

      // Delivery Slots
      deliverySlots,
      isSlotsLoading,
      fetchDeliverySlots,

      // Orders
      orders,
      isOrdersLoading,
      fetchOrders,
      fetchOrderDetails,
      placeOrder,
      cancelOrder,
      reorder,
      getOrderById,

      // Notifications
      notifications,
      unreadNotifCount,
      markAllNotificationsRead,

      // User & Authentication
      user,
      setUser,
      authToken,
      isAuthenticated,
      isAuthLoading,
      verifySession,
      loginUser,
      updateUserProfile,
      logoutUser,
    }),
    [
      cart,
      backendCart,
      isCartLoading,
      fetchBackendCart,
      cartCount,
      cartSubtotal,
      deliveryFee,
      cartTotal,
      addToCart,
      removeFromCart,
      getItemQuantity,
      getItemCartData,
      updateCartQuantity,
      removeCartItem,
      clearCart,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      toast,
      showToast,
      hideToast,
      favorites,
      toggleFavorite,
      isFavorite,
      addresses,
      selectedAddress,
      isAddressesLoading,
      fetchAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      selectDeliveryAddress,
      setDefaultAddress,
      deliverySlots,
      isSlotsLoading,
      fetchDeliverySlots,
      orders,
      isOrdersLoading,
      fetchOrders,
      fetchOrderDetails,
      placeOrder,
      cancelOrder,
      reorder,
      getOrderById,
      notifications,
      unreadNotifCount,
      markAllNotificationsRead,
      user,
      authToken,
      isAuthenticated,
      isAuthLoading,
      verifySession,
      loginUser,
      updateUserProfile,
      logoutUser,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
