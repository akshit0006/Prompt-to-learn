import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { UnifiedAuthContext } from "./utils/useUnifiedAuth.js";
import "./index.css";

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const hasAuth0 = Boolean(auth0Domain && auth0ClientId && auth0Audience);

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="boot-screen">
          <div className="message error">
            <strong>Text-to-Learn could not start.</strong>
            <p>{this.state.error.message}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const DemoAuthProvider = ({ children }) => (
  <UnifiedAuthContext.Provider
    value={{
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
    }}
  >
    {children}
  </UnifiedAuthContext.Provider>
);

const Auth0Bridge = ({ children }) => {
  const auth = useAuth0();
  return (
    <UnifiedAuthContext.Provider value={{ ...auth, isDemoMode: false }}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

const AuthProvider = ({ children }) => {
  if (!hasAuth0) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Audience
      }}
      cacheLocation="localstorage"
    >
      <Auth0Bridge>{children}</Auth0Bridge>
    </Auth0Provider>
  );
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  </React.StrictMode>
);
