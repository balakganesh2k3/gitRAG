import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { repositoryApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const RepositoryManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repositories, setRepositories] = useState([
    { id: 1, name: "Repo 1", url: "https://github.com/user/repo1" },
    { id: 2, name: "Repo 2", url: "https://github.com/user/repo2" },
  ]);
  const [newRepo, setNewRepo] = useState({ name: "", url: "" });
  const [editRepo, setEditRepo] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [patToken, setPatToken] = useState("");

  const handleAddRepository = async (e) => {
    e.preventDefault();
    try {
      await repositoryApi.add({
        repo_url: repoUrl,
        private: isPrivate,
        pat_token: isPrivate ? patToken : null
      });
      
      // Clear form
      setRepoUrl('');
      setPatToken('');
      setIsPrivate(false);
      
      // Refresh repository list
      fetchRepositories();
    } catch (error) {
      console.error('Error adding repository:', error);
      // Add error handling (e.g., toast notification)
    }
  };

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repositoryApi.list();
      setRepositories(data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to fetch repositories",
        variant: "destructive"
      });
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
    setRepositories(
      repositories.map((repo) =>
        repo.id === editRepo.id ? { ...repo, ...newRepo } : repo
      )
    );
    setEditRepo(null);
    setNewRepo({ name: "", url: "" });
  };

  useEffect(() => {
    fetchRepositories();
    
    // Poll for repository status updates
    const interval = setInterval(async () => {
      const processingRepos = repositories.filter(r => r.status === 'processing');
      if (processingRepos.length > 0) {
        const statuses = await Promise.all(
          processingRepos.map(repo => repositoryApi.status(repo.id))
        );
        
        setRepositories(prev => prev.map(repo => {
          const status = statuses.find(s => s.id === repo.id);
          return status ? { ...repo, status: status.status } : repo;
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [repositories]);

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
          <Button 
            variant="link" 
            className="ml-2" 
            onClick={fetchRepositories}
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
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

          <Card>
            <CardHeader>
              <CardTitle>Repository Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Repository Name"
                  value={newRepo.name}
                  onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                />
                <Input
                  placeholder="Repository URL"
                  value={newRepo.url}
                  onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })}
                />
                {editRepo ? (
                  <Button onClick={handleUpdateRepository}>Update</Button>
                ) : (
                  <Button onClick={handleAddRepository}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Add
                  </Button>
                )}
              </div>

              <ul>
                {repositories.map((repo) => (
                  <li key={repo.id} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                        {repo.name}
                      </a>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        repo.status === 'ready' ? 'bg-green-100 text-green-800' :
                        repo.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        repo.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {repo.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditRepository(repo)}
                        disabled={repo.status === 'processing'}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteRepository(repo.id)}
                        disabled={repo.status === 'processing'}
                      >
                        <Trash className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RepositoryManager;
