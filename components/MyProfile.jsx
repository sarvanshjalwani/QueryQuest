import { useAuth } from "../src/contexts/auth-context";
import "./UserPages.css";

export default function MyProfile() {
  const { user, profile, profileLoading } = useAuth();

  return (
    <main className="user-page">
      <header className="user-page-header">
        <p className="user-eyebrow">ACCOUNT</p>
        <h1>My Profile</h1>
        <p>Your QueryQuest identity and learning journey.</p>
      </header>
      <section className="user-panel profile-details">
        <div className="profile-avatar-large" aria-hidden="true">
          {(profile?.display_name || user.email || "Q").slice(0, 1).toUpperCase()}
        </div>
        {profileLoading ? <p>Loading profile...</p> : (
          <>
            <h2>{profile?.display_name || "SQL Explorer"}</h2>
            <p>{user.email}</p>
            <dl>
              <div><dt>Member since</dt><dd>{new Date(user.created_at).toLocaleDateString()}</dd></div>
              <div><dt>Account ID</dt><dd>{user.id}</dd></div>
            </dl>
            {!profile && (
              <p className="user-error">
                Your profile record is not available. Check that the Supabase setup script has been applied.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
