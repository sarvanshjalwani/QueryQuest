
# QueryQuest

## Run locally

1. Install frontend packages with `npm install`.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project's API settings.
3. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql) to create the profile, query-attempt, and solved-question tables, row-level security policies, and statistics views. If you have already run an older version of the script, run the updated script again to add the solved-question table and policies.
4. In Supabase Authentication settings, enable email/password sign-in. If email confirmation is enabled, configure the local app URL (normally `http://localhost:5173`) as a redirect/site URL.
5. Start the frontend with `npm run dev`. In a second terminal, start the SQL API with `node Backend/app.js`.

The browser app only uses the Supabase publishable/anon key. Never put a Supabase `service_role` key in a `VITE_*` variable or browser code.

## Supabase features

- Email/password sign-up and sign-in are available at `/account`.
- Signed-in users can access `/profile`, `/statistics`, and `/settings`.
- Successful and incorrect practice-query results are saved to the signed-in user's history for statistics.
- Correctly answered questions are marked solved and persisted per account; guest progress is saved in that browser.
- Settings save the display name and Monaco SQL editor theme/font size.
- Practice, cases, and playground remain usable without signing in. Account-based features require a configured Supabase project.
- Each practice question runs against its own schema and sample data, so its expected answer is checked against the correct tables.
