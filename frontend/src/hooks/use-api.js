// src/hooks/use-api.js

import { useState, useEffect } from 'react';
import axios from 'axios';

export const useApi = () => {
  const [apiClient, setApiClient] = useState(null);

  useEffect(() => {
    // Initialize Axios client with base URL from environment variables
    const baseURL = process.env.REACT_APP_API_BASE_URL || '/'; // Default to root if not set
    const client = axios.create({
      baseURL: baseURL,
      timeout: 10000, // Optional timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setApiClient(client);
  }, []);

  return apiClient;
};
