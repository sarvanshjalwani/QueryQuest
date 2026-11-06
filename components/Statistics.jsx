import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../src/contexts/auth-context";
import { supabase } from "../src/lib/supabase";
import "./UserPages.css";

export default function Statistics() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [difficultyStats, setDifficultyStats] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStatistics() {
      try {
        const [summaryResult, difficultyResult, recentResult] = await Promise.all([
          supabase.from("user_statistics").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("difficulty_statistics").select("*").eq("user_id", user.id),
          supabase
            .from("query_attempts")
            .select("id, question_title, difficulty, is_correct, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        const failed = [summaryResult, difficultyResult, recentResult].find((result) => result.error);
        if (failed) throw failed.error;
        if (!active) return;

        setSummary(summaryResult.data);
        setDifficultyStats(difficultyResult.data ?? []);
        setRecentAttempts(recentResult.data ?? []);
      } catch (error) {
        if (active) setErrorMessage(error.message || "Unable to load statistics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStatistics();
    return () => { active = false; };
  }, [user.id]);

  if (loading) return <main className="user-page"><p>Loading statistics...</p></main>;

  return (
    <main className="user-page">
      <header className="user-page-header">
        <p className="user-eyebrow">YOUR PROGRESS</p>
        <h1>Statistics</h1>
        <p>Every attempt brings you closer to mastering SQL.</p>
      </header>

      {errorMessage ? (
        <p className="user-error" role="alert">{errorMessage}</p>
      ) : (
        <>
          <section className="user-stat-grid" aria-label="Overall statistics">
            <article className="user-stat-card"><span>Attempts</span><strong>{summary?.total_attempts ?? 0}</strong></article>
            <article className="user-stat-card"><span>Correct</span><strong>{summary?.correct_attempts ?? 0}</strong></article>
            <article className="user-stat-card"><span>Questions solved</span><strong>{summary?.solved_questions ?? 0}</strong></article>
            <article className="user-stat-card"><span>Accuracy</span><strong>{summary?.accuracy_percent ?? 0}%</strong></article>
          </section>

          <section className="user-panel">
            <h2>By difficulty</h2>
            {difficultyStats.length === 0 ? (
              <p className="user-empty">Run a practice query to start building your statistics.</p>
            ) : (
              <div className="difficulty-stat-list">
                {difficultyStats.map((item) => (
                  <div className="difficulty-stat-row" key={item.difficulty}>
                    <span>{item.difficulty}</span>
                    <span>{item.correct_attempts} / {item.total_attempts} correct</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="user-panel">
            <h2>Recent attempts</h2>
            {recentAttempts.length === 0 ? (
              <p className="user-empty">No attempts yet. <Link to="/practice">Start practising</Link>.</p>
            ) : (
              <div className="attempt-list">
                {recentAttempts.map((attempt) => (
                  <article className="attempt-row" key={attempt.id}>
                    <div>
                      <strong>{attempt.question_title}</strong>
                      <span>{attempt.difficulty} · {new Date(attempt.created_at).toLocaleString()}</span>
                    </div>
                    <span className={attempt.is_correct ? "attempt-correct" : "attempt-incorrect"}>
                      {attempt.is_correct ? "Correct" : "Incorrect"}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
