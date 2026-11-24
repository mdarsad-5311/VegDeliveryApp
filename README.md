# VegDeliveryApp - React Native Mobile Application

A professional, scalable React Native mobile application for vegetable and grocery delivery.

---

## 📁 Project Architecture & Folder Structure

```text
VegDeliveryApp/
│
├── android/                   # Android native platform code
├── ios/                       # iOS native platform code
├── src/
│   ├── assets/                # Static assets
│   │   ├── images/            # App illustrations and image assets
│   │   ├── icons/             # Custom iconography
│   │   └── fonts/             # Custom typography fonts
│   │
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Shared primitives (Header, Card, Button)
│   │   └── index.js
│   │
│   ├── screens/               # Application screens
│   │   ├── Home/              # Home screen (feed, search, promos, featured)
│   │   ├── Categories/        # Vegetable category listing
│   │   ├── Cart/              # Shopping basket & checkout trigger
│   │   ├── Orders/            # Active orders & order history
│   │   ├── Profile/           # User profile & account management
│   │   └── index.js
│   │
│   ├── navigation/            # Navigation setup
│   │   ├── TabNavigator.js    # Bottom Tab Navigation
│   │   ├── AppNavigator.js    # Root Stack Navigation
│   │   └── index.js
│   │
│   ├── services/              # API and network services (Axios client)
│   ├── hooks/                 # Custom React hooks (useAppContext)
│   ├── context/               # State management (AppContext)
│   ├── constants/             # Design tokens (colors, typography, theme)
│   ├── utils/                 # Utility functions and formatters
│   └── styles/                # Global styling utilities
│
├── App.js                     # Root Application Component
├── index.js                   # React Native entry point
├── package.json               # Dependencies and scripts
└── README.md
```

---

## 🛠 Prerequisites & Environment Setup

Ensure the following tools are installed on your workstation:

- **Node.js**: >= 22.x (Tested with Node v26.3.1 / npm 11.16.0)
- **Java JDK**: OpenJDK 17 LTS (Zulu 17.66+19-CA)
- **Android SDK**: Android API 36/37, Build Tools 37.0.0
- **Android Studio & Emulator**: AVD (e.g. `Medium_Phone` or Pixel)

### Environment Variables (.zshrc / .bashrc)

```bash
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
```

---

## 📦 Installed Dependencies

- **Navigation**:
  - `@react-navigation/native`
  - `@react-navigation/native-stack`
  - `@react-navigation/bottom-tabs`
- **Native Gesture & Screen Handlers**:
  - `react-native-screens`
  - `react-native-safe-area-context`
  - `react-native-gesture-handler`
  - `react-native-reanimated`
- **Networking & Storage**:
  - `axios`
  - `@react-native-async-storage/async-storage`
- **Graphics & Icons**:
  - `react-native-vector-icons`
  - `react-native-svg`

---

## 🚀 Running the Application

### 1. Start Metro Bundler
```bash
npm start
```

### 2. Launch Android App
Make sure an Android Emulator is running (`emulator -avd Medium_Phone &`) or an Android device is connected via USB (`adb devices`).

```bash
npm run android
```

---

## 🎯 Next Steps

1. Configure Django REST Framework backend with vegetable inventory models and endpoints.
2. Connect mobile app services to Django APIs.
3. Implement cart state management and checkout workflow.
# VegDeliveryApp
