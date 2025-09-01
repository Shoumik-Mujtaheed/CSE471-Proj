// utils/api.js

const DEV_API_URL = 'http://localhost:5000';
const PROD_API_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.vercel.app';

// Determine which URL to use based on environment
const isProd = import.meta.env.MODE === 'production';
export const API_BASE_URL = isProd ? PROD_API_URL : DEV_API_URL;

// Enhanced API call function with better error handling
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Optional: Add a helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Optional: Add a helper for authenticated API calls
export const authenticatedApiCall = async (endpoint, options = {}) => {
  const authHeaders = getAuthHeaders();
  const mergedOptions = {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders
    }
  };
  
  return apiCall(endpoint, mergedOptions);
};
