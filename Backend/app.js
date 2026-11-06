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
    const trimmedQuery = query.trim();
    if (!/^(SELECT|WITH)\b/i.test(trimmedQuery)) return false;
    if (trimmedQuery.replace(/;\s*$/, "").includes(";")) return false;
    return !/\b(INSERT|UPDATE|DELETE|REPLACE|CREATE|DROP|ALTER|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX|ANALYZE)\b/i.test(trimmedQuery);
}
function isValidSetupStatements(statements, statementType) {
    return Array.isArray(statements)
        && statements.length > 0
        && statements.length <= 20
        && statements.every((statement) =>
            typeof statement === "string"
            && statement.length <= 50000
            && new RegExp(`^\\s*${statementType}\\b`, "i").test(statement)
        );
}
function runStatement(db, statement) {
    return new Promise((resolve, reject) => {
        db.run(statement, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
async function createQuestionDB(databaseSchema, testData) {
    const db = new sqlite3.Database(":memory:");
    try {
        for (const statement of databaseSchema) {
            await runStatement(db, statement);
        }
        for (const statement of testData) {
            await runStatement(db, statement);
        }
        return db;
    } catch (err) {
        await new Promise((resolve) => db.close(resolve));
        throw err;
    }
}
function runQuery(db, query) {
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
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
    const { query, expected, databaseSchema, testData } = req.body;
    console.log("=".repeat(50));
    console.log(`Session ID: ${req.session.id}`);
    console.log("Query:", query);
    if (!query) {
        return res.status(400).json({ error: "Query required" });
    }
    if (!isSafeQuery(query)) {
        console.log("Error: Unsafe query rejected -", query);
        return res.status(403).json({
            error: "Only read-only SELECT queries are allowed."
        });
    }
    if (expected && !isSafeQuery(expected)) {
        console.log("Error: Unsafe expected query rejected -", expected);
        return res.status(403).json({
            error: "Only read-only SELECT queries are allowed for expected answers."
        });
    }
    const includesQuestionSetup = databaseSchema !== undefined || testData !== undefined;
    if (includesQuestionSetup
        && (!isValidSetupStatements(databaseSchema, "CREATE\\s+TABLE")
            || !isValidSetupStatements(testData, "INSERT\\s+INTO"))) {
        return res.status(400).json({
            error: "Question database schema and test data must contain valid CREATE TABLE and INSERT INTO statements."
        });
    }

    let questionDb = null;
    try {
        let db;
        if (includesQuestionSetup) {
            questionDb = await createQuestionDB(databaseSchema, testData);
            db = questionDb;
        } else {
            db = sessionDBs.get(req.session.id);
            if (!db) {
                console.log(`📦 No database found for session ${req.session.id}, creating new one...`);
                db = await createSandboxDB(req.session.id);
                sessionDBs.set(req.session.id, db);
                console.log(`✅ Database stored for session ${req.session.id}`);
            } else {
                console.log(`♻️ Reusing existing database for session ${req.session.id}`);
            }
        }

        let safeQuery = query;
        if (!/\bLIMIT\b/i.test(query)) {
            safeQuery = `${query.trim().replace(/;\s*$/, "")} LIMIT 100`;
        }

        let expectedRows = null;
        if (expected) {
            console.log("Executing expected answer query:", expected);
            expectedRows = await runQuery(db, expected);
            console.log(`Expected answer returned ${expectedRows.length} rows`);
        }

        console.log("Executing query:", safeQuery);
        const rows = await runQuery(db, safeQuery);
        const isCorrect = expectedRows ? resultsEqual(rows, expectedRows) : null;
        if (expectedRows) {
            if (isCorrect) {
                console.log(`✅ Query successful and output matches expected answer! Returning ${rows.length} rows`);
            } else {
                console.log(`⚠️ Query successful but output does not match expected answer. Returned ${rows.length} rows`);
            }
        } else {
            console.log(`✅ Query successful! Returning ${rows.length} rows`);
        }

        res.json({ rows: rows || [], correct: isCorrect });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(400).json({ error: err.message });
    } finally {
        if (questionDb) {
            await new Promise((resolve) => questionDb.close(resolve));
        }
    }
});
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`🚀 SQLite sandbox server running on http://localhost:${PORT}`);
    console.log(`📝 Test query: SELECT * FROM users;`);
});