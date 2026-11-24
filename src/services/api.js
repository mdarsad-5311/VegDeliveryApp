import axios from 'axios';

/**
 * Base Axios Client configured for future Backend Integration
 */
const apiClient = axios.create({
  baseURL: 'http://10.0.2.2:8000/api', // Default Android emulator host loopback to Django
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor placeholder
apiClient.interceptors.request.use(
  config => {
    // Add auth token when authentication is implemented
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor placeholder
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Global error handling placeholder
    return Promise.reject(error);
  },
);

export default apiClient;
