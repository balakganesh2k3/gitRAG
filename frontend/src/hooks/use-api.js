// src/hooks/use-api.js

import { useMemo } from 'react';
import axios from 'axios';

export const useApi = () => {
  const apiClient = useMemo(() => {
    const baseURL = import.meta.env.VITE_API_URL || '/';
    return axios.create({
      baseURL: baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, []);

  return apiClient;
};
