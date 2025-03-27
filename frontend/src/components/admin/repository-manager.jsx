import { useState, useEffect } from "react";
import {
  addRepository,
  getRepositories,
  deleteRepository,
  indexRepository,
  getRepositoryStatus,
} from "../utils/api";
import { Button, Card, CardContent, Input, Switch } from "@/components/ui";

export default function RepositoryManager() {
  const [repositories, setRepositories] = useState([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [patToken, setPatToken] = useState("");

  useEffect(() => {
    fetchRepositories();
  }, []);

  // Fetch all repositories
  const fetchRepositories = async () => {
    const repos = await getRepositories();
    setRepositories(repos);
  };

  // Poll repository indexing status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedRepos = await Promise.all(
        repositories.map(async (repo) => ({
          ...repo,
          status: (await getRepositoryStatus(repo.id)).status,
        }))
      );
      setRepositories(updatedRepos);
    }, 5000);

    return () => clearInterval(interval);
  }, [repositories]);

  // Handle adding a repository
  const handleAddRepository = async (e) => {
    e.preventDefault();
    try {
      // Add repository to database
      const response = await fetch('/api/repositories/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo_url: repoUrl,
          private: isPrivate,
          pat_token: isPrivate ? patToken : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add repository');
      }

      const { repo_id } = await response.json();

      // Trigger file processing and RAG indexing
      const processResponse = await fetch(`/api/repositories/${repo_id}/process`, {
        method: 'POST'
      });

      if (!processResponse.ok) {
        throw new Error('Failed to process repository');
      }

      // Refresh repository list
      fetchRepositories();
      setRepoUrl('');
      setPatToken('');

    } catch (error) {
      console.error('Error:', error);
      // Add error handling UI feedback here
    }
  };

  // Handle deleting a repository
  const handleDelete = async (repoId) => {
    await deleteRepository(repoId);
    fetchRepositories();
  };

  // Handle indexing a repository
  const handleIndex = async (repoId) => {
    await indexRepository(repoId);
    fetchRepositories();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GitHub Repository Manager</h1>

      {/* Add Repository Form */}
      <form onSubmit={handleAddRepository} className="space-y-4 mb-6">
        <Input
          type="text"
          placeholder="GitHub Repository URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          required
        />
        <div className="flex items-center gap-2">
          <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          <span>Private Repository</span>
        </div>
        {isPrivate && (
          <Input
            type="text"
            placeholder="GitHub PAT Token"
            value={patToken}
            onChange={(e) => setPatToken(e.target.value)}
          />
        )}
        <Button type="submit">Add Repository</Button>
      </form>

      {/* Repository List */}
      <div className="grid gap-4">
        {repositories.length === 0 ? (
          <p className="text-center text-gray-500">No repositories added.</p>
        ) : (
          repositories.map((repo) => (
            <Card key={repo.id} className="p-4">
              <CardContent>
                <h3 className="text-lg font-semibold">{repo.name}</h3>
                <p className="text-sm text-gray-500">{repo.repo_url}</p>
                <p className="text-sm font-bold">Status: {repo.status}</p>
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => handleIndex(repo.id)}>Index</Button>
                  <Button variant="destructive" onClick={() => handleDelete(repo.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
