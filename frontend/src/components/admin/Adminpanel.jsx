"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import RepositoryForm from "./repositoryform"
import RepositoryList from "./repositorylist"
import EmbedCodeGenerator from "./embedcodegenerator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("repositories")

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="add-repository">Add Repository</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories">
          <Card>
            <CardHeader>
              <CardTitle>Connected Repositories</CardTitle>
              <CardDescription>View and manage your connected GitHub repositories</CardDescription>
            </CardHeader>
            <CardContent>
              <RepositoryList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-repository">
          <Card>
            <CardHeader>
              <CardTitle>Add Repository</CardTitle>
              <CardDescription>Connect a new GitHub repository to your RAG system</CardDescription>
            </CardHeader>
            <CardContent>
              <RepositoryForm onSuccess={() => setActiveTab("repositories")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>Get the code to embed your chatbot on external websites</CardDescription>
            </CardHeader>
            <CardContent>
              <EmbedCodeGenerator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

