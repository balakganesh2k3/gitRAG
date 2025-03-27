"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { useToast } from "../../hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

const SettingsPage = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")

  // Mock settings state
  const [settings, setSettings] = useState({
    apiEndpoint: "https://api.example.com/v1",
    llmProvider: "openai",
    openaiApiKey: "sk-••••••••••••••••••••••••••••••",
    vectorDbProvider: "pinecone",
    pineconeApiKey: "••••••••••••••••••••••••••••••",
    pineconeIndex: "repo-embeddings",
    maxTokensPerRequest: 4096,
    embeddingModel: "text-embedding-ada-002",
    logLevel: "info",
  })

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    })
  }

  const handleResetSettings = () => {
    // Reset to default values
    setSettings({
      apiEndpoint: "https://api.example.com/v1",
      llmProvider: "openai",
      openaiApiKey: "sk-••••••••••••••••••••••••••••••",
      vectorDbProvider: "pinecone",
      pineconeApiKey: "••••••••••••••••••••••••••••••",
      pineconeIndex: "repo-embeddings",
      maxTokensPerRequest: 4096,
      embeddingModel: "text-embedding-ada-002",
      logLevel: "info",
    })

    toast({
      title: "Settings reset",
      description: "Your settings have been reset to default values.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your RAG system settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure the basic settings for your RAG system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-endpoint">API Endpoint</Label>
                <Input
                  id="api-endpoint"
                  value={settings.apiEndpoint}
                  onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="llm-provider">LLM Provider</Label>
                <Select
                  value={settings.llmProvider}
                  onValueChange={(value) => setSettings({ ...settings, llmProvider: value })}
                >
                  <SelectTrigger id="llm-provider">
                    <SelectValue placeholder="Select LLM provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google AI</SelectItem>
                    <SelectItem value="meta">Meta AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vector-db-provider">Vector Database Provider</Label>
                <Select
                  value={settings.vectorDbProvider}
                  onValueChange={(value) => setSettings({ ...settings, vectorDbProvider: value })}
                >
                  <SelectTrigger id="vector-db-provider">
                    <SelectValue placeholder="Select vector database provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pinecone">Pinecone</SelectItem>
                    <SelectItem value="weaviate">Weaviate</SelectItem>
                    <SelectItem value="qdrant">Qdrant</SelectItem>
                    <SelectItem value="chroma">ChromaDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embedding-model">Embedding Model</Label>
                <Select
                  value={settings.embeddingModel}
                  onValueChange={(value) => setSettings({ ...settings, embeddingModel: value })}
                >
                  <SelectTrigger id="embedding-model">
                    <SelectValue placeholder="Select embedding model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
                    <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                    <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" onClick={handleResetSettings}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              API keys are sensitive information. They are encrypted before being stored and are never exposed in logs
              or responses.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Configure the API keys for your LLM and vector database providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">OpenAI</h3>
                <div className="space-y-2">
                  <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                  <Input
                    id="openai-api-key"
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pinecone</h3>
                <div className="space-y-2">
                  <Label htmlFor="pinecone-api-key">Pinecone API Key</Label>
                  <Input
                    id="pinecone-api-key"
                    type="password"
                    value={settings.pineconeApiKey}
                    onChange={(e) => setSettings({ ...settings, pineconeApiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinecone-index">Pinecone Index</Label>
                  <Input
                    id="pinecone-index"
                    value={settings.pineconeIndex}
                    onChange={(e) => setSettings({ ...settings, pineconeIndex: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button onClick={handleSaveSettings}>Save API Keys</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced settings for your RAG system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-tokens">Max Tokens Per Request</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  value={settings.maxTokensPerRequest}
                  onChange={(e) => setSettings({ ...settings, maxTokensPerRequest: Number.parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">Maximum number of tokens to use for each LLM request</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-level">Log Level</Label>
                <Select
                  value={settings.logLevel}
                  onValueChange={(value) => setSettings({ ...settings, logLevel: value })}
                >
                  <SelectTrigger id="log-level">
                    <SelectValue placeholder="Select log level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Controls the verbosity of system logs</p>
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <div className="rounded-md border border-destructive/50 p-4">
                  <h4 className="font-medium text-destructive">Clear Vector Database</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This will delete all embeddings from your vector database. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm" className="mt-4">
                    Clear Database
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" onClick={handleResetSettings}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage

