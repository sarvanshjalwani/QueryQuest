import { useState } from "react";
import Editor from "@monaco-editor/react";
import "./QuestionRun.css";
import { useAuth } from "../src/contexts/auth-context";
import { markQuestionSolved, saveAttempt } from "../src/lib/attempts";

export default function QuestionRun({ selectedQuestion, questions, handleBackToList, onQuestionSolved }) {
    const { user, profile } = useAuth();
    const [correct, setCorrect] = useState(null);
    const [selected, setSelected] = useState(selectedQuestion);
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [problemPanel, setProblemPanel] = useState("problem");

    function onClick() {
        const selectedIndex = questions.findIndex((question) => question.id === selected.id);
        if (selectedIndex < 0) return;

        const nextQuestion = questions[selectedIndex + 1];
        if (nextQuestion) {
            setSelected(nextQuestion);
            setQuery("");
            setResult(null);
            setCorrect(null);
            setSaveError("");
            setProblemPanel("problem");
        }
    }

    const difficultyClass =
        selected.difficulty?.toLowerCase() === "easy"
            ? "badge-easy"
            : selected.difficulty?.toLowerCase() === "hard"
                ? "badge-hard"
                : "badge-medium";

    async function handleSubmit() {
        setLoading(true);
        setSaveError("");
        try {
            const response = await fetch("http://localhost:5000/req", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query,
                    expected: selected.expectedAnswer,
                    databaseSchema: selected.databaseSchema,
                    testData: selected.testData,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }
            setCorrect(data.correct);
            setResult(data.rows ?? []);
            if (data.correct) {
                try {
                    await markQuestionSolved(user?.id, selected);
                    onQuestionSolved?.(selected.id);
                } catch (error) {
                    setSaveError(`Correct answer, but solved status could not be saved: ${error.message}`);
                }
            }
            if (user) {
                try {
                    await saveAttempt({
                        userId: user.id,
                        question: selected,
                        correct: Boolean(data.correct),
                    });
                } catch (error) {
                    setSaveError(`Query ran, but its result could not be saved: ${error.message}`);
                }
            }
        } catch (err) {
            setSaveError(err.message || "Unable to run this query.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="question-run">
            {/* Top bar */}
            <div className="qr-topbar">
                <button className="qr-back-btn" onClick={handleBackToList}>Back</button>
                <div className="qr-breadcrumb">
                    <span>Problems</span>
                    <span className="qr-breadcrumb-sep">/</span>
                    <span className="qr-breadcrumb-current">{selected.title}</span>
                </div>
                <span className={`qr-difficulty-badge ${difficultyClass}`}>
                    {selected.difficulty}
                </span>
            </div>

            {/* Main content wrapper */}
            <div className="qr-content-wrapper">
                {/* Top section: Question + Editor in flex row */}
                <div className="qr-top-section">
                    {/* LEFT — Problem */}
                    <div className="qr-panel-left">
                        <div className="qr-panel-header">
                            <div className="qr-panel-tabs" role="tablist" aria-label="Question resources">
                                <button
                                    className={`qr-panel-tab${problemPanel === "problem" ? " active" : ""}`}
                                    id="question-tab"
                                    type="button"
                                    role="tab"
                                    aria-selected={problemPanel === "problem"}
                                    aria-controls="question-panel"
                                    onClick={() => setProblemPanel("problem")}
                                >
                                    Problem
                                </button>
                                <button
                                    className={`qr-panel-tab${problemPanel === "schema" ? " active" : ""}`}
                                    id="schema-tab"
                                    type="button"
                                    role="tab"
                                    aria-selected={problemPanel === "schema"}
                                    aria-controls="schema-panel"
                                    onClick={() => setProblemPanel("schema")}
                                >
                                    Schema
                                </button>
                            </div>
                        </div>
                        {problemPanel === "problem" ? (
                            <div className="qr-panel-body" id="question-panel" role="tabpanel" aria-labelledby="question-tab">
                                <h2 className="qr-problem-title">{selected.title}</h2>
                                <div className="qr-divider" />
                                <p className="qr-problem-body">{selected.question}</p>
                                {selected.testCase && (
                                    <>
                                        <div className="qr-testcase-label">Expected Output</div>
                                        <div className="qr-testcase-block">{selected.testCase}</div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="qr-panel-body" id="schema-panel" role="tabpanel" aria-labelledby="schema-tab">
                                <h2 className="qr-problem-title">Database Schema</h2>
                                <div className="qr-divider" />
                                {selected.databaseSchema?.length ? (
                                    <pre className="qr-schema-block">{selected.databaseSchema.join("\n\n")}</pre>
                                ) : (
                                    <p className="qr-problem-body">No schema is provided for this question.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT — Editor */}
                    <div className="qr-panel-right">
                        <div className="qr-editor-header">
                            <span className="qr-editor-lang">SQL</span>
                            <span className="qr-editor-hint">Write your query below</span>
                        </div>

                        <div className="qr-editor-area">
                            <Editor
                                className="qr-monaco-editor"
                                height="100%"
                                language="sql"
                                theme={profile?.editor_theme ?? "vs-dark"}
                                value={query}
                                onChange={(value) => setQuery(value ?? "")}
                                options={{
                                    ariaLabel: "SQL query editor",
                                    automaticLayout: true,
                                    fontFamily: "'Courier Prime', 'Courier New', monospace",
                                    fontSize: profile?.editor_font_size ?? 14,
                                    lineHeight: 28,
                                    minimap: { enabled: false },
                                    padding: { top: 8, bottom: 8 },
                                    scrollBeyondLastLine: false,
                                    tabSize: 2,
                                    wordWrap: "on",
                                }}
                            />
                        </div>

                        {/* Action bar */}
                        <div className="qr-action-bar">
                            <div className="qr-status">
                                <span className={`qr-status-dot ${query.trim() ? "ready" : ""}`} />
                                {loading ? "Executing..." : query.trim() ? "Ready" : "Awaiting input"}
                            </div>
                            <button className="btn-next" onClick={onClick}>Next →</button>
                            <button className="btn-run" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Running..." : "Run Query"}
                            </button>
                        </div>
                        {saveError && <p className="qr-save-error" role="alert">{saveError}</p>}
                    </div>
                </div>

                {/* Bottom section: Output with 100% width */}
                {result !== null && (
                    <div className="qr-output-section">
                        <div className="qr-results">
                            <div className="qr-results-header">
                                <span className="qr-results-tab">Output</span>
                                <span className={`qr-verdict ${correct ? "verdict-correct" : "verdict-wrong"}`}>
                                    {correct ? "✓ Correct" : "✗ Incorrect"}
                                </span>
                                <span className="qr-row-count">
                                    {result.length} row{result.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="qr-table-scroll">
                                {result.length === 0 ? (
                                    <p className="qr-no-rows">— No rows returned —</p>
                                ) : (
                                    <table className="qr-result-table">
                                        <thead>
                                            <tr>
                                                {Object.keys(result[0]).map((col) => (
                                                    <th key={col}>{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.map((row, i) => (
                                                <tr key={i}>
                                                    {Object.values(row).map((val, j) => (
                                                        <td key={j}>{String(val ?? "NULL")}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}