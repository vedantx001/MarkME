import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMeApi, loginApi, logoutApi } from "../api/auth.api";
import { clearAuthTokens, storeAuthTokens } from "../api/http";

const AuthContext = createContext(null);

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = user?.role || null;
  const isAuthenticated = !!user;

  const hydrateFromStorage = () => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const parsed = safeJsonParse(storedUser, null);
      if (parsed) setUser(parsed);
    }
  };

  const clearSession = () => {
    setUser(null);
    clearAuthTokens();
    localStorage.removeItem("authUser");
  };

  const refreshProfile = async () => {
    const me = await getMeApi();
    // server returns { success, data }
    const profile = me?.data || null;
    if (profile) {
      const school =
        profile.schoolId && typeof profile.schoolId === 'object'
          ? {
              id: profile.schoolId._id || profile.schoolId.id,
              name: profile.schoolId.name,
              schoolIdx: profile.schoolId.schoolIdx,
            }
          : null;

      const nextUser = {
        id: profile._id || profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        schoolId: typeof profile.schoolId === 'string' ? profile.schoolId : school?.id,
        school,
      };
      setUser(nextUser);
      localStorage.setItem("authUser", JSON.stringify(nextUser));
      return nextUser;
    }
    return null;
  };

  // Bootstraps auth on app load.
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        hydrateFromStorage();
        // Validate token / refresh user. If token is expired, http layer will attempt refresh-token.
        const me = await refreshProfile();
        if (!alive) return;
        if (!me) clearSession();
      } catch {
        if (!alive) return;
        clearSession();
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    const data = await loginApi({ email, password });
    const nextUser = data?.user || null;

    // Ensure we always end up with the same enriched shape as refreshProfile()
    // (especially embedded school info used by AdminHeader / dashboard).
    if (nextUser) {
      setUser(nextUser);
      localStorage.setItem("authUser", JSON.stringify(nextUser));

      try {
        const enriched = await refreshProfile();
        return enriched || nextUser;
      } catch {
        return nextUser;
      }
    }

    return null;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      clearSession();
    }
  };

  const setTokenManually = (token) => {
    // For rare cases where something else gives you a token.
    if (token) storeAuthTokens({ accessToken: token });
  };

  const value = useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      loading,
      login,
      logout,
      refreshProfile,
      setTokenManually,
      clearSession,
    }),
    [user, role, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
