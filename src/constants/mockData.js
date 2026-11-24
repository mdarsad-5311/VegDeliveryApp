// FreshVeg Mock Data for Home Screen, Categories, Banners, and Products

export const PROMO_BANNERS = [
  {
    id: 'banner-1',
    title: 'Fresh Vegetables\nDelivered Daily',
    subtitle: 'Directly from organic certified farms to your kitchen',
    badge: 'FARM DIRECT',
    badgeColor: '#2E7D32',
    discount: 'Up to 30% OFF',
    code: 'FRESHFARM',
    ctaText: 'Shop Now',
    bgColor: '#1B5E20',
    accentColor: '#81C784',
    emoji: '🥬',
    category: 'cat-leafy',
  },
  {
    id: 'banner-2',
    title: 'Get 20% OFF on\nYour First Order',
    subtitle: 'Use coupon at checkout for instant seasonal savings',
    badge: 'NEW USER OFFER',
    badgeColor: '#E65100',
    discount: 'FLAT 20% OFF',
    code: 'FRESH20',
    ctaText: 'Claim Now',
    bgColor: '#E65100',
    accentColor: '#FFB74D',
    emoji: '🎉',
    category: 'all',
  },
  {
    id: 'banner-3',
    title: 'Farm Fresh Products\nat Best Prices',
    subtitle: 'Organic greens and exotic veggies starting from ₹19',
    badge: 'HARVEST DEALS',
    badgeColor: '#00695C',
    discount: 'STARTING ₹19',
    code: 'HARVEST',
    ctaText: 'Explore Deals',
    bgColor: '#00695C',
    accentColor: '#80CBC4',
    emoji: '🧺',
    category: 'cat-leafy',
  },
];

export const VEG_CATEGORIES = [
  {
    id: 'cat-leafy',
    name: 'Leafy Vegetables',
    shortName: 'Leafy',
    icon: '🥬',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    itemCount: 5,
    description: 'Fresh Spinach, Coriander, Mint, Fenugreek & Lettuce',
  },
  {
    id: 'cat-root',
    name: 'Root Vegetables',
    shortName: 'Roots',
    icon: '🥕',
    color: '#E65100',
    bgColor: '#FFF3E0',
    itemCount: 6,
    description: 'Farm Carrots, Potatoes, Radish, Beetroot & Sweet Potato',
  },
  {
    id: 'cat-seasonal',
    name: 'Seasonal Vegetables',
    shortName: 'Seasonal',
    icon: '🌽',
    color: '#F57F17',
    bgColor: '#FFFDE7',
    itemCount: 5,
    description: 'Green Peas, Cauliflower, Cabbage, Capsicum & Bottle Gourd',
  },
  {
    id: 'cat-fruits',
    name: 'Fresh Fruits',
    shortName: 'Fruits',
    icon: '🍎',
    color: '#C2185B',
    bgColor: '#FCE4EC',
    itemCount: 5,
    description: 'Crisp Apples, Bananas, Sweet Oranges, Papaya & Pomegranate',
  },
];

