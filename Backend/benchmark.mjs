import { performance } from "node:perf_hooks";

const url = "http://localhost:5000/req";
const payload = {
  query: "SELECT * FROM customers LIMIT 10",
  expected: "SELECT * FROM customers LIMIT 10",
};

let cookie = "";

async function runRequest() {
  const start = performance.now();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(payload),
  });

  // Preserve the session so later requests reuse the same in-memory DB.
  const setCookie = response.headers.get("set-cookie");
  if (setCookie && !cookie) {
    cookie = setCookie.split(";")[0];
  }

  const result = await response.json();
  const elapsedMs = performance.now() - start;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
  }

  return elapsedMs;
}

const coldStartMs = await runRequest();

// Warm up the server, then measure repeated requests using the same session.
for (let i = 0; i < 5; i++) {
  await runRequest();
}

const samples = [];
for (let i = 0; i < 100; i++) {
  samples.push(await runRequest());
}

samples.sort((a, b) => a - b);
const percentile = (p) => samples[Math.ceil(p * samples.length) - 1];

console.log(`First request (includes DB setup): ${coldStartMs.toFixed(2)} ms`);
console.log(`Warm requests: ${samples.length}`);
console.log(`Median (p50): ${percentile(0.50).toFixed(2)} ms`);
console.log(`p95: ${percentile(0.95).toFixed(2)} ms`);
console.log(`Maximum observed: ${samples.at(-1).toFixed(2)} ms`);