import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation } from "wouter";

const BASE_URL = import.meta.env.VITE_API_URL || "";

export interface AuthUser {
  id: number;
  email: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  modalOpen: boolean;
  pendingCategory: string | null;
  openModal: (pendingCategory?: string) => void;
  closeModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const openModal = useCallback((category?: string) => {
    setPendingCategory(category ?? null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setPendingCategory(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setUser(data.user);
    const target = pendingCategory;
    setModalOpen(false);
    setPendingCategory(null);
    if (target) navigate(`/portfolio/${target}`);
  }, [pendingCategory, navigate]);

  const signup = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    setUser(data.user);
    const target = pendingCategory;
    setModalOpen(false);
    setPendingCategory(null);
    if (target) navigate(`/portfolio/${target}`);
  }, [pendingCategory, navigate]);

  const logout = useCallback(async () => {
    await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    navigate("/");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, modalOpen, pendingCategory, openModal, closeModal, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
  }