export const ALL_PRODUCTS = [
  // --- 1. LEAFY VEGETABLES ---
  {
    id: 'prod-leafy-1',
    categoryId: 'cat-leafy',
    category: 'Leafy Vegetables',
    name: 'Hydroponic Spinach',
    price: 30,
    originalPrice: 40,
    discountBadge: '25% OFF',
    unit: '250 g bunch',
    rating: 4.9,
    reviews: 380,
    tag: 'Organic',
    emoji: '🥬',
    accentColor: '#E8F5E9',
    inStock: true,
    stockStatus: 'in_stock',
    availableStock: 25,
    origin: 'Ooty Organic Valley, Tamil Nadu',
    shelfLife: '3–4 days in refrigerator',
    storageTip: 'Wrap in paper towel and store in crisper drawer.',
    nutrition: {
      calories: '23 kcal',
      carbs: '3.6g',
      protein: '2.9g',
      vitamin: 'Vitamin A, C & Iron',
    },
    description: 'Tender palak leaves, pesticide-free, hydroponically grown and cleaned.',
  },
  {
    id: 'prod-leafy-2',
    categoryId: 'cat-leafy',
    category: 'Leafy Vegetables',
    name: 'Fresh Coriander',
    price: 15,
    originalPrice: 20,
    discountBadge: '25% OFF',
    unit: '100 g bunch',
    rating: 4.8,
    reviews: 290,
    tag: 'Aromatic',
    emoji: '🌿',
    accentColor: '#E8F5E9',
    inStock: true,
    description: 'Fragrant, lush green fresh dhaniya leaves harvested daily.',
  },
  {
    id: 'prod-leafy-3',
    categoryId: 'cat-leafy',
    category: 'Leafy Vegetables',
    name: 'Fresh Mint (Pudina)',
    price: 15,
    originalPrice: 18,
    discountBadge: '16% OFF',
    unit: '100 g bunch',
    rating: 4.7,
    reviews: 210,
    tag: 'Refreshing',
    emoji: '🍃',
    accentColor: '#E8F8F5',
    inStock: true,
    description: 'Zesty, highly aromatic mint leaves perfect for chutneys and tea.',
  },
  {
    id: 'prod-leafy-4',
    categoryId: 'cat-leafy',
    category: 'Leafy Vegetables',
    name: 'Green Fenugreek (Methi)',
    price: 25,
    originalPrice: 32,
    discountBadge: '21% OFF',
    unit: '250 g bunch',
    rating: 4.8,
    reviews: 195,
    tag: 'Nutritious',
    emoji: '☘️',
    accentColor: '#E8F5E9',
    inStock: true,
    description: 'Fresh bitter-sweet methi greens packed with iron and minerals.',
  },
  {
    id: 'prod-leafy-5',
    categoryId: 'cat-leafy',
    category: 'Leafy Vegetables',
    name: 'Crisp Iceberg Lettuce',
    price: 45,
    originalPrice: 60,
    discountBadge: '25% OFF',
    unit: '1 pc (300g)',
    rating: 4.6,
    reviews: 140,
    tag: 'Salad Special',
    emoji: '🥗',
    accentColor: '#E8F5E9',
    inStock: false,
    stockStatus: 'out_of_stock',
    availableStock: 0,
    origin: 'Himachal Hydroponic Farm',
    shelfLife: '4–5 days',
    storageTip: 'Keep chilled in crisper drawer.',
    nutrition: {
      calories: '14 kcal',
      carbs: '3.0g',
      protein: '0.9g',
      vitamin: 'Folate & Vitamin K',
    },
    description: 'Crisp, watery and sweet lettuce head, perfect for salads and burgers.',
  },

  // --- 2. ROOT VEGETABLES ---
  {
    id: 'prod-root-1',
    categoryId: 'cat-root',
    category: 'Root Vegetables',
    name: 'Organic Potatoes',
    price: 28,
    originalPrice: 35,
    discountBadge: '20% OFF',
    unit: '1 kg',
    rating: 4.7,
    reviews: 410,
    tag: 'Daily Essential',
    emoji: '🥔',
    accentColor: '#EFEBE9',
    inStock: true,
    description: 'Cleaned, nutrient-dense fresh hill potatoes with thin skin.',
  },
  {
    id: 'prod-root-2',
    categoryId: 'cat-root',
    category: 'Root Vegetables',
    name: 'Sweet Orange Carrots',
    price: 48,
    originalPrice: 60,
    discountBadge: '20% OFF',
    unit: '500 g',
    rating: 4.6,
    reviews: 215,
    tag: 'Crunchy',
    emoji: '🥕',
    accentColor: '#FFF3E0',
    inStock: true,
    description: 'Naturally sweet farm carrots, vibrant orange and rich in beta-carotene.',
  },
  {
    id: 'prod-root-3',
    categoryId: 'cat-root',
    category: 'Root Vegetables',
    name: 'White Farm Radish (Mooli)',
    price: 22,
    originalPrice: 30,
    discountBadge: '26% OFF',
    unit: '500 g',
    rating: 4.5,
    reviews: 160,
    tag: 'Pungent',
    emoji: '🥢',
    accentColor: '#F5F5F5',
    inStock: true,
    description: 'Crisp, peppery white radish roots with fresh edible greens.',
  },
  {
    id: 'prod-root-4',
    categoryId: 'cat-root',
    category: 'Root Vegetables',
    name: 'Organic Beetroot',
    price: 35,
    originalPrice: 45,
    discountBadge: '22% OFF',
    unit: '500 g',
    rating: 4.8,
    reviews: 230,
    tag: 'Iron Rich',
    emoji: '🟣',
    accentColor: '#FCE4EC',
    inStock: true,
    description: 'Deep ruby-red beets, sweet earthy taste and loaded with folate.',
  },
  {
    id: 'prod-root-5',
    categoryId: 'cat-root',
    category: 'Root Vegetables',
    name: 'Sweet Potato (Shakarkandi)',
    price: 38,
    originalPrice: 50,
    discountBadge: '24% OFF',
    unit: '500 g',
    rating: 4.7,
    reviews: 175,
    tag: 'Slow Carbs',
    emoji: '🍠',
    accentColor: '#FFF3E0',
    inStock: true,
    description: 'Golden sweet potatoes with smooth purple skin, ideal for roasting.',
  },
  {
    id: 'prod-root-6',
    categoryId: 'cat-root',
    category: 'Root Vegetables',
    name: 'Nashik Red Onions',
    price: 42,
    originalPrice: 55,
    discountBadge: '23% OFF',
    unit: '1 kg',
    rating: 4.9,
    reviews: 580,
    tag: 'Best Seller',
    emoji: '🧅',
    accentColor: '#F3E5F5',
    inStock: true,
    stockStatus: 'in_stock',
    availableStock: 50,
    origin: 'Nashik Valley Farms, Maharashtra',
    shelfLife: '2–3 weeks in ambient room temp',
    storageTip: 'Store in well-ventilated dry basket away from direct sunlight.',
    nutrition: {
      calories: '40 kcal',
      carbs: '9.3g',
      protein: '1.1g',
      vitamin: 'Vitamin C & Antioxidants',
    },
    description: 'Pungent, sweet, and crisp top-grade red onions with tight layers.',
  },

  // --- 3. SEASONAL VEGETABLES ---
  {
    id: 'prod-seasonal-1',
    categoryId: 'cat-seasonal',
    category: 'Seasonal Vegetables',
    name: 'Sweet Green Peas',
    price: 55,
    originalPrice: 70,
    discountBadge: '20% OFF',
    unit: '500 g',
    rating: 4.8,
    reviews: 175,
    tag: 'Seasonal',
    emoji: '🫛',
    accentColor: '#E8F5E9',
    inStock: true,
    stockStatus: 'limited_stock',
    availableStock: 4,
    origin: 'Himachal Cold Mountain Harvest',
    shelfLife: '3–5 days in refrigerator',
    storageTip: 'Keep in pods until ready to cook.',
    nutrition: {
      calories: '81 kcal',
      carbs: '14.5g',
      protein: '5.4g',
      vitamin: 'High Plant Protein & Zinc',
    },
    description: 'Sweet, tender green peas freshly picked in tender green pods.',
  },
  {
    id: 'prod-seasonal-2',
    categoryId: 'cat-seasonal',
    category: 'Seasonal Vegetables',
    name: 'Fresh Cauliflower',
    price: 40,
    originalPrice: 55,
    discountBadge: '27% OFF',
    unit: '1 pc (500g)',
    rating: 4.7,
    reviews: 190,
    tag: 'Farm Crisp',
    emoji: '🥦',
    accentColor: '#F1F8E9',
    inStock: true,
    description: 'Snowy white tight curds surrounded by fresh protective green leaves.',
  },
  {
    id: 'prod-seasonal-3',
    categoryId: 'cat-seasonal',
    category: 'Seasonal Vegetables',
    name: 'Crunchy Green Cabbage',
    price: 30,
    originalPrice: 38,
    discountBadge: '21% OFF',
    unit: '1 pc (500g)',
    rating: 4.6,
    reviews: 165,
    tag: 'Crunchy',
    emoji: '🥬',
    accentColor: '#E8F5E9',
    inStock: true,
    description: 'Firm, heavy green cabbage with tightly packed crisp leaves.',
  },
  {
    id: 'prod-seasonal-4',
    categoryId: 'cat-seasonal',
    category: 'Seasonal Vegetables',
    name: 'Green Capsicum',
    price: 45,
    originalPrice: 60,
    discountBadge: '25% OFF',
    unit: '500 g',
    rating: 4.8,
    reviews: 310,
    tag: 'Farm Direct',
    emoji: '🫑',
    accentColor: '#E8F5E9',
    inStock: true,
    description: 'Glossy green bell peppers with thick walls and sweet crisp flavor.',
  },
  {
    id: 'prod-seasonal-5',
    categoryId: 'cat-seasonal',
    category: 'Seasonal Vegetables',
    name: 'Tender Bottle Gourd (Lauki)',
    price: 25,
    originalPrice: 35,
    discountBadge: '28% OFF',
    unit: '1 pc (600g)',
    rating: 4.7,
    reviews: 180,
    tag: 'Low Calorie',
    emoji: '🥒',
    accentColor: '#E8F5E9',
    inStock: true,
    description: 'Soft-skinned, light green long gourd, excellent for digestion.',
  },

  // --- 4. FRESH FRUITS ---
  {
    id: 'prod-fruits-1',
    categoryId: 'cat-fruits',
    category: 'Fresh Fruits',
    name: 'Shimla Red Apples',
    price: 140,
    originalPrice: 180,
    discountBadge: '22% OFF',
    unit: '1 kg (4 pcs)',
    rating: 4.9,
    reviews: 320,
    tag: 'Crisp & Sweet',
    emoji: '🍎',
    accentColor: '#FFEBEE',
    inStock: true,
    description: 'Crisp, juicy mountain apples with a sweet, aromatic honey crunch.',
  },
  {
    id: 'prod-fruits-2',
    categoryId: 'cat-fruits',
    category: 'Fresh Fruits',
    name: 'Robusta Bananas',
    price: 45,
    originalPrice: 55,
    discountBadge: '18% OFF',
    unit: '1 kg (6 pcs)',
    rating: 4.8,
    reviews: 440,
    tag: 'Energy Booster',
    emoji: '🍌',
    accentColor: '#FFFDE7',
    inStock: true,
    description: 'Naturally ripened, creamy golden yellow bananas.',
  },
  {
    id: 'prod-fruits-3',
    categoryId: 'cat-fruits',
    category: 'Fresh Fruits',
    name: 'Nagpur Sweet Oranges',
    price: 80,
    originalPrice: 100,
    discountBadge: '20% OFF',
    unit: '1 kg (5 pcs)',
    rating: 4.7,
    reviews: 260,
    tag: 'Citrus Fresh',
    emoji: '🍊',
    accentColor: '#FFF3E0',
    inStock: true,
    description: 'Juicy, seedless loose-jacket mandarins bursting with Vitamin C.',
  },
  {
    id: 'prod-fruits-4',
    categoryId: 'cat-fruits',
    category: 'Fresh Fruits',
    name: 'Sweet Ripe Papaya',
    price: 50,
    originalPrice: 65,
    discountBadge: '23% OFF',
    unit: '1 pc (1 kg)',
    rating: 4.6,
    reviews: 185,
    tag: 'Immunity',
    emoji: '🍈',
    accentColor: '#FFF3E0',
    inStock: true,
    description: 'Red-fleshed semi-sweet papaya, perfect for healthy breakfast bowls.',
  },
  {
    id: 'prod-fruits-5',
    categoryId: 'cat-fruits',
    category: 'Fresh Fruits',
    name: 'Premium Pomegranate',
    price: 130,
    originalPrice: 160,
    discountBadge: '18% OFF',
    unit: '500 g (2 pcs)',
    rating: 4.9,
    reviews: 295,
    tag: 'Super Antioxidant',
    emoji: '🫐',
    accentColor: '#FCE4EC',
    inStock: true,
    description: 'Ruby red arils, rich, sweet, and bursting with fresh juice.',
  },
];

