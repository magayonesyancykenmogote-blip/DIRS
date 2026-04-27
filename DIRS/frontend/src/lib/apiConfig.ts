/**
 * API Configuration
 * Determines the correct API base URL based on environment
 */

const getApiUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  // Default to relative path for local development (via Vite proxy)
  return '';
};

export const API_BASE_URL = getApiUrl();

/**
 * Constructs a full API endpoint URL
 * @param endpoint - The API endpoint (e.g., '/api/users')
 * @returns Full URL or relative path
 */
export const getApiEndpoint = (endpoint: string): string => {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return endpoint;
};

export default API_BASE_URL;
