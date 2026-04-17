import { NavLink } from "react-router-dom";
import { useUnifiedAuth } from "../utils/useUnifiedAuth.js";

export default function SidebarNavigation() {
  const { isAuthenticated, loginWithRedirect, logout, user, isDemoMode } = useUnifiedAuth();

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <div className="brand-icon">TL</div>
        <div>
          <h1 className="brand-title">Text-to-Learn</h1>
          <div className="brand-subtitle">Courses from a single prompt</div>
        </div>
      </div>

      <NavLink className="nav-link" to="/">
        Home <span>+</span>
      </NavLink>

      <img
        className="sidebar-image"
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
        alt="Students collaborating around a laptop"
      />

      <p className="sidebar-note">
        Generate modules, lessons, quizzes, video suggestions, Hinglish narration, and PDFs.
      </p>

      {isAuthenticated ? (
        <>
          <p className="sidebar-note">Signed in as {user?.name || user?.email}</p>
          {isDemoMode && <p className="sidebar-note">Demo auth is active until Auth0 keys are added.</p>}
          <button
            className="auth-button secondary"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Sign out
          </button>
        </>
      ) : (
        <button className="auth-button primary" onClick={() => loginWithRedirect()}>
          Sign in
        </button>
      )}
    </aside>
  );
}
