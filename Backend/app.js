const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const session = require("express-session");
const schema = require("./schema");
const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'sql-sandbox-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
const sessionDBs = new Map();
app.get("/check-session", (req, res) => {
    res.json(req.session);
});
async function createSandboxDB(sessionId) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(":memory:");
        let lastError = null;
        let queriesCompleted = 0;
        const totalQueries = schema.length;
        db.serialize(() => {
            schema.forEach((query, index) => {
                db.run(query, (err) => {
                    if (err) {
                        console.error(`[Session ${sessionId}] Error in schema query ${index}:`, err.message);
                        lastError = err;
                    } else {
                        console.log(`[Session ${sessionId}] ✓ Schema query ${index} executed`);
                    }
                    queriesCompleted++;
                    if (queriesCompleted === totalQueries) {
                        if (lastError) {
                            reject(lastError);
                        } else {
                            db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
                                if (!err && row) {
                                    console.log(`[Session ${sessionId}] Verification: ${row.count} users in database`);
                                }
                            });
                            resolve(db);
                        }
                    }
                });
            });
        });
    });
}
function isSafeQuery(query) {
    if (!query || typeof query !== 'string') return false;
    const q = query.trim().toUpperCase();
    return q.startsWith("SELECT");
}
function normalizeRows(rows) {
    return rows
        .map(row => JSON.stringify(row))
        .sort();
}
function resultsEqual(actual, expectedRows) {
    if (!Array.isArray(actual) || !Array.isArray(expectedRows)) return false;
    if (actual.length !== expectedRows.length) return false;
    const actualNorm = normalizeRows(actual);
    const expectedNorm = normalizeRows(expectedRows);
    return actualNorm.every((value, index) => value === expectedNorm[index]);
}

app.post("/req", async (req, res) => {
    const { query, expected } = req.body;
    console.log("=".repeat(50));
    console.log(`Session ID: ${req.session.id}`);
    console.log("Query:", query);
    if (!query) {
        return res.status(400).json({ error: "Query required" });
    }
    if (!isSafeQuery(query)) {
        console.log("Error: Unsafe query rejected -", query);
        return res.status(403).json({
            error: "Only SELECT queries are allowed. Your query: " + query
        });
    }
    if (expected && !isSafeQuery(expected)) {
        console.log("Error: Unsafe expected query rejected -", expected);
        return res.status(403).json({
            error: "Only SELECT queries are allowed for expected answer queries."
        });
    }
    try {
        let db = sessionDBs.get(req.session.id);

        if (!db) {
            console.log(`📦 No database found for session ${req.session.id}, creating new one...`);
            db = await createSandboxDB(req.session.id);
            sessionDBs.set(req.session.id, db);
            console.log(`✅ Database stored for session ${req.session.id}`);
        } else {
            console.log(`♻️ Reusing existing database for session ${req.session.id}`);
        }
        let safeQuery = query;
        if (!query.toUpperCase().includes("LIMIT")) {
            safeQuery = query + " LIMIT 100";
        }
        let expectedRows = null;
        if (expected) {
            console.log("Executing expected answer query:", expected);
            expectedRows = await new Promise((resolve, reject) => {
                db.all(expected, [], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            console.log(`Expected answer returned ${expectedRows.length} rows`);
        }
        console.log("Executing query:", safeQuery);
        const rows = await new Promise((resolve, reject) => {
            db.all(safeQuery, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        const isCorrect = expectedRows ? resultsEqual(rows, expectedRows) : null;
        if (expectedRows) {
            if (isCorrect) {
                console.log(`✅ Query successful and output matches expected answer! Returning ${rows.length} rows`);
            } else {
                console.log(`⚠️ Query successful but output does not match expected answer. Returned ${rows.length} rows`);
            }
        } else {
            console.log(`✅ Query successful! Returning ${rows ? rows.length : 0} rows`);
        }

        res.json({ rows: rows || [], correct: isCorrect });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(400).json({ error: err.message });
    }
});
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 SQLite sandbox server running on http://localhost:${PORT}`);
    console.log(`📝 Test query: SELECT * FROM users;`);
});