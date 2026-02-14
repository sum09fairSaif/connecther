import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  age?: number;
  dueDate?: string;
  height?: string;
  weight?: string;
  location?: string;
  weeksPregnant?: number;
  medicalHistory?: string;
  allergies?: string;
  hasCompletedOnboarding?: boolean;
}

interface UserProfileData {
  age: number;
  height: string;
  weight: string;
  location: string;
  dueDate: string;
  weeksPregnant: number;
  medicalHistory?: string;
  allergies?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profileData: UserProfileData) => Promise<void>;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user is stored in localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace with actual API call
    // For now, simulate login with simple validation
    if (email && password) {
      const userData: User = {
        email,
        name: email.split('@')[0], // Use email prefix as name for now
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // TODO: Replace with actual API call
    // For now, simulate registration
    if (email && password && name) {
      const userData: User = {
        email,
        name,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserProfile = async (profileData: UserProfileData): Promise<void> => {
    // TODO: Replace with actual API call
    if (user) {
      const updatedUser: User = {
        ...user,
        ...profileData,
        hasCompletedOnboarding: true,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
    hasCompletedOnboarding: !!user?.hasCompletedOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
