import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types/anomaly";
import { mockUsers } from "@/lib/mockData";
import { login, signup } from "@/services/auth";

interface AuthContextType {
  user: User | null;
  loginHandler: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    try {
      const storedUser = localStorage.getItem("taqamorocco_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Validate the stored user data
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setUser(parsedUser);
        } else {
          // Clear invalid data
          localStorage.clear()
        }
      }
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      localStorage.clear()
    }
    setIsLoading(false);
  }, []);
  // useEffect(() => {
  //   // Check for stored user session
  //   try {
  //     const accessToken = localStorage.getItem("access");
  //     if (accessToken) {
  //       const user = {
  //         id: JSON.parse(localStorage.getItem("id")),
  //         email: JSON.parse(localStorage.getItem("email")),
  //         department: JSON.parse(localStorage.getItem("department")),
  //         role: JSON.parse(localStorage.getItem("role")),
  //         isActive: JSON.parse(localStorage.getItem("isActive")),
  //         lastLogin: JSON.parse(localStorage.getItem("lastLogin")),
  //         name: JSON.parse(localStorage.getItem("name")),
  //         createdAt: JSON.parse(localStorage.getItem("createdAt")),
  //       };

  //       setUser(user);
  //     } else {
  //       // Clear invalid data
  //       localStorage.clear();
  //     }
  //   } catch (error) {
  //     console.error("Error parsing stored user data:", error);
  //     localStorage.removeItem("taqamorocco_user");
  //   }
  //   setIsLoading(false);
  // }, []);

  const loginHandler = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const foundUser = await login(email, password);
      console.log(foundUser);
      
      if (foundUser.access) {
        setUser(foundUser);
        // for (const [key, value] of Object.entries(foundUser)) {
        //   localStorage.setItem(key, JSON.stringify(value));
        // }
        localStorage.setItem("taqamorocco_user", JSON.stringify(foundUser));
        setIsLoading(false);
        return true;
      }
      if (!foundUser.success) {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { name, email, role, password } = userData;
      const newUser: User = await signup(name, email, password, role);
      console.log(newUser);

      if (newUser.status === 400) {
        setIsLoading(false);
        return false;
      }
      setUser(newUser.data);
      localStorage.setItem("taqamorocco_user", JSON.stringify(newUser.data));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear()
  };

  const value: AuthContextType = {
    user,
    loginHandler,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
