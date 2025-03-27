"use client"

import { ThemeProvider } from "./components/dashboard/themeprovider"
import { Toaster } from "sonner"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./components/context/auth-context"
import LoginPage from "./components/auth/login"
import DashboardPage from "./components/dashboard/dashboard-pg"
import RepositoriesPage from "./components/admin/repositoryform"
import SettingsPage from "./components/admin/settings"
import ChatbotPage from "./components/chat/chatinter"
import Layout from "./components/dashboard/layout"
import SignupPage from "./components/auth/signup"

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/layout" element={<Layout />} />
              <Route path="/repositories" element={<RepositoriesPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/settings" element={<SettingsPage />} />

            </Routes>
          </Layout>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

