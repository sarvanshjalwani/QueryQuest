const sqlite3 = require("sqlite3").verbose();
const { Parser } = require("node-sql-parser");

const parser = new Parser();
const MAX_SCHEMA_BYTES = 50_000;
const MAX_DATA_BYTES = 100_000;
const MAX_STATEMENT_BYTES = 10_000;
const MAX_TABLES = 10;
const MAX_COLUMNS_PER_TABLE = 50;
const MAX_INSERTS = 100;
const MAX_INSERT_ROWS = 1_000;
const MAX_QUERY_BYTES = 10_000;
const MAX_QUERY_TIME_MS = 1_000;
const MAX_RESULT_ROWS = 100;
const MAX_RESULT_BYTES = 1_000_000;
const FORBIDDEN_FUNCTIONS = new Set([
  "load_extension",
  "readfile",
  "writefile",
  "fts3_tokenizer",
  "randomblob",
  "zeroblob",
  "printf",
  "format",
  "replace",
]);
const SQL_STATEMENT_TYPES = new Set([
  "select",
  "insert",
  "update",
  "delete",
  "replace",
  "create",
  "alter",
  "drop",
  "truncate",
  "pragma",
  "attach",
  "detach",
  "transaction",
  "begin",
  "commit",
  "rollback",
  "explain",
  "call",
  "exec",
  "set",
]);

function splitSqlStatements(sql) {
  const statements = [];
  let start = 0;
  let quote = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      if (character === "\n" || character === "\r") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (character === quote) {
        if (next === quote && quote !== "]") {
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (character === "-" && next === "-") {
      lineComment = true;
      index += 1;
    } else if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
    } else if (character === "'" || character === '"' || character === "`") {
      quote = character;
    } else if (character === "[") {
      quote = "]";
    } else if (character === ";") {
      const statement = sql.slice(start, index).trim();
      if (statement) statements.push(statement);
      start = index + 1;
    }
  }

  const finalStatement = sql.slice(start).trim();
  if (finalStatement) statements.push(finalStatement);
  return statements;
}

function parseStatement(statement) {
  if (Buffer.byteLength(statement, "utf8") > MAX_STATEMENT_BYTES) {
    throw new Error(`Each SQL statement must be ${MAX_STATEMENT_BYTES} bytes or less.`);
  }

  const parsed = parser.astify(statement, { database: "SQLite" });
  const statements = Array.isArray(parsed) ? parsed : [parsed];
  if (statements.length === 0) return null;
  if (statements.length !== 1) {
    throw new Error("Provide exactly one SQL statement at a time.");
  }
  return statements[0];
}

function parseReadOnlyStatement(statement) {
  if (Buffer.byteLength(statement, "utf8") > MAX_STATEMENT_BYTES) {
    throw new Error(`Each SQL statement must be ${MAX_STATEMENT_BYTES} bytes or less.`);
  }

  let parseError;
  for (const dialect of ["SQLite", "MySQL"]) {
    try {
      const parsed = parser.astify(statement, { database: dialect });
      const statements = Array.isArray(parsed) ? parsed : [parsed];
      if (statements.length === 0) return null;
      if (statements.length !== 1) {
        throw new Error("Provide exactly one SQL statement at a time.");
      }
      return statements[0];
    } catch (error) {
      if (error.message === "Provide exactly one SQL statement at a time.") throw error;
      parseError = error;
    }
  }
  throw parseError;
}

function parseSetupStatements(sql, { label, required, maxBytes, maxStatements }) {
  if (typeof sql !== "string") {
    throw new Error(`${label} must be a SQL string.`);
  }
  if (Buffer.byteLength(sql, "utf8") > maxBytes) {
    throw new Error(`${label} must be ${maxBytes} bytes or less.`);
  }

  const rawStatements = splitSqlStatements(sql);
  if (rawStatements.length > maxStatements) {
    throw new Error(`${label} can contain at most ${maxStatements} statements.`);
  }

  const statements = rawStatements
    .map((statement) => ({ sql: statement, ast: parseStatement(statement) }))
    .filter(({ ast }) => ast !== null);
  if (required && statements.length === 0) {
    throw new Error(`${label} must include at least one statement.`);
  }
  return statements;
}

function validateCreateTable(ast) {
  if (
    ast.type !== "create"
    || ast.keyword !== "table"
    || ast.temporary
    || ast.table?.length !== 1
    || ast.table[0].db
    || ast.table[0].table.toLowerCase().startsWith("sqlite_")
    || ast.table_options
  ) {
    throw new Error("Schema setup accepts ordinary CREATE TABLE statements only.");
  }

  const definitions = ast.create_definitions;
  const columns = definitions?.filter((definition) => definition.resource === "column") ?? [];
  if (
    !Array.isArray(definitions)
    || columns.length === 0
    || columns.length > MAX_COLUMNS_PER_TABLE
    || definitions.some((definition) => !["column", "constraint"].includes(definition.resource))
  ) {
    throw new Error(`Each table must define 1 to ${MAX_COLUMNS_PER_TABLE} columns and may use table constraints.`);
  }
}

