/**
 * API configuration and client
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Fetch wrapper with error handling and retries
 */
async function apiClient(endpoint, options = {}) {
  const { retries = 3, timeout = 30000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry on network errors
    if (retries > 0 && (error.name === "AbortError" || error.name === "TypeError")) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiClient(endpoint, { ...options, retries: retries - 1 });
    }
    
    throw error;
  }
}

/**
 * API methods
 */
export const api = {
  /**
   * Generate questions using LLM
   */
  async generateQuestions(payload) {
    return apiClient("/api/questions/generate", {
      method: "POST",
      body: JSON.stringify(payload),
      timeout: 60000, // 1 minute for LLM generation
    });
  },
  
  /**
   * Generate lesson content using LLM
   */
  async generateLesson(payload) {
    return apiClient("/api/lessons/generate", {
      method: "POST",
      body: JSON.stringify(payload),
      timeout: 60000, // 1 minute for LLM generation
    });
  },
  
  /**
   * Health check
   */
  async health() {
    return apiClient("/health", {
      retries: 1,
      timeout: 5000,
    });
  },
};

export default api;
