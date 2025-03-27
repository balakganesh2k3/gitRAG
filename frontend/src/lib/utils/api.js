const API_BASE_URL = "http://localhost:8000"; // FastAPI backend URL

// Add a new repository
export const addRepository = async (repoUrl, isPrivate, patToken) => {
  const response = await fetch(`${API_BASE_URL}/repositories/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repo_url: repoUrl,
      private: isPrivate,
      pat_token: isPrivate ? patToken : null,
    }),
  });
  return response.json();
};

// Fetch all repositories
export const getRepositories = async () => {
  const response = await fetch(`${API_BASE_URL}/repositories`);
  return response.json();
};

// Delete a repository
export const deleteRepository = async (repoId) => {
  await fetch(`${API_BASE_URL}/repositories/${repoId}`, { method: "DELETE" });
};

// Start indexing a repository
export const indexRepository = async (repoId) => {
  await fetch(`${API_BASE_URL}/repositories/${repoId}/index`, { method: "POST" });
};

// Get repository indexing status
export const getRepositoryStatus = async (repoId) => {
  const response = await fetch(`${API_BASE_URL}/repositories/${repoId}/status`);
  return response.json();
};
