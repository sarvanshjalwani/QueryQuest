import { useState, useRef } from "react";
import "./QuestionRun.css";
import questions from "../src/questions";

export default function QuestionRun({ selectedQuestion, handleBackToList }) {
    const inp = useRef();
    const [correct, setCorrect] = useState(null);
    const [selected, setSelected] = useState(selectedQuestion);
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    function onClick() {
        const nextQuestion = questions.find((q) => q.id === selected.id + 1);
        if (nextQuestion) {
            setSelected(nextQuestion);
            setQuery("");
            setResult(null);
            setCorrect(null);
        }
    }

    const lineCount = Math.max(query.split("\n").length, 8);
    const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

    const difficultyClass =
        selected.difficulty?.toLowerCase() === "easy"
            ? "badge-easy"
            : selected.difficulty?.toLowerCase() === "hard"
                ? "badge-hard"
                : "badge-medium";

    async function handleSubmit() {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/req", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query,
                    expected: selectedQuestion.expectedAnswer,
                }),
            });
            const data = await response.json();
            setCorrect(data.correct);
            setResult(data.rows ?? []);
        } catch (err) {
            console.error(err);
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
                            <span className="qr-panel-tab">Problem</span>
                        </div>
                        <div className="qr-panel-body">
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
                    </div>

                    {/* RIGHT — Editor */}
                    <div className="qr-panel-right">
                        <div className="qr-editor-header">
                            <span className="qr-editor-lang">SQL</span>
                            <span className="qr-editor-hint">Write your query below</span>
                        </div>

                        <div className="qr-editor-area">
                            <div className="qr-editor-gutter">
                                <div className="qr-line-numbers">
                                    {lines.map((n) => <span key={n}>{n}</span>)}
                                </div>
                                <textarea
                                    ref={inp}
                                    className="qr-sql-input"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="SELECT ..."
                                    spellCheck={false}
                                />
                            </div>
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