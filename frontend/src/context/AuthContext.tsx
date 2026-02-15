import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";

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
  isAuthLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH0_ENABLED = Boolean(
  import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID,
);

const LOCAL_USER_STORAGE_KEY = "user";
const LOCAL_ACCOUNTS_STORAGE_KEY = "connecther:accounts";

interface LocalAccount {
  email: string;
  password: string;
  name: string;
}

function getProfileStorageKey(id: string) {
  return `connecther:user:${id}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readLocalAccounts(): LocalAccount[] {
  const raw = localStorage.getItem(LOCAL_ACCOUNTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (account): account is LocalAccount =>
        !!account &&
        typeof account.email === "string" &&
        typeof account.password === "string" &&
        typeof account.name === "string",
    );
  } catch {
    return [];
  }
}

function writeLocalAccounts(accounts: LocalAccount[]) {
  localStorage.setItem(LOCAL_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();
    if (!normalizedEmail || !trimmedPassword) return false;

    const account = readLocalAccounts().find(
      (candidate) => normalizeEmail(candidate.email) === normalizedEmail,
    );

    if (!account || account.password !== trimmedPassword) {
      setAuthError("Invalid email or password.");
      return false;
    }

    const savedUser = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    let existingUserForAccount: User | null = null;

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        if (normalizeEmail(parsedUser.email || "") === normalizedEmail) {
          existingUserForAccount = parsedUser;
        }
      } catch {
        existingUserForAccount = null;
      }
    }

    const userData: User =
      existingUserForAccount ?? {
        email: account.email,
        name: account.name || account.email.split("@")[0],
      };

    setUser(userData);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(userData));
    return true;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    setAuthError(null);
    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();
    if (!normalizedEmail || !trimmedPassword || !trimmedName) return false;

    const existingAccounts = readLocalAccounts();
    const alreadyExists = existingAccounts.some(
      (account) => normalizeEmail(account.email) === normalizedEmail,
    );

    if (alreadyExists) {
      setAuthError("An account with this email already exists.");
      return false;
    }

    const nextAccount: LocalAccount = {
      email: normalizedEmail,
      password: trimmedPassword,
      name: trimmedName,
    };

    writeLocalAccounts([...existingAccounts, nextAccount]);

    const userData: User = {
      email: normalizedEmail,
      name: trimmedName,
    };
    setUser(userData);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
  };

  const updateUserProfile = async (profileData: UserProfileData): Promise<void> => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      ...profileData,
      hasCompletedOnboarding: true,
    };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
    hasCompletedOnboarding: !!user?.hasCompletedOnboarding,
    isAuthLoading: false,
    authError,
    clearAuthError: () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function Auth0BackedAuthProvider({ children }: { children: ReactNode }) {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const [profileData, setProfileData] = useState<Partial<User>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const storageId = auth0User?.sub || auth0User?.email || "";

  useEffect(() => {
    if (!storageId) {
      setProfileData({});
      return;
    }

    const saved = localStorage.getItem(getProfileStorageKey(storageId));
    const parsedData = saved ? JSON.parse(saved) : {};

    // Check if there's a pending name from registration
    const pendingName = sessionStorage.getItem('pending-user-name');
    if (pendingName && !parsedData.name) {
      parsedData.name = pendingName;
      localStorage.setItem(getProfileStorageKey(storageId), JSON.stringify(parsedData));
      sessionStorage.removeItem('pending-user-name');
    }

    setProfileData(parsedData);
  }, [storageId]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error || errorDescription) {
      setAuthError(
        errorDescription ||
          "Authentication failed. Please verify your credentials and try again.",
      );

      // Remove OAuth params from URL after surfacing the error.
      url.searchParams.delete("error");
      url.searchParams.delete("error_description");
      url.searchParams.delete("state");
      url.searchParams.delete("code");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setAuthError(null);
    await loginWithRedirect({
      authorizationParams: {
        login_hint: email || undefined,
        redirect_uri: `${window.location.origin}/login`,
      },
      appState: {
        returnTo: "/",
      },
    });
    return true;
  };

  const register = async (email: string, _password: string, name: string): Promise<boolean> => {
    setAuthError(null);

    // Store the name in localStorage temporarily so we can use it after Auth0 redirect
    if (name) {
      sessionStorage.setItem('pending-user-name', name);
    }

    await loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        login_hint: email || undefined,
        redirect_uri: `${window.location.origin}/register`,
      },
      appState: {
        returnTo: "/",
      },
    });
    return true;
  };

  const logout = () => {
    auth0Logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };

  const updateUserProfile = async (incomingProfile: UserProfileData): Promise<void> => {
    if (!storageId) return;
    const nextProfile: Partial<User> = {
      ...incomingProfile,
      hasCompletedOnboarding: true,
    };
    localStorage.setItem(
      getProfileStorageKey(storageId),
      JSON.stringify(nextProfile),
    );
    setProfileData(nextProfile);
  };

  const mergedUser: User | null = useMemo(() => {
    if (!isAuthenticated || !auth0User) return null;
    return {
      email: auth0User.email || "",
      name: profileData.name || auth0User.name || auth0User.nickname || "User",
      ...profileData,
    };
  }, [auth0User, isAuthenticated, profileData]);

  const value: AuthContextType = {
    user: mergedUser,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated,
    hasCompletedOnboarding: !!mergedUser?.hasCompletedOnboarding,
    isAuthLoading: isLoading,
    authError,
    clearAuthError: () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (AUTH0_ENABLED) {
    return <Auth0BackedAuthProvider>{children}</Auth0BackedAuthProvider>;
  }
  return <LocalAuthProvider>{children}</LocalAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
