import { createContext, useContext, useState, useEffect } from "react";
import { auth, provider, signInWithPopup, signOut, IS_CONFIGURED, onAuthStateChanged } from "../firebase/config";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// ── LocalStorage helpers ─────────────────────────────────────────────────────
const USERS_KEY   = "meridian_users_db";
const CURRENT_KEY = "meridian_current_user";

function getDb()     { try { return JSON.parse(localStorage.getItem(USERS_KEY)   || "{}"); } catch { return {}; } }
function saveDb(db)  { localStorage.setItem(USERS_KEY, JSON.stringify(db)); }
function emailKey(e) { return e.toLowerCase().trim(); }

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap session ──────────────────────────────────────────────────────
  useEffect(() => {
    if (IS_CONFIGURED) {
      // Real Firebase — listen to auth state so refresh keeps you logged in
      const unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const profile = {
            uid:      fbUser.uid,
            name:     fbUser.displayName || fbUser.email.split("@")[0],
            email:    fbUser.email,
            provider: "google",
            avatar:   fbUser.photoURL || null,
          };
          setUser(profile);
          localStorage.setItem(CURRENT_KEY, JSON.stringify(profile));
        } else {
          // Check local email/password session
          try {
            const raw    = localStorage.getItem(CURRENT_KEY);
            const stored = raw ? JSON.parse(raw) : null;
            if (stored && stored.provider !== "google") {
              setUser(stored);
            } else {
              setUser(null);
            }
          } catch { setUser(null); }
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      // Mock / email-only — restore from localStorage
      try {
        const raw = localStorage.getItem(CURRENT_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch { localStorage.removeItem(CURRENT_KEY); }
      setLoading(false);
    }
  }, []);

  function persist(profile) {
    setUser(profile);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(profile));
  }

  // ── Register (email + password) ──────────────────────────────────────────
  const register = async ({ name, email, password }) => {
    const db  = getDb();
    const key = emailKey(email);
    if (db[key]) throw new Error("An account with this email already exists.");
    const profile = { uid: crypto.randomUUID(), name: name.trim(), email: key, provider: "email" };
    db[key] = { ...profile, password };
    saveDb(db);
    persist(profile);
    return profile;
  };

  // ── Sign in (email + password) ───────────────────────────────────────────
  const loginWithEmail = async ({ email, password }) => {
    const db  = getDb();
    const key = emailKey(email);
    const rec = db[key];
    if (!rec)              throw new Error("No account found with that email. Please register.");
    if (rec.password !== password) throw new Error("Incorrect password.");
    const profile = { uid: rec.uid, name: rec.name, email: rec.email, provider: "email" };
    persist(profile);
    return profile;
  };

  // ── Google Sign-In ───────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    const result     = await signInWithPopup(auth, provider);
    const fbUser     = result.user;
    const profile    = {
      uid:      fbUser.uid,
      name:     fbUser.displayName || fbUser.email.split("@")[0],
      email:    fbUser.email,
      provider: "google",
      avatar:   fbUser.photoURL || null,
    };
    persist(profile);
    return profile;
  };

  // ── Rename / update display name ─────────────────────────────────────────
  const updateDisplayName = (newName) => {
    if (!user) return;
    const updated = { ...user, name: newName.trim() };
    persist(updated);
    const db  = getDb();
    const key = emailKey(user.email);
    if (db[key]) { db[key].name = newName.trim(); saveDb(db); }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    if (IS_CONFIGURED && user?.provider === "google") {
      try { await signOut(auth); } catch { /* ignore */ }
    }
    setUser(null);
    localStorage.removeItem(CURRENT_KEY);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isFirebaseConfigured: IS_CONFIGURED,
    register,
    loginWithEmail,
    loginWithGoogle,
    updateDisplayName,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