// Helper maps for Home Screen backwards compatibility
export const POPULAR_VEGETABLES = [
  {
    id: 'pop-1',
    name: 'Vine Tomatoes',
    categoryId: 'cat-seasonal',
    category: 'Seasonal Vegetables',
    price: 35,
    unit: '1 kg',
    rating: 4.8,
    reviews: 320,
    tag: 'Fresh Harvest',
    emoji: '🍅',
    accentColor: '#FFEBEE',
    inStock: true,
    description: 'Plump, firm, and juicy red vine-ripened farm tomatoes.',
  },
  ALL_PRODUCTS[5], // Organic Potatoes
  ALL_PRODUCTS[10], // Nashik Red Onions
  ALL_PRODUCTS[6], // Sweet Orange Carrots
  ALL_PRODUCTS[0], // Hydroponic Spinach
];

export const BEST_SELLING_PRODUCTS = [
  ALL_PRODUCTS[14], // Green Capsicum
  ALL_PRODUCTS[12], // Fresh Cauliflower
  ALL_PRODUCTS[16], // Shimla Red Apples
  ALL_PRODUCTS[10], // Nashik Red Onions
];

export const RECOMMENDED_PRODUCTS = [
  ALL_PRODUCTS[11], // Sweet Green Peas
  ALL_PRODUCTS[1], // Fresh Coriander
  ALL_PRODUCTS[15], // Tender Bottle Gourd
  ALL_PRODUCTS[17], // Robusta Bananas
  ALL_PRODUCTS[4], // Crisp Iceberg Lettuce
  ALL_PRODUCTS[8], // Organic Beetroot
];

