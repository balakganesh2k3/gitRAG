"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";  // Import supabase client
import { useToast } from "../../hooks/use-toast";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch the user session if it exists
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    }

    getSession();

    // Subscribe to auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "An error occurred during login",
        });
        return false;
      }

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user info

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          variant: "destructive",
          title: "Logout failed",
          description: error.message || "An error occurred during logout",
        });
        return;
      }

      setUser(null);
      localStorage.removeItem("user");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
      });
    }
  };

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
  );
};

export const useAuth = () => useContext(AuthContext);
