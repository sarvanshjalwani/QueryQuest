import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../src/contexts/auth-context";
import "./Account.css";

export default function Account() {
  const { isSupabaseConfigured, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || "/profile";
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setSubmitting(true);

    try {
      if (mode === "sign-in") {
        await signIn(email, password);
        navigate(destination, { replace: true });
      } else {
        const data = await signUp(email, password, displayName.trim());
        if (data.session) {
          navigate(destination, { replace: true });
        } else {
          setMessage("Check your email to confirm your account, then sign in.");
          setMode("sign-in");
        }
      }
    } catch (error) {
      setErrorMessage(error.message || "Unable to access your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <p className="account-eyebrow">QUERYQUEST ACCOUNT</p>
        <h1>{mode === "sign-in" ? "Welcome back" : "Create your account"}</h1>
        <p className="account-subtitle">Save your SQL progress and preferences.</p>

        {!isSupabaseConfigured ? (
          <div className="account-notice" role="alert">
            Supabase is not configured. Add <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> to a root <code>.env.local</code> file,
            then restart the development server.
          </div>
        ) : (
          <form className="account-form" onSubmit={handleSubmit}>
            {mode === "sign-up" && (
              <label>
                Display name
                <input
                  autoComplete="name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  maxLength={60}
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </label>
            {message && <p className="account-message" role="status">{message}</p>}
            {errorMessage && <p className="account-error" role="alert">{errorMessage}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>
        )}

        {isSupabaseConfigured && (
          <button
            className="account-mode-toggle"
            type="button"
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setMessage("");
              setErrorMessage("");
            }}
          >
            {mode === "sign-in" ? "New here? Create an account" : "Already registered? Sign in"}
          </button>
        )}
        <Link className="account-home-link" to="/">Back to QueryQuest</Link>
      </section>
    </main>
  );
}
