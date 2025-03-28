// src/lib/utils/api.js

import axios from 'axios';

// Process repository through RAG pipeline
export const processRepositoryWithRAG = async (apiClient, owner, repo, branch = 'main', filePaths = null) => {
  try {
    const response = await apiClient.post('/api/github/process', {
      owner,
      repo,
      branch,
      file_paths: filePaths
    });
    return response.data;
  } catch (error) {
    console.error("Error processing repository:", error);
    throw error;
  }
};

// Additional GitHub API operations as needed

