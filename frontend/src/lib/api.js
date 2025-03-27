const API_URL = import.meta.env.VITE_API_URL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function for API calls
async function apiCall(endpoint, options = {}, retries = 0) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Add this for cookies
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') && retries < MAX_RETRIES) {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return apiCall(endpoint, options, retries + 1);
    }
    throw error;
  }
}

// Repository related API calls
export const repositoryApi = {
  add: (data) => apiCall('/repositories/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  list: () => apiCall('/repositories'),

  delete: (id) => apiCall(`/repositories/${id}`, {
    method: 'DELETE',
  }),

  process: (id) => apiCall(`/repositories/${id}/process`, {
    method: 'POST',
  }),

  status: (id) => apiCall(`/repositories/${id}/status`),
};

// Chat related API calls
export const chatApi = {
  sendMessage: (data) => apiCall('/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
