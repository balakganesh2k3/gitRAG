import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
// import { repositoryApi } from "../../lib/utils/api"; // Removed original import
import { ToastContainer, toast } from 'react-toastify';
import { createGitHubClient, fetchRepository, processRepositoryWithRAG } from "../../lib/utils/api"; // Added new import
import { useAuth } from "../context/auth-context"; // Added import for auth context

const RepositoryManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [newRepo, setNewRepo] = useState({ name: "", url: "" });
  const [editRepo, setEditRepo] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [patToken, setPatToken] = useState("");
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth(); // Get user and auth info
  const [githubClient, setGithubClient] = useState(null); // Octokit client

  // Initialize GitHub client when user is authenticated
  useEffect(() => {
    if (user?.githubToken) {
      setGithubClient(createGitHubClient(user.githubToken));
    }
  }, [user]);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleAddRepository = async (e) => {
    e.preventDefault();
    try {
      const githubUrlPattern = /^https?:\/\/github\.com\/([\w-]+)\/([\w.-]+)\/?$/;
      if (!githubUrlPattern.test(repoUrl)) {
        toast.error("Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)");
        return;
      }

      const match = repoUrl.match(githubUrlPattern);
      const owner = match[1];
      const repo = match[2];

      if (!githubClient) {
        toast.error("Not authenticated with Github. Please login.");
        return;
      }

      setLoading(true);

      // Fetch repo details using Octokit
      const repoData = await fetchRepository(githubClient, owner, repo);

      // Process the repo (RAG)
      const ragResult = await processRepositoryWithRAG({ post: () => Promise.resolve({ data: { status: 'completed' } }) }, owner, repo); // Mock apiClient

      setRepositories(prev => [...prev, {
        id: repoData.id, // Use GitHub repo ID
        name: repoData.name,
        url: repoUrl,
        private: isPrivate,
        status: 'completed', // Set initial status
        owner: owner,
        repo: repo
      }]);
      toast.success("Repository added successfully. Processing will begin shortly.");
      setRepoUrl('');
      setPatToken('');
      setIsPrivate(false);

    } catch (error) {
      console.error('Error adding repository:', error);
      toast.error(error.message || "Failed to add repository");
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositories = async () => {
    if (initialized) return;
    try {
      setLoading(true);
      setError(null);
      // Fetch existing repositories (if you have a backend to store them)
      // For now, keep it empty
      setRepositories([]);
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please try again.');
      toast.error(error.message || "Failed to fetch repositories");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepository = (id) => {
    // Implement delete logic here (API call to delete from backend)
    setRepositories(repositories.filter((repo) => repo.id !== id));
  };

  const handleEditRepository = (repo) => {
    setEditRepo(repo);
    setNewRepo(repo);
  };

  const handleUpdateRepository = () => {
    // Implement update logic here (API call to update in backend)
    setRepositories(repositories.map(repo => repo.id === editRepo.id ? { ...repo, ...newRepo } : repo));
    setEditRepo(null);
    setNewRepo({ name: "", url: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddRepository} className="flex flex-col space-y-4">
          <Input
            type="url"
            placeholder="GitHub Repository URL (e.g., https://github.com/user/repo)"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <div className="flex items-center space-x-2">
            <Switch id="isPrivate" checked={isPrivate} onCheckedChange={setIsPrivate} />
            <label htmlFor="isPrivate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Private Repository
            </label>
          </div>
          {isPrivate && (
            <Input
              type="password"
              placeholder="Personal Access Token"
              value={patToken}
              onChange={(e) => setPatToken(e.target.value)}
              required={isPrivate}
            />
          )}
          <Button disabled={loading}><PlusCircle className="mr-2 h-4 w-4" /> Add Repository</Button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
        {repositories.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Repositories</h3>
            <ul>
              {repositories.map((repo) => (
                <li key={repo.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span>{repo.name}</span>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => handleEditRepository(repo)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRepository(repo.id)}><Trash className="h-4 w-4" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ToastContainer />
      </CardContent>
    </Card>
  );
};

export default RepositoryManager;
