"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "../../hooks/use-toast"

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // This is a mock login - in a real app, you would call your auth API
      if (email === "admin@example.com" && password === "password") {
        const userData = {
          id: "1",
          email,
          name: "Admin User",
          role: "admin",
        }

        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))

        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        return true
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password",
        })
        return false
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login",
      })
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

