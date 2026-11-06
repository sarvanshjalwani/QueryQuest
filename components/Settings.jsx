import { useEffect, useState } from "react";
import { useAuth } from "../src/contexts/auth-context";
import "./UserPages.css";

export default function Settings() {
  const { profile, profileLoading, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setEditorTheme(profile.editor_theme ?? "vs-dark");
    setFontSize(profile.editor_font_size ?? 14);
  }, [profile]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");
    try {
      await updateProfile({
        display_name: displayName.trim(),
        editor_theme: editorTheme,
        editor_font_size: Number(fontSize),
      });
      setMessage("Settings saved.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="user-page">
      <header className="user-page-header">
        <p className="user-eyebrow">MAKE IT YOURS</p>
        <h1>Settings</h1>
        <p>Update your profile and SQL editor preferences.</p>
      </header>
      <section className="user-panel settings-panel">
        {profileLoading ? <p>Loading settings...</p> : !profile ? (
          <p className="user-error" role="alert">
            Profile settings are unavailable. Check that the Supabase setup script has been applied.
          </p>
        ) : (
          <form className="settings-form" onSubmit={handleSubmit}>
            <label>
              Display name
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={60}
                required
              />
            </label>
            <label>
              SQL editor theme
              <select value={editorTheme} onChange={(event) => setEditorTheme(event.target.value)}>
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
            <label>
              SQL editor font size
              <select value={fontSize} onChange={(event) => setFontSize(event.target.value)}>
                {[12, 14, 16, 18, 20].map((size) => <option key={size} value={size}>{size}px</option>)}
              </select>
            </label>
            {message && <p className="user-success" role="status">{message}</p>}
            {errorMessage && <p className="user-error" role="alert">{errorMessage}</p>}
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save settings"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
