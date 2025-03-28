// src/lib/github-api.js
import { Octokit } from "@octokit/rest";

// Initialize Octokit with authentication
export const createGitHubClient = (token) => {
  return new Octokit({
    auth: token,
    userAgent: 'GitRAG App v1.0',
  });
};

// Repository operations
export const fetchRepository = async (client, owner, repo) => {
  try {
    const response = await client.repos.get({
      owner,
      repo,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching repository:", error);
    throw error;
  }
};

// File content operations
export const fetchFileContent = async (client, owner, repo, path, ref = 'main') => {
  try {
    const response = await client.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });
    
    // GitHub API returns content as Base64 encoded
    const content = Buffer.from(response.data.content, 'base64').toString();
    return content;
  } catch (error) {
    console.error("Error fetching file content:", error);
    throw error;
  }
};
// src/lib/github-api.js
// Add this function to the existing file

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
