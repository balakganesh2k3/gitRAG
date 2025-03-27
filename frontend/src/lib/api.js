import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:8000/api/v1'; // Updated to include full URL
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function for API calls
async function apiCall(endpoint, options = {}, retries = 0) {
  try {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Get token from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
      mode: 'cors',
      ...options,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    // Handle unauthorized access (redirect to login)
    if (response.status === 401) {
      toast.error("Session expired. Redirecting to login...");
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorMessage = isJson ? data.detail || data.message || 'Unknown error' : data;
      throw new Error(errorMessage);
    }

    return isJson ? data : { message: data };
  } catch (error) {
    if (error.message.includes('Failed to fetch') && retries < MAX_RETRIES) {
      console.warn(`Retrying ${endpoint} (attempt ${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return apiCall(endpoint, options, retries + 1);
    }

    console.error(`API call failed for ${endpoint}:`, error);
    toast.error(`Error: ${error.message || `API call failed. Is the server running at ${API_URL}?`}`);
    throw error;
  }
}

// Repository API Calls
export const repositoryApi = {
  add: async (data) => {
    try {
      const response = await apiCall('/repositories/add', {  // Changed from '/repository'
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.id) {
        throw new Error('Invalid response from server');
      }

      toast.success('Repository added successfully!');
      return {
        id: response.id,
        name: response.name,
        url: response.repo_url,
        status: 'processing',
        private: response.private
      };
    } catch (error) {
      if (error.message.includes('already exists')) {
        toast.error('This repository has already been added.');
      } else {
        toast.error(error.message || 'Failed to add repository.');
      }
      throw error;
    }
  },

  list: async () => {
    try {
      return await apiCall('/repositories');
    } catch (error) {
      toast.error('Error fetching repositories.');
      throw error;
    }
  },

  get: (id) => apiCall(`/repositories/${id}`),

  delete: async (id) => {
    try {
      await apiCall(`/repositories/${id}`, { method: 'DELETE' });
      toast.success('Repository deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete repository.');
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      await apiCall(`/repositories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      toast.success('Repository updated successfully!');
    } catch (error) {
      toast.error('Failed to update repository.');
      throw error;
    }
  },

  process: async (id) => {
    try {
      return await apiCall(`/repositories/${id}/process`, { method: 'POST' });
    } catch (error) {
      toast.error('Error processing repository.');
      throw error;
    }
  },

  status: (id) => apiCall(`/repositories/${id}/status`),

  index: async (id) => {
    try {
      return await apiCall(`/repositories/${id}/index`, { method: 'POST' });
    } catch (error) {
      toast.error('Failed to index repository.');
      throw error;
    }
  },
};

// Chat API Calls
export const chatApi = {
  sendMessage: async (data) => {
    try {
      return await apiCall('/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      toast.error('Error sending message.');
      throw error;
    }
  },
};
