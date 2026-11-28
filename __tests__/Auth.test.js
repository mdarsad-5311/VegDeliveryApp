/**
 * Auth.test.js
 * Comprehensive unit test suite for Phase 1 Authentication & Session Management:
 * - API Client & interceptor token attachment
 * - authAPI endpoints (register, login, logout, profile)
 * - AppContext session management (loginUser, logoutUser, verifySession)
 * - AsyncStorage session token persistence and purge
 * - 401 Unauthorized token cleanup
 * - Error formatting
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppProvider,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_USER_PROFILE,
  DEFAULT_USER_PROFILE,
} from '../src/context/AppContext';
import useAppContext from '../src/hooks/useAppContext';
import apiClient, {
  authAPI,
  formatApiError,
  getBaseURL,
} from '../src/services/api';

// Consumer component to capture context values
let contextRef = {};
const TestConsumer = () => {
  const context = useAppContext();
  contextRef = context;
  return null;
};

const renderWithContext = async () => {
  let renderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppProvider>
        <TestConsumer />
      </AppProvider>,
    );
  });
  return renderer;
};

describe('Phase 1 Authentication & Session Unit Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    await renderWithContext();
  });

  // 1. API Client Base URL & Config
  test('1. getBaseURL returns expected platform or custom URL', () => {
    const defaultUrl = getBaseURL();
    expect(defaultUrl).toContain('8000/api');

    // Custom override support for physical device
    global.__API_BASE_URL__ = 'http://192.168.1.50:8000/api';
    expect(getBaseURL()).toBe('http://192.168.1.50:8000/api');
    delete global.__API_BASE_URL__;
  });

  // 2. Request Interceptor attaches Token
  test('2. Request interceptor attaches Token from AsyncStorage', async () => {
    await AsyncStorage.setItem(STORAGE_KEY_AUTH_TOKEN, 'test_mock_token_12345');

    const config = { headers: {} };
    // Get the request interceptor handler
    const requestHandler = apiClient.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = await requestHandler(config);

    expect(modifiedConfig.headers.Authorization).toBe('Token test_mock_token_12345');
  });

  test('3. Request interceptor leaves Authorization header empty if no token stored', async () => {
    await AsyncStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);

    const config = { headers: {} };
    const requestHandler = apiClient.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = await requestHandler(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  // 4. Response Interceptor 401 handling
  test('4. Response interceptor clears token on 401 Unauthorized', async () => {
    await AsyncStorage.setItem(STORAGE_KEY_AUTH_TOKEN, 'expired_token_999');

    const errorHandler = apiClient.interceptors.response.handlers[0].rejected;
    const error401 = { response: { status: 401, data: { detail: 'Invalid token.' } } };

    await ReactTestRenderer.act(async () => {
      try {
        await errorHandler(error401);
      } catch (_) {}
    });

    const storedToken = await AsyncStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
    expect(storedToken).toBeNull();
  });

  // 5. Error formatting
  test('5. formatApiError correctly parses diverse DRF error formats', () => {
    // Network / timeout
    expect(formatApiError({ code: 'ECONNABORTED' })).toContain('timed out');
    expect(formatApiError({})).toContain('Unable to connect');

    // Detail string
    expect(formatApiError({ response: { data: { detail: 'Invalid credentials.' } } })).toBe('Invalid credentials.');

    // Message string
    expect(formatApiError({ response: { data: { message: 'Account deactivated.' } } })).toBe('Account deactivated.');

    // non_field_errors array
    expect(
      formatApiError({ response: { data: { non_field_errors: ['Incorrect username or password.'] } } })
    ).toBe('Incorrect username or password.');
  });

  // 6. loginUser Context Action
  test('6. loginUser stores token and updates user state in AppContext', async () => {
    const mockUserData = {
      id: 101,
      username: 'priya_sharma',
      full_name: 'Priya Sharma',
      email: 'priya@freshveg.in',
      phone_number: '9876543210',
      role: 'customer',
      created_at: '2026-01-15T10:00:00Z',
    };
    const mockToken = 'auth_token_sample_abc';

    await ReactTestRenderer.act(async () => {
      await contextRef.loginUser(mockUserData, mockToken);
    });

    expect(contextRef.isAuthenticated).toBe(true);
    expect(contextRef.authToken).toBe(mockToken);
    expect(contextRef.user.name).toBe('Priya Sharma');
    expect(contextRef.user.email).toBe('priya@freshveg.in');
    expect(contextRef.user.phone).toBe('9876543210');

    // Verify AsyncStorage persistence
    const savedToken = await AsyncStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
    expect(savedToken).toBe(mockToken);

    const savedProfileJson = await AsyncStorage.getItem(STORAGE_KEY_USER_PROFILE);
    expect(savedProfileJson).toBeDefined();
    const savedProfile = JSON.parse(savedProfileJson);
    expect(savedProfile.name).toBe('Priya Sharma');
  });

  // 7. logoutUser Context Action
  test('7. logoutUser purges token, clears user state, and resets auth status', async () => {
    // First login
    await ReactTestRenderer.act(async () => {
      await contextRef.loginUser(
        { id: 1, full_name: 'Rahul', phone_number: '9999999999', email: 'rahul@test.com' },
        'token_to_purge',
      );
    });
    expect(contextRef.isAuthenticated).toBe(true);

    // Mock authAPI.logout to resolve
    jest.spyOn(authAPI, 'logout').mockResolvedValueOnce({ data: { message: 'Logged out' } });

    // Execute logout
    await ReactTestRenderer.act(async () => {
      await contextRef.logoutUser();
    });

    expect(contextRef.isAuthenticated).toBe(false);
    expect(contextRef.authToken).toBeNull();
    expect(contextRef.user.name).toBe(DEFAULT_USER_PROFILE.name);

    // Verify storage cleanup
    const storedToken = await AsyncStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
    expect(storedToken).toBeNull();
  });

  // 8. verifySession with valid token
  test('8. verifySession restores authenticated profile when valid token exists', async () => {
    const mockBackendProfile = {
      id: 55,
      username: 'anita_v',
      full_name: 'Anita Verma',
      email: 'anita@freshveg.in',
      phone_number: '9811122233',
      role: 'customer',
      created_at: '2026-03-01T08:00:00Z',
    };

    await AsyncStorage.setItem(STORAGE_KEY_AUTH_TOKEN, 'valid_existing_token_xyz');

    jest.spyOn(authAPI, 'getProfile').mockResolvedValueOnce({
      status: 200,
      data: mockBackendProfile,
    });

    let result;
    await ReactTestRenderer.act(async () => {
      result = await contextRef.verifySession();
    });

    expect(result.authenticated).toBe(true);
    expect(contextRef.isAuthenticated).toBe(true);
    expect(contextRef.authToken).toBe('valid_existing_token_xyz');
    expect(contextRef.user.name).toBe('Anita Verma');
    expect(contextRef.user.phone).toBe('9811122233');
  });

  // 9. verifySession with expired / 401 token
  test('9. verifySession removes token and marks unauthenticated on 401 response', async () => {
    await AsyncStorage.setItem(STORAGE_KEY_AUTH_TOKEN, 'expired_token_123');

    jest.spyOn(authAPI, 'getProfile').mockRejectedValueOnce({
      response: { status: 401, data: { detail: 'Token expired.' } },
    });

    let result;
    await ReactTestRenderer.act(async () => {
      result = await contextRef.verifySession();
    });

    expect(result.authenticated).toBe(false);
    expect(contextRef.isAuthenticated).toBe(false);
    expect(contextRef.authToken).toBeNull();

    const storedToken = await AsyncStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
    expect(storedToken).toBeNull();
  });

  // 10. verifySession when no token exists
  test('10. verifySession returns unauthenticated when no token is in storage', async () => {
    await AsyncStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);

    let result;
    await ReactTestRenderer.act(async () => {
      result = await contextRef.verifySession();
    });

    expect(result.authenticated).toBe(false);
    expect(contextRef.isAuthenticated).toBe(false);
    expect(contextRef.authToken).toBeNull();
  });

  // 11. Authenticated profile update calls authAPI.updateProfile with correctly mapped payload
  test('11. Authenticated updateUserProfile calls authAPI.updateProfile with mapped fields', async () => {
    await ReactTestRenderer.act(async () => {
      await contextRef.loginUser(
        {
          id: 42,
          username: 'rohit_kumar',
          full_name: 'Rohit Kumar',
          email: 'rohit@freshveg.in',
          phone_number: '9876500001',
          role: 'customer',
        },
        'token_user_42',
      );
    });

    const updateSpy = jest.spyOn(authAPI, 'updateProfile').mockResolvedValueOnce({
      status: 200,
      data: {
        message: 'Profile updated successfully.',
        profile: {
          id: 42,
          username: 'rohit_kumar',
          full_name: 'Rohit K. Sharma',
          email: 'rohit.sharma@freshveg.in',
          phone_number: '9876599999',
          role: 'customer',
          is_verified: true,
          created_at: '2026-02-10T00:00:00Z',
        },
      },
    });

    let res;
    await ReactTestRenderer.act(async () => {
      res = await contextRef.updateUserProfile({
        name: '  Rohit K. Sharma  ',
        email: '  Rohit.Sharma@FreshVeg.in  ',
        phone: '(987) 659-9999',
        avatar: '🥕',
        bio: 'Carrot lover',
      });
    });

    // 1. Verify API was called
    expect(updateSpy).toHaveBeenCalledTimes(1);

    // 2. Verify payload correctly maps name -> full_name, email -> email, phone -> phone_number
    // and that avatar & bio are NOT sent to Django
    expect(updateSpy).toHaveBeenCalledWith({
      full_name: 'Rohit K. Sharma',
      email: 'rohit.sharma@freshveg.in',
      phone_number: '9876599999',
    });

    // 3. Successful server response updates context state and AsyncStorage
    expect(res.success).toBe(true);
    expect(contextRef.user.name).toBe('Rohit K. Sharma');
    expect(contextRef.user.email).toBe('rohit.sharma@freshveg.in');
    expect(contextRef.user.phone).toBe('9876599999');

    // 4. Avatar and bio are preserved in context and storage
    expect(contextRef.user.avatar).toBe('🥕');
    expect(contextRef.user.bio).toBe('Carrot lover');

    const storedProfile = JSON.parse(
      await AsyncStorage.getItem(STORAGE_KEY_USER_PROFILE),
    );
    expect(storedProfile.name).toBe('Rohit K. Sharma');
    expect(storedProfile.email).toBe('rohit.sharma@freshveg.in');
    expect(storedProfile.phone).toBe('9876599999');
    expect(storedProfile.avatar).toBe('🥕');
    expect(storedProfile.bio).toBe('Carrot lover');
  });

  // 12. Duplicate email error returns failure and preserves old profile
  test('12. Duplicate email API error returns failure and preserves previous profile', async () => {
    await ReactTestRenderer.act(async () => {
      await contextRef.loginUser(
        {
          id: 42,
          username: 'rohit_kumar',
          full_name: 'Rohit Kumar',
          email: 'rohit@freshveg.in',
          phone_number: '9876500001',
          role: 'customer',
        },
        'token_user_42',
      );
    });

    const previousUser = { ...contextRef.user };

    jest.spyOn(authAPI, 'updateProfile').mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          email: ['An account with this email address already exists.'],
        },
      },
    });

    let res;
    await ReactTestRenderer.act(async () => {
      res = await contextRef.updateUserProfile({
        name: 'Rohit New',
        email: 'taken@freshveg.in',
        phone: '9876500001',
      });
    });

    expect(res.success).toBe(false);
    expect(res.message).toBe('An account with this email address already exists.');
    expect(contextRef.user.name).toBe(previousUser.name);
    expect(contextRef.user.email).toBe(previousUser.email);

    const storedProfile = JSON.parse(
      await AsyncStorage.getItem(STORAGE_KEY_USER_PROFILE),
    );
    expect(storedProfile.email).toBe(previousUser.email);
  });

  // 13. Duplicate phone API error returns failure and preserves old profile
  test('13. Duplicate phone API error returns failure and preserves previous profile', async () => {
    await ReactTestRenderer.act(async () => {
      await contextRef.loginUser(
        {
          id: 42,
          username: 'rohit_kumar',
          full_name: 'Rohit Kumar',
          email: 'rohit@freshveg.in',
          phone_number: '9876500001',
          role: 'customer',
        },
        'token_user_42',
      );
    });

    const previousUser = { ...contextRef.user };

    jest.spyOn(authAPI, 'updateProfile').mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          phone_number: ['An account with this phone number already exists.'],
        },
      },
    });

    let res;
    await ReactTestRenderer.act(async () => {
      res = await contextRef.updateUserProfile({
        name: 'Rohit New',
        email: 'rohit@freshveg.in',
        phone: '9800000000',
      });
    });

    expect(res.success).toBe(false);
    expect(res.message).toBe('An account with this phone number already exists.');
    expect(contextRef.user.phone).toBe(previousUser.phone);
  });

  // 14. Network failure does not produce false success
  test('14. Network failure returns failure and does not produce false local success', async () => {
    await ReactTestRenderer.act(async () => {
      await contextRef.loginUser(
        {
          id: 42,
          username: 'rohit_kumar',
          full_name: 'Rohit Kumar',
          email: 'rohit@freshveg.in',
          phone_number: '9876500001',
          role: 'customer',
        },
        'token_user_42',
      );
    });

    const previousUser = { ...contextRef.user };

    jest.spyOn(authAPI, 'updateProfile').mockRejectedValueOnce({
      code: 'ECONNABORTED',
      message: 'timeout of 10000ms exceeded',
    });

    let res;
    await ReactTestRenderer.act(async () => {
      res = await contextRef.updateUserProfile({
        name: 'Rohit Disconnected',
        email: 'rohit.offline@freshveg.in',
        phone: '9876500001',
      });
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('timed out');
    expect(contextRef.user.name).toBe(previousUser.name);
    expect(contextRef.user.email).toBe(previousUser.email);
  });

  // 15. Guest profile update retains existing local-only behavior
  test('15. Guest profile update retains existing local-only behavior', async () => {
    await AsyncStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    await ReactTestRenderer.act(async () => {
      await contextRef.logoutUser();
    });

    const updateSpy = jest.spyOn(authAPI, 'updateProfile');

    let res;
    await ReactTestRenderer.act(async () => {
      res = await contextRef.updateUserProfile({
        name: 'Guest Shopper',
        email: 'guest@local.device',
        phone: '9123456789',
        avatar: '🍅',
        bio: 'Just browsing local vegetables',
      });
    });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(res.success).toBe(true);
    expect(contextRef.user.name).toBe('Guest Shopper');
    expect(contextRef.user.email).toBe('guest@local.device');
    expect(contextRef.user.avatar).toBe('🍅');

    const storedProfile = JSON.parse(
      await AsyncStorage.getItem(STORAGE_KEY_USER_PROFILE),
    );
    expect(storedProfile.name).toBe('Guest Shopper');
  });
});
