"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Switch } from "../ui/switch"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { Copy, MessageSquare, Code, Settings, Users, ExternalLink, Trash2 } from "lucide-react"

const ChatbotPage = () => {
  const toast = useToast()  // Change this line to get toast directly
  const [activeTab, setActiveTab] = useState("configuration")
  const [selectedRepo, setSelectedRepo] = useState("")
  const [embedCode, setEmbedCode] = useState("")

  // Add mock repositories data
  const mockRepositories = [
    { id: "repo1", name: "Frontend Assistant" },
    { id: "repo2", name: "Backend Helper" },
  ]

  // Mock repository-specific configurations
  const mockRepoConfigs = {
    repo1: {
      chatbotName: "Frontend Assistant",
      welcomeMessage: "Hello! I'm your frontend repository assistant.",
      primaryColor: "#0ea5e9",
      model: "gpt-3.5-turbo",
      maxTokens: 512,
      temperature: 0.5,
      allowRepositoryAccess: true,
      allowCodeAccess: true,
      allowIssuesAccess: true,
      requireAuthentication: true,
    },
    repo2: {
      chatbotName: "Backend Helper",
      welcomeMessage: "Hi! I can help you with backend code.",
      primaryColor: "#6366f1",
      model: "gpt-4",
      maxTokens: 2048,
      temperature: 0.7,
      allowRepositoryAccess: true,
      allowCodeAccess: true,
      allowIssuesAccess: false,
      requireAuthentication: true,
    },
  }

  // Default configuration
  const defaultConfig = {
    chatbotName: "RepoAssistant",
    welcomeMessage: "Hello! I'm your repository assistant. How can I help you today?",
    primaryColor: "#0284c7",
    model: "gpt-4",
    maxTokens: 1024,
    temperature: 0.7,
    allowRepositoryAccess: true,
    allowCodeAccess: true,
    allowIssuesAccess: false,
    requireAuthentication: true,
  }

  const [config, setConfig] = useState(defaultConfig)

  // Load repository-specific configuration when repository changes
  useEffect(() => {
    if (selectedRepo) {
      const repoConfig = mockRepoConfigs[selectedRepo]
      if (repoConfig) {
        setConfig(repoConfig)
        // Update embed code with repository-specific configuration
        setEmbedCode(
          `<script src="https://cdn.example.com/chatbot.js" 
  data-repo-id="${selectedRepo}"
  data-chatbot-name="${repoConfig.chatbotName}"
  data-primary-color="${repoConfig.primaryColor}">
</script>`
        )
        toast.toast({  // Update toast calls to use toast.toast
          title: "Configuration loaded",
          description: `Loaded settings for ${selectedRepo}`,
        })
      } else {
        setConfig(defaultConfig)
        setEmbedCode("")
      }
    }
  }, [selectedRepo])

  const handleSaveConfig = () => {
    if (!selectedRepo) {
      toast.toast({  // Update toast calls
        title: "Error",
        description: "Please select a repository first",
        variant: "destructive",
      })
      return
    }
    
    // Here you would typically save to your backend
    mockRepoConfigs[selectedRepo] = config
    toast.toast({  // Update toast calls
      title: "Configuration saved",
      description: `Settings saved for ${selectedRepo}`,
    })
  }

  const handleResetConfig = () => {
    if (!selectedRepo) {
      toast.toast({  // Update toast calls
        title: "Error",
        description: "Please select a repository first",
        variant: "destructive",
      })
      return
    }

    const repoConfig = mockRepoConfigs[selectedRepo] || defaultConfig
    setConfig(repoConfig)
    toast.toast({  // Update toast calls
      title: "Configuration reset",
      description: `Settings reset for ${selectedRepo}`,
    })
  }

  const handleCopyEmbedCode = () => {
    if (!selectedRepo) {
      toast.toast({  // Update toast calls
        title: "Error",
        description: "Please select a repository first",
        variant: "destructive",
      })
      return
    }
    navigator.clipboard.writeText(embedCode)
    toast.toast({  // Update toast calls
      title: "Embed code copied",
      description: "The chatbot embed code has been copied to your clipboard.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chatbot</h1>
        <p className="text-muted-foreground">Configure and manage your repository chatbot</p>
      </div>

      <div className="mb-6">
        <Label htmlFor="repository">Select Repository</Label>
        <Select value={selectedRepo} onValueChange={setSelectedRepo}>
          <SelectTrigger id="repository" className="w-[300px]">
            <SelectValue placeholder="Choose a repository" />
          </SelectTrigger>
          <SelectContent>
            {mockRepositories.map((repo) => (
              <SelectItem key={repo.id} value={repo.id}>
                {repo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="embed">
            <Code className="mr-2 h-4 w-4" />
            Embed Code
          </TabsTrigger>
          <TabsTrigger value="access">
            <Users className="mr-2 h-4 w-4" />
            Access Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Settings</CardTitle>
              <CardDescription>Configure how your chatbot looks and behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="chatbot-name">Chatbot Name</Label>
                <Input
                  id="chatbot-name"
                  value={config.chatbotName}
                  onChange={(e) => setConfig({ ...config, chatbotName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  value={config.welcomeMessage}
                  onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">LLM Configuration</h3>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={config.model} onValueChange={(value) => setConfig({ ...config, model: value })}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="claude-2">Claude 2</SelectItem>
                      <SelectItem value="llama-2">Llama 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig({ ...config, maxTokens: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="temperature"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => setConfig({ ...config, temperature: Number.parseFloat(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{config.temperature}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Access Settings</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="repo-access">Repository Access</Label>
                    <p className="text-sm text-muted-foreground">Allow chatbot to access repository documentation</p>
                  </div>
                  <Switch
                    id="repo-access"
                    checked={config.allowRepositoryAccess}
                    onCheckedChange={(checked) => setConfig({ ...config, allowRepositoryAccess: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="code-access">Code Access</Label>
                    <p className="text-sm text-muted-foreground">Allow chatbot to access repository code</p>
                  </div>
                  <Switch
                    id="code-access"
                    checked={config.allowCodeAccess}
                    onCheckedChange={(checked) => setConfig({ ...config, allowCodeAccess: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="issues-access">Issues Access</Label>
                    <p className="text-sm text-muted-foreground">Allow chatbot to access repository issues</p>
                  </div>
                  <Switch
                    id="issues-access"
                    checked={config.allowIssuesAccess}
                    onCheckedChange={(checked) => setConfig({ ...config, allowIssuesAccess: checked })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" onClick={handleResetConfig}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSaveConfig}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed Your Chatbot</CardTitle>
              <CardDescription>Add this code to your website to embed the chatbot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea value={embedCode} readOnly rows={4} className="font-mono text-sm" />
                <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={handleCopyEmbedCode}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Preview</h3>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{config.chatbotName}</p>
                      <p className="text-xs text-muted-foreground">Click to open chat</p>
                    </div>
                  </div>
                  <Button size="sm" style={{ backgroundColor: config.primaryColor }}>
                    Open Chat
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Installation Instructions</h3>
                <ol className="space-y-2 text-sm">
                  <li>1. Copy the embed code above</li>
                  <li>2. Paste it into your website's HTML, just before the closing &lt;/body&gt; tag</li>
                  <li>3. The chatbot will appear as a floating button on your website</li>
                </ol>
                <div className="mt-4">
                  <a href="#" className="text-sm text-primary flex items-center hover:underline">
                    View detailed documentation
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Manage who can access your chatbot and what they can see</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-auth">Require Authentication</Label>
                  <p className="text-sm text-muted-foreground">Only allow authenticated users to access the chatbot</p>
                </div>
                <Switch
                  id="require-auth"
                  checked={config.requireAuthentication}
                  onCheckedChange={(checked) => setConfig({ ...config, requireAuthentication: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Authorized Domains</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Only allow the chatbot to be embedded on these domains
                </p>
                <div className="space-y-2">
                  {["example.com", "docs.example.com"].map((domain, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={domain} readOnly className="flex-1" />
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input placeholder="Enter domain (e.g., example.com)" className="flex-1" />
                    <Button>Add</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Authorized Users</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Only these users will be able to access the chatbot
                </p>
                <div className="space-y-2">
                  {["user1@example.com", "user2@example.com"].map((email, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={email} readOnly className="flex-1" />
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input placeholder="Enter email address" className="flex-1" />
                    <Button>Add</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveConfig} className="ml-auto">
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ChatbotPage