export const SAVED_ADDRESSES = [
  {
    id: 'addr-1',
    label: 'Home',
    tag: 'DEFAULT',
    icon: '🏠',
    fullAddress: 'Flat 402, Green Valley Apts, Sector 4, Bangalore',
    shortAddress: 'Green Valley, Sector 4',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Office',
    tag: 'WORK',
    icon: '🏢',
    fullAddress: 'Tower B, Silicon Tech Park, 4th Floor, Whitefield',
    shortAddress: 'Silicon Tech Park, Whitefield',
    isDefault: false,
  },
  {
    id: 'addr-3',
    label: 'Parents',
    tag: 'OTHER',
    icon: '📍',
    fullAddress: 'House 12, Rose Garden Layout, Indiranagar',
    shortAddress: 'Rose Garden, Indiranagar',
    isDefault: false,
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Order Dispatched 🚚',
    message: 'Your fresh vegetable basket is on the way! Arriving in ~20 mins.',
    time: '10 mins ago',
    unread: true,
    icon: '🛵',
  },
  {
    id: 'notif-2',
    title: 'Harvest Flash Sale 🏷️',
    message: 'Enjoy 20% OFF on all organic root vegetables today only with code FRESH20.',
    time: '1 hour ago',
    unread: true,
    icon: '🎉',
  },
  {
    id: 'notif-3',
    title: 'Welcome to FreshVeg 🌱',
    message: 'Thanks for choosing farm-fresh vegetables directly from trusted farmers!',
    time: 'Yesterday',
    unread: false,
    icon: '💚',
  },
];

