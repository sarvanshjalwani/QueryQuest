import React, { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import './Playground.css';

const API_URL = 'http://localhost:5000/playground';
const STARTER_SCHEMA = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE
);`;
const STARTER_DATA = `INSERT INTO users (id, name, email) VALUES
  (1, 'Ada Lovelace', 'ada@example.com'),
  (2, 'Grace Hopper', 'grace@example.com');`;

async function requestPlayground(path, body) {
  const response = await fetch(`${API_URL}/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

const Playground = () => {
  const [schemaSql, setSchemaSql] = useState(STARTER_SCHEMA);
  const [dataSql, setDataSql] = useState(STARTER_DATA);
  const [query, setQuery] = useState('SELECT * FROM users;');
  const [builtSql, setBuiltSql] = useState(null);
  const [tables, setTables] = useState([]);
  const [insertedRows, setInsertedRows] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [building, setBuilding] = useState(false);
  const [running, setRunning] = useState(false);
  const [resetting, setResetting] = useState(false);

  const sandboxReady = builtSql !== null;
  const sandboxIsDirty = useMemo(
    () => sandboxReady && (builtSql.schemaSql !== schemaSql || builtSql.dataSql !== dataSql),
    [builtSql, dataSql, sandboxReady, schemaSql],
  );

  const buildSandbox = async () => {
    setBuilding(true);
    setError('');
    setStatus('');
    setResults(null);
    try {
      const data = await requestPlayground('setup', { schemaSql, dataSql });
      setBuiltSql({ schemaSql, dataSql });
      setTables(data.tables);
      setInsertedRows(data.insertedRows);
      setStatus(`Sandbox ready: ${data.tables.length} table${data.tables.length === 1 ? '' : 's'}, ${data.insertedRows} sample row${data.insertedRows === 1 ? '' : 's'}.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to build the sandbox.');
    } finally {
      setBuilding(false);
    }
  };

  const runQuery = async () => {
    setRunning(true);
    setError('');
    setStatus('');
    setResults(null);
    try {
      const data = await requestPlayground('query', { query });
      setResults(data.rows);
      setStatus(`${data.rows.length} row${data.rows.length === 1 ? '' : 's'} returned.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to run the query.');
    } finally {
      setRunning(false);
    }
  };

  const resetSandbox = async () => {
    setResetting(true);
    setError('');
    setStatus('');
    setResults(null);
    try {
      await requestPlayground('reset', {});
      setBuiltSql(null);
      setTables([]);
      setInsertedRows(0);
      setStatus('Sandbox reset. Build it again when you are ready.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset the sandbox.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="playground-container">
      <header className="playground-header">
        <p className="playground-eyebrow">QUERYQUEST / SQL LAB</p>
        <h1>Playground Mode</h1>
        <p className="playground-intro">
          Design your own schema, add optional sample data, then explore it with free-form read-only queries.
          Your in-memory sandbox is private to this browser session.
        </p>
      </header>

      <section className="playground-setup" aria-labelledby="setup-heading">
        <div className="playground-section-heading">
          <div>
            <span className="playground-step">01 / SET UP</span>
            <h2 id="setup-heading">Build your database</h2>
          </div>
          {sandboxReady && (
            <span className={`playground-ready${sandboxIsDirty ? ' is-dirty' : ''}`}>
              {sandboxIsDirty ? 'Needs rebuild' : 'Sandbox ready'}
            </span>
          )}
        </div>

        <div className="playground-editor-grid">
          <label className="playground-editor-card">
            <span className="playground-editor-title">Schema SQL <small>CREATE TABLE</small></span>
            <div className="playground-editor">
              <Editor
                height="280px"
                language="sql"
                theme="vs-dark"
                value={schemaSql}
                onChange={(value) => setSchemaSql(value ?? '')}
                options={{
                  ariaLabel: 'Schema SQL editor',
                  automaticLayout: true,
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>
          </label>

          <label className="playground-editor-card">
            <span className="playground-editor-title">Sample data <small>OPTIONAL / INSERT INTO</small></span>
            <div className="playground-editor">
              <Editor
                height="280px"
                language="sql"
                theme="vs-dark"
                value={dataSql}
                onChange={(value) => setDataSql(value ?? '')}
                options={{
                  ariaLabel: 'Sample data SQL editor',
                  automaticLayout: true,
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>
          </label>
        </div>

        <div className="playground-setup-actions">
          <p>
            Up to 10 tables, 50 columns per table, and 1,000 sample rows. Schema SQL is limited to 50 KB;
            sample data SQL to 100 KB. Building again replaces your sandbox.
          </p>
          <div>
            <button type="button" className="playground-button secondary" onClick={resetSandbox} disabled={resetting || building}>
              {resetting ? 'Resetting...' : 'Reset sandbox'}
            </button>
            <button type="button" className="playground-button primary" onClick={buildSandbox} disabled={building || running || resetting}>
              {building ? 'Building...' : 'Build sandbox'}
            </button>
          </div>
        </div>

        {sandboxReady && !sandboxIsDirty && (
          <div className="playground-table-list" aria-label="Sandbox tables">
            {tables.map((table) => <span key={table}>{table}</span>)}
            <span>{insertedRows} sample rows</span>
          </div>
        )}
      </section>

      <section className="playground-query" aria-labelledby="query-heading">
        <div className="playground-section-heading">
          <div>
            <span className="playground-step">02 / EXPLORE</span>
            <h2 id="query-heading">Run a query</h2>
          </div>
          <span className="playground-readonly">READ ONLY · SELECT</span>
        </div>
        <div className="playground-editor query-editor">
          <Editor
            height="220px"
            language="sql"
            theme="vs-dark"
            value={query}
            onChange={(value) => setQuery(value ?? '')}
            options={{
              ariaLabel: 'Free-form SQL query editor',
              automaticLayout: true,
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </div>
        <div className="playground-query-actions">
          <p>{sandboxIsDirty ? 'Rebuild the sandbox to apply schema or sample-data edits.' : 'Queries are limited to 100 rows and 1 second.'}</p>
          <button
            type="button"
            className="playground-button primary"
            onClick={runQuery}
            disabled={!sandboxReady || sandboxIsDirty || running || building || resetting}
          >
            {running ? 'Running...' : 'Run query'}
          </button>
        </div>
      </section>

      {(status || error) && (
        <p className={`playground-message${error ? ' error' : ''}`} role={error ? 'alert' : 'status'}>
          {error || status}
        </p>
      )}

      {results !== null && (
        <section className="playground-results" aria-labelledby="results-heading">
          <div className="playground-section-heading">
            <div>
              <span className="playground-step">03 / RESULTS</span>
              <h2 id="results-heading">Query output</h2>
            </div>
            <span className="playground-readonly">{results.length} ROWS</span>
          </div>
          {results.length === 0 ? (
            <p className="playground-empty-results">The query returned no rows.</p>
          ) : (
            <div className="playground-results-scroll">
              <table className="playground-results-table">
                <thead>
                  <tr>{Object.keys(results[0]).map((column) => <th key={column}>{column}</th>)}</tr>
                </thead>
                <tbody>
                  {results.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, columnIndex) => (
                        <td key={columnIndex}>{String(value ?? 'NULL')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default Playground;
