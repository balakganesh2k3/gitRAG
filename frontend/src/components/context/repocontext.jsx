"use client"

import { createContext, useContext, useState } from "react"

// Create the repository context
const RepoContext = createContext(undefined)

export function RepoProvider({ children }) {
  const [repositories, setRepositories] = useState([
    {
      id: "1",
      url: "https://github.com/shadcn/ui",
      name: "shadcn/ui",
      description: "Beautifully designed components built with Radix UI and Tailwind CSS.",
      status: "ready",
      addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isPublic: true,
      exposedToChat: true,
    },
  ])

  const addRepository = async (url, pat) => {
    // Mock API call to GitHub
    const isPrivate = !!pat

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Extract repo name from URL
    const urlParts = url.split("/")
    const repoName = `${urlParts[urlParts.length - 2] || ""}/${urlParts[urlParts.length - 1] || ""}`

    const newRepo = {
      id: Date.now().toString(),
      url,
      name: repoName,
      description: "Repository description will appear here after processing",
      status: "processing",
      addedAt: new Date(),
      isPublic: !isPrivate,
      exposedToChat: true,
    }

    setRepositories((prev) => [...prev, newRepo])

    // Simulate processing completion
    setTimeout(() => {
      setRepositories((prev) =>
        prev.map((repo) =>
          repo.id === newRepo.id
            ? {
                ...repo,
                status: "ready",
                description: `This is a mock description for ${repoName}. In a real implementation, this would be fetched from the GitHub API.`,
              }
            : repo,
        ),
      )
    }, 3000)
  }

  const updateRepository = (id, updates) => {
    setRepositories((prev) => prev.map((repo) => (repo.id === id ? { ...repo, ...updates } : repo)))
  }

  const deleteRepository = (id) => {
    setRepositories((prev) => prev.filter((repo) => repo.id !== id))
  }

  const getEmbedCode = () => {
    return `<script>
(function(w,d,s,o,f,js,fjs){
  w['GitHub-RAG-Widget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
  js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
  js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
}(window,document,'script','githubRag','https://your-domain.com/widget.js'));
githubRag('init', { chatId: 'github-rag-chat' });
</script>
<div id="github-rag-chat"></div>`
  }

  return (
    <RepoContext.Provider
      value={{
        repositories,
        addRepository,
        updateRepository,
        deleteRepository,
        getEmbedCode,
      }}
    >
      {children}
    </RepoContext.Provider>
  )
}

export function useRepoContext() {
  const context = useContext(RepoContext)
  if (context === undefined) {
    throw new Error("useRepoContext must be used within a RepoProvider")
  }
  return context
}

