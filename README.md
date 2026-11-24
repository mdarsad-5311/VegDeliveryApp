# FreshVeg 🌱 - Farm Fresh Vegetable Delivery App

[![React Native](https://img.shields.io/badge/React%20Native-0.88.1-61DAFB.svg?style=flat-square&logo=react)](https://reactnative.dev/)
[![Android](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-3DDC84.svg?style=flat-square&logo=android)](https://developer.android.com/)
[![Android 15 Ready](https://img.shields.io/badge/Android%2015-Ready%20(API%2036)-brightgreen.svg?style=flat-square)](https://developer.android.com/about/versions/15)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**FreshVeg** is a production-ready, feature-complete mobile e-commerce application built with **React Native CLI**. Designed for farm-to-table vegetable and grocery delivery, FreshVeg delivers an intuitive, fast, and visually appealing green organic shopping experience with full offline persistence, real-time cart calculations, order tracking, and edge-to-edge Android system navigation support.

---

## ✨ Features at a Glance

### 🥬 Farm-to-Table Product Catalog
- **Category Browsing**: Explore Leafy Greens, Organic Roots, Seasonal Harvests, Exotic Veggies, and Fresh Fruits.
- **Rich Product Cards**: High-resolution imagery, organic badges, discount tags, price per unit (`/kg`, `/bunch`), and one-tap "+ Add" action.
- **Product Details Screen**: Nutrition facts, farm-origin info, harvest dates, customer reviews, and dynamic quantity steppers.

### 🔍 Real-Time Search & Discovery
- Instant multi-field search across vegetable names, categories, and tags.
- Trending organic search suggestion pills (Spinach, Tomatoes, Broccoli, Organic Potatoes).
- Empty state with instant browse recommendations.

### 🛒 Smart Cart & Price Breakdown
- Interactive quantity steppers (`+` / `-`) with automatic badge counters.
- Automatic free-delivery progress bar (Free delivery on orders over ₹299).
- Itemized pricing: Item total, delivery charges, packaging fees, and grand total.

### 📍 Saved Addresses Management
- Complete address book supporting **Home**, **Work**, and **Other** labels.
- Add, edit, and delete addresses with validation.
- Selectable default address seamlessly integrated into the Checkout screen.

### 💳 Seamless Multi-Method Checkout
- Payment options: **Cash on Delivery (COD)**, **UPI (GPay / PhonePe / Paytm)**, and **Credit/Debit Cards**.
- Delivery slot selector (Morning, Afternoon, Express 30-min).
- Promo code application with instant discount deductions.

### 🚚 Live Order Tracking & History
- Real-time order timeline: **Order Placed → Packed at Fulfillment Hub → Out for Delivery → Delivered**.
- Comprehensive order history tabs: Active, Completed, and Cancelled orders.
- Order Details view with full item breakdown, delivery address, and invoice summary.

### 🔔 Full-Page Notification Center
- Dedicated full-screen notifications screen with edge-to-edge safe area coverage.
- Filter notifications by **All** and **Unread** updates.
- One-tap **"Mark all read"** action and real-time badge updates.

### 👤 Customer Profile & Account Management
- Profile overview with avatar, customer name, email, and verified mobile number.
- Edit profile form with local AsyncStorage persistence.
- Interactive Help & Support center with categorized FAQs and customer contact options.

### 📱 Modern Android Edge-to-Edge Design
- Fully compatible with Android's modern edge-to-edge navigation (`edgeToEdgeEnabled=true`).
- Dynamic bottom navigation safe-area handling: Tab bar labels and icons sit comfortably above both **3-Button Navigation** (`< O |||`) and **Gesture Navigation bars**.

---

## 📁 Project Architecture

```text
VegDeliveryApp/
│
├── android/                   # Native Android project configuration & Gradle scripts
├── ios/                       # Native iOS CocoaPods & Xcode project configuration
├── scripts/
│   └── testing/               # Automated regression & release verification test suites
│
├── src/
│   ├── assets/                # App illustrations, vector icons, and static assets
│   ├── components/            # Reusable modular UI components
│   │   ├── common/            # Shared primitives (Header, CustomButton, InputField)
│   │   ├── home/              # BannerSlider, CategoryGrid, NotificationsModal
│   │   ├── cart/              # CartItemCard, BillSummaryCard, DeliveryProgressBar
│   │   ├── orders/            # OrderCard, OrderTimeline, TrackingMap
│   │   └── address/           # AddressCard, AddressTypeSelector
│   │
│   ├── constants/             # Design tokens & static data
│   │   ├── colors.js          # Organic green palette, surfaces, accents, semantic colors
│   │   ├── typography.js      # Font scales, line heights, font weights
│   │   ├── theme.js           # Spacing scales, border radiuses, shadows
│   │   └── mockData.js        # Vegetable catalog, promotional banners, notifications
│   │
│   ├── context/               # Global state management (React Context API)
│   │   └── AppContext.js      # Cart, Favorites, Addresses, User, and Orders state
│   │
│   ├── hooks/                 # Custom reusable React hooks
│   │   └── useAppContext.js   # Fast access hook to AppContext state & dispatchers
│   │
│   ├── navigation/            # Navigation structure (React Navigation 7)
│   │   ├── AppNavigator.js    # Root Native Stack Navigator (21 application routes)
│   │   └── TabNavigator.js    # Bottom Tab Navigator with dynamic safe-area insets
│   │
│   ├── screens/               # Feature-complete application screens
│   │   ├── Splash/            # Animated splash screen
│   │   ├── Welcome/           # Brand onboarding welcome screen
│   │   ├── Onboarding/        # 3-step carousel feature guide
│   │   ├── Auth/              # Login, Register, ForgotPassword, OTP, ResetPassword
│   │   ├── Home/              # Feed, promos, categories, featured vegetables
│   │   ├── Categories/        # Category filter grid & category product listing
│   │   ├── Products/          # Product listing with sorting & filter sheets
│   │   ├── ProductDetails/    # Full product details, units, steppers, reviews
│   │   ├── Cart/              # Cart screen, checkout trigger, coupon input
│   │   ├── Favorites/         # Wishlist & saved items
│   │   ├── Checkout/          # Address selector, delivery slots, payment options
│   │   ├── Address/           # Address list, Add address, Edit address
│   │   ├── Orders/            # Orders list, Order Confirmation, Order Tracking, Details
│   │   └── Profile/           # Customer profile, Edit Profile, Help & Support
│   │
│   ├── services/              # API networking layer (Axios client setup for future REST APIs)
│   ├── styles/                # Global layout utilities and shared flexbox styles
│   └── utils/                 # Currency formatters, date formatters, validators
│
├── App.js                     # Root component wrapped in SafeAreaProvider & AppProvider
├── index.js                   # Application entry point registered with AppRegistry
├── package.json               # NPM scripts and project dependencies
└── README.md
```

---

## 🛠 Tech Stack & Dependencies

| Layer | Library / Tool | Purpose |
| :--- | :--- | :--- |
| **Framework** | `React Native 0.88.1` (React 19.3) | Core cross-platform mobile runtime |
| **Navigation** | `@react-navigation/native` `v7` | Declarative screen and stack management |
| **Tab Bar** | `@react-navigation/bottom-tabs` `v7` | Bottom tab navigation with dynamic insets |
| **Local Storage** | `@react-native-async-storage/async-storage` | Offline persistence for cart, orders & user data |
| **Safe Areas** | `react-native-safe-area-context` | Dynamic edge-to-edge notch & nav bar insets |
| **Gestures** | `react-native-gesture-handler` | Native touch and gesture handling |
| **Animations** | `react-native-reanimated` | Smooth 60 FPS transitions and micro-interactions |
| **Networking** | `axios` | HTTP client configured for REST API integrations |
| **Vector Icons** | `react-native-vector-icons` & `react-native-svg` | Scalable iconography and SVG graphics |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: >= 20.x or 22.x LTS
- **JDK**: OpenJDK 17 LTS (Zulu recommended)
- **Android SDK**: Android 14/15 SDK (Platform Tools, Build-Tools 35.0.0+)
- **Android Studio / Physical Android Device**

### 1. Installation

Clone the repository and install the dependencies:
```bash
git clone https://github.com/mdarsad-5311/VegDeliveryApp.git
cd VegDeliveryApp
npm install
```

### 2. Start Metro Bundler
```bash
npm start
```

### 3. Run on Android
Make sure an Android emulator is running or a physical device is connected via USB:
```bash
npm run android
```

---

## 📦 Building Production Release APK

To create a signed, optimized release APK ready for device installation:

```bash
# Bundle assets and compile release APK in one command
npm run build:release
```

The resulting signed APK will be generated at:
```text
android/app/build/outputs/apk/release/app-release.apk
```

To clean the Android build cache:
```bash
npm run clean:android
```

---

## 🧪 Testing & Quality Assurance

The codebase includes automated end-to-end regression test scripts covering all 21 screens, cart persistence across process restarts, and edge-to-edge system navigation:

```bash
# Run release smoke verification
python3 scripts/testing/test_release_smoke.py
```

---

## 👨‍💻 Author

**mdarsad-5311**  
- GitHub: [@mdarsad-5311](https://github.com/mdarsad-5311)
- Email: mdarsadkgn5311@gmail.com

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