function validateInsert(ast) {
  if (
    ast.type !== "insert"
    || (ast.prefix !== undefined && ast.prefix !== "into")
    || ast.table?.length !== 1
    || ast.table[0].db
    || ast.table[0].table.toLowerCase().startsWith("sqlite_")
    || ast.values?.type !== "values"
    || ast.returning
    || ast.on_duplicate_update
  ) {
    throw new Error("Sample data accepts INSERT INTO ... VALUES statements only.");
  }

  const rows = ast.values.values;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Each INSERT statement must include literal VALUES rows.");
  }
  if (rows.some((row) =>
    row.type !== "expr_list"
    || row.value.length === 0
    || row.value.length > MAX_COLUMNS_PER_TABLE
    || row.value.some((value) => !["number", "single_quote_string", "double_quote_string", "null", "bool", "full_hex_string"].includes(value.type))
  )) {
    throw new Error("Sample data values must be literals, with no more than 50 values per row.");
  }
  return rows.length;
}

function runStatement(db, statement) {
  return new Promise((resolve, reject) => {
    db.run(statement, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function buildPlaygroundDatabase(schemaSql, dataSql = "") {
  const schemaStatements = parseSetupStatements(schemaSql, {
    label: "Schema",
    required: true,
    maxBytes: MAX_SCHEMA_BYTES,
    maxStatements: MAX_TABLES,
  });
  const dataStatements = parseSetupStatements(dataSql, {
    label: "Sample data",
    required: false,
    maxBytes: MAX_DATA_BYTES,
    maxStatements: MAX_INSERTS,
  });

  schemaStatements.forEach(({ ast }) => validateCreateTable(ast));
  const tableNames = schemaStatements.map(({ ast }) => ast.table[0].table);
  if (new Set(tableNames.map((name) => name.toLowerCase())).size !== tableNames.length) {
    throw new Error("Each table can be created only once.");
  }

  let insertedRows = 0;
  dataStatements.forEach(({ ast }) => {
    insertedRows += validateInsert(ast);
    if (insertedRows > MAX_INSERT_ROWS) {
      throw new Error(`Sample data can contain at most ${MAX_INSERT_ROWS} rows.`);
    }
  });

  const db = new sqlite3.Database(":memory:");
  try {
    for (const { sql } of schemaStatements) await runStatement(db, sql);
    for (const { sql } of dataStatements) await runStatement(db, sql);
    await runStatement(db, "PRAGMA query_only = ON");
    return { db, tables: tableNames, insertedRows };
  } catch (error) {
    await closeDatabase(db);
    throw error;
  }
}

function assertReadOnlySelect(query) {
  if (typeof query !== "string" || !query.trim()) {
    throw new Error("Enter a SELECT query to run.");
  }
  if (Buffer.byteLength(query, "utf8") > MAX_QUERY_BYTES) {
    throw new Error(`Queries must be ${MAX_QUERY_BYTES} bytes or less.`);
  }

  const statements = splitSqlStatements(query)
    .map((statement) => ({ sql: statement, ast: parseReadOnlyStatement(statement) }))
    .filter(({ ast }) => ast !== null);
  if (statements.length !== 1) {
    throw new Error("Run one query at a time.");
  }

  const { ast, sql } = statements[0];
  if (
    ast.type !== "select"
    || ast.for_update
    || ast.locking_read
    || ast.into?.position
  ) {
    throw new Error("Only read-only SELECT queries are allowed.");
  }

  const inspectAst = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(inspectAst);
      return;
    }
    if (SQL_STATEMENT_TYPES.has(node.type) && node.type !== "select") {
      throw new Error("Only read-only SELECT queries are allowed.");
    }
    if (node.type === "select" && (node.for_update || node.locking_read || node.into?.position)) {
      throw new Error("Locking and output clauses are not allowed in the playground.");
    }
    if (node.type === "function") {
      const functionName = node.name?.name?.[0]?.value?.toLowerCase();
      if (FORBIDDEN_FUNCTIONS.has(functionName)) {
        throw new Error(`The ${functionName}() function is not allowed in the playground.`);
      }
    }
    Object.values(node).forEach(inspectAst);
  };
  inspectAst(ast);
  return sql;
}

function runPlaygroundQuery(db, query) {
  const statement = assertReadOnlySelect(query);
  const limitedQuery = `SELECT * FROM (\n${statement}\n) AS playground_result LIMIT ${MAX_RESULT_ROWS}`;

  return new Promise((resolve, reject) => {
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      db.interrupt();
    }, MAX_QUERY_TIME_MS);

    db.all(limitedQuery, [], (error, rows) => {
      clearTimeout(timeout);
      if (timedOut) {
        reject(new Error(`Query exceeded the ${MAX_QUERY_TIME_MS} ms time limit.`));
      } else if (error) {
        reject(error);
      } else if (Buffer.byteLength(JSON.stringify(rows), "utf8") > MAX_RESULT_BYTES) {
        reject(new Error("Query results exceed the 1 MB response limit. Narrow the selected columns or rows."));
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  assertReadOnlySelect,
  buildPlaygroundDatabase,
  closeDatabase,
  runPlaygroundQuery,
};