export const getProductUnitOptions = product => {
  if (!product) return [];
  if (product.units && product.units.length > 0) {
    return product.units;
  }
  const basePrice = product.price || 30;
  const unitStr = (product.unit || '').toLowerCase();

  if (unitStr.includes('pc')) {
    return [
      { id: 'u1', label: '1 pc', value: '1pc', price: basePrice, multiplier: 1 },
      { id: 'u2', label: '2 pcs', value: '2pcs', price: Math.round(basePrice * 1.9), multiplier: 1.9 },
      { id: 'u3', label: '3 pcs', value: '3pcs', price: Math.round(basePrice * 2.8), multiplier: 2.8 },
    ];
  } else if (unitStr.includes('100 g')) {
    return [
      { id: 'u1', label: '100 g', value: '100g', price: basePrice, multiplier: 1 },
      { id: 'u2', label: '250 g', value: '250g', price: Math.round(basePrice * 2.3), multiplier: 2.3 },
      { id: 'u3', label: '500 g', value: '500g', price: Math.round(basePrice * 4.4), multiplier: 4.4 },
    ];
  } else if (unitStr.includes('250 g')) {
    return [
      { id: 'u1', label: '250 g', value: '250g', price: basePrice, multiplier: 1 },
      { id: 'u2', label: '500 g', value: '500g', price: Math.round(basePrice * 1.9), multiplier: 1.9 },
      { id: 'u3', label: '1 kg', value: '1kg', price: Math.round(basePrice * 3.6), multiplier: 3.6 },
    ];
  } else {
    // Default 500g / 1kg / 2kg / 5kg
    return [
      { id: 'u1', label: '500 g', value: '500g', price: Math.round(basePrice * 0.55), multiplier: 0.55 },
      { id: 'u2', label: '1 kg', value: '1kg', price: basePrice, multiplier: 1 },
      { id: 'u3', label: '2 kg', value: '2kg', price: Math.round(basePrice * 1.9), multiplier: 1.9 },
      { id: 'u4', label: '5 kg', value: '5kg', price: Math.round(basePrice * 4.5), multiplier: 4.5 },
    ];
  }
};

export const getProductStockInfo = product => {
  if (!product) {
    return {
      status: 'out_of_stock',
      label: 'Out of Stock',
      badgeColor: '#D32F2F',
      bgColor: '#FFEBEE',
      isAvailable: false,
      availableStock: 0,
      description: 'Currently unavailable from farm sources',
    };
  }

  const stock =
    product.availableStock !== undefined
      ? product.availableStock
      : product.inStock === false
      ? 0
      : 30;

  if (stock <= 0 || product.inStock === false) {
    return {
      status: 'out_of_stock',
      label: 'Out of Stock',
      badgeColor: '#D32F2F',
      bgColor: '#FFEBEE',
      isAvailable: false,
      availableStock: 0,
      description: 'Currently unavailable from farm sources',
    };
  }

  if (stock <= 5 || product.stockStatus === 'limited_stock') {
    return {
      status: 'limited_stock',
      label: `Limited Stock (Only ${stock} left!)`,
      badgeColor: '#E65100',
      bgColor: '#FFF3E0',
      isAvailable: true,
      availableStock: stock,
      description: 'Hurry! High demand item with low inventory',
    };
  }

  return {
    status: 'in_stock',
    label: 'In Stock (Fresh Daily)',
    badgeColor: '#2E7D32',
    bgColor: '#E8F5E9',
    isAvailable: true,
    availableStock: stock,
    description: 'Guaranteed farm-fresh harvest ready to deliver',
  };
};
