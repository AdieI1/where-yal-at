import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { setAuthToken } from "../lib/api";
import {
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "../lib/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const storedUser = await getStoredUser();
        if (token && storedUser) {
          setAuthToken(token);
          setUser(storedUser);
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (token, nextUser) => {
    await setToken(token);
    await setStoredUser(nextUser);
    setAuthToken(token);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    await clearAuth();
    setAuthToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (nextUser) => {
    await setStoredUser(nextUser);
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      updateUser,
    }),
    [user, booting, signIn, signOut, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
