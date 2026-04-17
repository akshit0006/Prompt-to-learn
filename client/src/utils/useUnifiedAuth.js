import { createContext, useContext } from "react";

export const UnifiedAuthContext = createContext(null);

export const useUnifiedAuth = () =>
  useContext(UnifiedAuthContext) || {
    isAuthenticated: true,
    isLoading: false,
    user: {
      name: "Demo Learner",
      email: "demo@text-to-learn.local"
    },
    loginWithRedirect: () => Promise.resolve(),
    logout: () => undefined,
    getAccessTokenSilently: async () => null,
    isDemoMode: true
  };
