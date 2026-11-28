/* eslint-env jest */

jest.useFakeTimers();

// In-Memory AsyncStorage Mock (prefixed with 'mock' for Jest scope rule)
const mockStore = new Map();
const mockAsyncStorage = {
  getItem: jest.fn(async key => mockStore.get(key) ?? null),
  setItem: jest.fn(async (key, value) => {
    mockStore.set(key, String(value));
  }),
  removeItem: jest.fn(async key => {
    mockStore.delete(key);
  }),
  clear: jest.fn(async () => {
    mockStore.clear();
  }),
  getAllKeys: jest.fn(async () => Array.from(mockStore.keys())),
  getMany: jest.fn(async keys =>
    keys.reduce((res, k) => ({ ...res, [k]: mockStore.get(k) ?? null }), {})
  ),
  setMany: jest.fn(async entries => {
    Object.entries(entries).forEach(([k, v]) => mockStore.set(k, String(v)));
  }),
  removeMany: jest.fn(async keys => {
    keys.forEach(k => mockStore.delete(k));
  }),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
  ...mockAsyncStorage,
}));

// Mock Safe Area Context with named & default export compatibility
jest.mock('react-native-safe-area-context', () => {
  const safeAreaMock = require('react-native-safe-area-context/jest/mock').default;
  return {
    __esModule: true,
    ...safeAreaMock,
    default: safeAreaMock,
  };
});

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn().mockImplementation(c => c),
    Directions: {},
  };
});

// Mock react-native-razorpay
jest.mock('react-native-razorpay', () => {
  const mockOpen = jest.fn(async options => ({
    razorpay_payment_id: 'pay_test_mock123',
    razorpay_order_id: options?.order_id || 'order_test_mock123',
    razorpay_signature: 'sig_test_mock123',
  }));
  return {
    __esModule: true,
    default: {
      open: mockOpen,
    },
    open: mockOpen,
  };
});
