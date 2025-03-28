// src/components/admin/repository-manager.jsx
import React, { useState } from 'react';
import { useRepo } from '../context/repocontext';
import { fetchFileContent } from '../../lib/github-api';

export default function RepositoryManager() {
  const { repositories, loading, addRepository, githubClient } = useRepo();
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  
  const handleAddRepo = (e) => {
    e.preventDefault();
    addRepository(owner, repo);
    setOwner('');
    setRepo('');
  };
  
  const fetchFile = async (path, ref = 'main') => {
    if (!selectedRepo || !githubClient) return;
    
    try {
      const content = await fetchFileContent(
        githubClient, 
        selectedRepo.owner.login, 
        selectedRepo.name, 
        path, 
        ref
      );
      setFileContent(content);
      
      // Process file content for RAG pipeline
      // This would connect to your backend processing
      
    } catch (err) {
      console.error("Error fetching file:", err);
    }
  };
  
  return (
    <div>
      <h2>Repository Manager</h2>
      
      {/* Repository add form */}
      <form onSubmit={handleAddRepo}>
        <input 
          value={owner} 
          onChange={(e) => setOwner(e.target.value)} 
          placeholder="Repository Owner" 
        />
        <input 
          value={repo} 
          onChange={(e) => setRepo(e.target.value)} 
          placeholder="Repository Name" 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Repository'}
        </button>
      </form>
      
      {/* Repository list */}
      <div>
        <h3>Your Repositories</h3>
        <ul>
          {repositories.map((repo) => (
            <li key={repo.id} onClick={() => setSelectedRepo(repo)}>
              {repo.full_name}
            </li>
          ))}
        </ul>
      </div>
      
      {/* File content display for selected repo */}
      {selectedRepo && (
        <div>
          <h3>Browse {selectedRepo.name}</h3>
          {/* File browser implementation */}
          {fileContent && (
            <pre>{fileContent}</pre>
          )}
        </div>
      )}
    </div>
  );
}
