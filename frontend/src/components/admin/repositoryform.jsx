import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { repositoryApi } from "../../lib/api";
import { ToastContainer, toast } from 'react-toastify';

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

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleAddRepository = async (e) => {
    e.preventDefault();
    try {
      const githubUrlPattern = /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
      if (!githubUrlPattern.test(repoUrl)) {
        toast.error("Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)");
        return;
      }
      setLoading(true);
      const response = await repositoryApi.add({
        repo_url: repoUrl,
        private: isPrivate,
        pat_token: isPrivate ? patToken : null
      });
      if (response && response.id) {
        setRepositories(prev => [...prev, response]);
        toast.success("Repository added successfully. Processing will begin shortly.");
        setRepoUrl('');
        setPatToken('');
        setIsPrivate(false);
        pollRepositoryStatus(response.id);
      }
    } catch (error) {
      console.error('Error adding repository:', error);
      toast.error(error.message || "Failed to add repository");
    } finally {
      setLoading(false);
    }
  };

  const pollRepositoryStatus = async (repoId) => {
    const interval = setInterval(async () => {
      try {
        const status = await repositoryApi.status(repoId);
        if (status && status.status !== 'processing') {
          clearInterval(interval);
          setRepositories(prev => prev.map(repo => repo.id === repoId ? { ...repo, status: status.status } : repo));
        }
      } catch (error) {
        console.error('Error polling status:', error);
        clearInterval(interval);
      }
    }, 5000);
  };

  const fetchRepositories = async () => {
    if (initialized) return;
    try {
      setLoading(true);
      setError(null);
      const data = await repositoryApi.list();
      if (Array.isArray(data)) {
        setRepositories(data);
      } else {
        setRepositories([]);
      }
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
    setRepositories(repositories.filter((repo) => repo.id !== id));
  };

  const handleEditRepository = (repo) => {
    setEditRepo(repo);
    setNewRepo(repo);
  };

  const handleUpdateRepository = () => {
    setRepositories(repositories.map(repo => repo.id === editRepo.id ? { ...repo, ...newRepo } : repo));
    setEditRepo(null);
    setNewRepo({ name: "", url: "" });
  };

  useEffect(() => {
    if (!initialized) return;
    const interval = setInterval(async () => {
      const processingRepos = repositories.filter(r => r.status === 'processing');
      if (processingRepos.length > 0) {
        const statuses = await Promise.all(processingRepos.map(repo => repositoryApi.status(repo.id)));
        setRepositories(prev => prev.map(repo => {
          const status = statuses.find(s => s.id === repo.id);
          return status ? { ...repo, status: status.status } : repo;
        }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [repositories, initialized]);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={5000} />
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
          <Button variant="link" className="ml-2" onClick={fetchRepositories}>Retry</Button>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <form onSubmit={handleAddRepository} className="space-y-4 mb-6">
            <Input type="text" placeholder="GitHub Repository URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} required />
            <div className="flex items-center gap-2">
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              <span>Private Repository</span>
            </div>
            {isPrivate && <Input type="text" placeholder="GitHub PAT Token" value={patToken} onChange={(e) => setPatToken(e.target.value)} />}
            <Button type="submit">Add Repository</Button>
          </form>
        </>
      )}
    </div>
  );
};

export default RepositoryManager;
