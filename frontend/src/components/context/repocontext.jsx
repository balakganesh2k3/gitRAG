// src/components/context/repocontext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import { useAuth } from './auth-context';
import { useApi } from '../../hooks/use-api';

const RepoContext = createContext();

export function RepoProvider({ children }) {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const apiClient = useApi();
  const [githubClient, setGithubClient] = useState(null);

  // Initialize Octokit client when user is authenticated
  useEffect(() => {
    if (user?.githubToken) {
      setGithubClient(new Octokit({
        auth: user.githubToken,
        userAgent: 'GitRAG App v1.0',
      }));
    }
  }, [user]);

  const addRepository = async (owner, repo) => {
    if (!githubClient) return;

    setLoading(true);
    try {
      // Fetch repository data using Octokit
      const response = await githubClient.repos.get({ owner, repo });
      const repoData = response.data;

      // Update state with repository data
      setRepositories(prev => [...prev, repoData]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processRepository = async (owner, repo, branch = 'main', filePaths = null) => {
    setLoading(true);
    try {
      // Send repository processing request to backend
      const response = await apiClient.post('/api/github/process', {
        owner,
        repo,
        branch,
        file_paths: filePaths,
      });

      // Update state with processed repository data
      setRepositories(prev => prev.map(r =>
        r.full_name === `${owner}/${repo}`
          ? { ...r, processed: true, processingResult: response.data }
          : r
      ));
      
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <RepoContext.Provider value={{
      repositories,
      loading,
      error,
      addRepository,
      processRepository,
    }}>
      {children}
    </RepoContext.Provider>
  );
}

export const useRepo = () => useContext(RepoContext);
