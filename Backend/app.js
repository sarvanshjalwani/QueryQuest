const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const session = require("express-session");
const crypto = require("crypto");
const schema = require("./schema");
const {
    assertReadOnlySelect,
    buildPlaygroundDatabase,
    closeDatabase,
    runPlaygroundQuery,
} = require("./playgroundSandbox");
const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const sessionSecret = process.env.SESSION_SECRET
    || (process.env.NODE_ENV === "production" ? null : crypto.randomBytes(32).toString("hex"));
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be configured outside development.");
}
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Origin is not allowed by CORS."));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: "256kb" }));
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
    }
}));
const sessionDBs = new Map();
const playgroundDBs = new Map();
const PLAYGROUND_SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_PLAYGROUND_SESSIONS = 100;

async function closePlaygroundEntry(sessionId) {
    const entry = playgroundDBs.get(sessionId);
    if (!entry) return;
    playgroundDBs.delete(sessionId);
    entry.db.interrupt();
    await closeDatabase(entry.db);
}

async function prunePlaygroundDatabases() {
    const expirationTime = Date.now() - PLAYGROUND_SESSION_TTL_MS;
    const expiredIds = [...playgroundDBs.entries()]
        .filter(([, entry]) => entry.lastUsedAt < expirationTime)
        .map(([sessionId]) => sessionId);

    await Promise.all(expiredIds.map((sessionId) => closePlaygroundEntry(sessionId)));
}

async function makeRoomForPlaygroundDatabase(sessionId) {
    await prunePlaygroundDatabases();
    if (playgroundDBs.has(sessionId) || playgroundDBs.size < MAX_PLAYGROUND_SESSIONS) return;

    const oldestSessionId = [...playgroundDBs.entries()]
        .sort(([, first], [, second]) => first.lastUsedAt - second.lastUsedAt)[0][0];
    await closePlaygroundEntry(oldestSessionId);
}

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
                            db.run("PRAGMA query_only = ON", (queryOnlyError) => {
                                if (queryOnlyError) {
                                    reject(queryOnlyError);
                                    return;
                                }
                                db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
                                    if (!err && row) {
                                        console.log(`[Session ${sessionId}] Verification: ${row.count} users in database`);
                                    }
                                });
                                resolve(db);
                            });
                        }
                    }
                });
            });
        });
    });
}
function isSafeQuery(query) {
    try {
        assertReadOnlySelect(query);
        return true;
    } catch {
        return false;
    }
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
        await runStatement(db, "PRAGMA query_only = ON");
        return db;
    } catch (err) {
        await new Promise((resolve) => db.close(resolve));
        throw err;
    }
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

app.post("/playground/setup", async (req, res) => {
    let candidateDatabase = null;
    try {
        const { schemaSql, dataSql = "" } = req.body;
        const { db, tables, insertedRows } = await buildPlaygroundDatabase(schemaSql, dataSql);
        candidateDatabase = db;

        await makeRoomForPlaygroundDatabase(req.sessionID);
        const previousEntry = playgroundDBs.get(req.sessionID);
        playgroundDBs.set(req.sessionID, { db, lastUsedAt: Date.now() });
        candidateDatabase = null;
        if (previousEntry) {
            previousEntry.db.interrupt();
            await closeDatabase(previousEntry.db);
        }

        res.json({ ready: true, tables, insertedRows });
    } catch (error) {
        if (candidateDatabase) await closeDatabase(candidateDatabase);
        res.status(400).json({ error: error.message || "Unable to build the playground database." });
    }
});

app.post("/playground/query", async (req, res) => {
    try {
        await prunePlaygroundDatabases();
        const entry = playgroundDBs.get(req.sessionID);
        if (!entry) {
            return res.status(409).json({ error: "Build your sandbox before running a query." });
        }
        entry.lastUsedAt = Date.now();
        const rows = await runPlaygroundQuery(entry.db, req.body.query);
        res.json({ rows });
    } catch (error) {
        res.status(400).json({ error: error.message || "Unable to run this query." });
    }
});

app.post("/playground/reset", async (req, res) => {
    try {
        await closePlaygroundEntry(req.sessionID);
        res.json({ reset: true });
    } catch (error) {
        res.status(500).json({ error: error.message || "Unable to reset the playground database." });
    }
});

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

        let expectedRows = null;
        if (expected) {
            console.log("Executing expected answer query:", expected);
            expectedRows = await runPlaygroundQuery(db, expected);
            console.log(`Expected answer returned ${expectedRows.length} rows`);
        }

        console.log("Executing query:", query);
        const rows = await runPlaygroundQuery(db, query);
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