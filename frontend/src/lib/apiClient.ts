/**
 * API Utility - Centralized API calls with environment-based URL
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface FetchOptions extends RequestInit {
  skipCredentials?: boolean;
}

export async function apiCall(endpoint: string, options?: FetchOptions) {
  const { skipCredentials, ...fetchOptions } = options || {};

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    credentials: skipCredentials ? 'omit' : 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Export API_BASE for debugging
export { API_BASE };