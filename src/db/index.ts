import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Resolve the connection string for THIS application.
 *
 * The hosting platform may inject a shared database URL. This app keeps its
 * tables in its own database (default: "lhbd") inside the same Postgres server
 * so it can never collide with other projects that share the host. Override
 * with LHBD_DB_NAME if a different database name is required.
 */
function resolveUrl(raw: string): string {
  try {
    const url = new URL(raw);
    // node-postgres has no SCRAM channel binding; drop the unsupported param.
    url.searchParams.delete("channel_binding");
    const isLocal = /(^|\.)(localhost|127\.0\.0\.1)$/.test(url.hostname);
    const target =
      process.env.LHBD_DB_NAME?.trim() || (isLocal ? "" : "lhbd");
    if (!target) return url.toString();
    const current = url.pathname.replace(/^\//, "");
    if (current !== target) url.pathname = `/${target}`;
    return url.toString();
  } catch {
    return raw;
  }
}

const resolvedUrl = resolveUrl(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __lhbdBootstrap?: Promise<void>;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: resolvedUrl,
    max: 8,
    // Neon requires TLS; the URL carries sslmode=require.
    ssl: /sslmode=require/.test(resolvedUrl) ? true : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);

/**
 * Idempotent schema bootstrap. Runs at most once per process so a brand new or
 * empty database becomes usable without a manual migration step.
 */
export function ensureDb(): Promise<void> {
  if (!globalForDb.__lhbdBootstrap) {
    globalForDb.__lhbdBootstrap = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS exams (
          id serial PRIMARY KEY,
          title text NOT NULL,
          description text NOT NULL DEFAULT '',
          category text NOT NULL DEFAULT 'সাধারণ জ্ঞান',
          module text NOT NULL DEFAULT 'mcq',
          duration_minutes integer NOT NULL DEFAULT 20,
          marks_per_question real NOT NULL DEFAULT 1,
          negative_mark real NOT NULL DEFAULT 0,
          is_live boolean NOT NULL DEFAULT true,
          rules jsonb NOT NULL DEFAULT '{}',
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS sections (
          id serial PRIMARY KEY,
          exam_id integer NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
          title text NOT NULL DEFAULT 'Part 1',
          passage_title text NOT NULL DEFAULT '',
          passage_text text NOT NULL DEFAULT '',
          instruction text NOT NULL DEFAULT '',
          audio_url text NOT NULL DEFAULT '',
          sort_order integer NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS media (
          id serial PRIMARY KEY,
          filename text NOT NULL,
          mime text NOT NULL,
          data text NOT NULL,
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS users (
          id serial PRIMARY KEY,
          email text NOT NULL UNIQUE,
          phone text NOT NULL DEFAULT '',
          name_en text NOT NULL DEFAULT '',
          name_bn text NOT NULL DEFAULT '',
          password_hash text NOT NULL,
          salt text NOT NULL,
          avatar text NOT NULL DEFAULT '',
          session_token text NOT NULL DEFAULT '',
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS settings (
          key text PRIMARY KEY,
          value text NOT NULL DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS questions (
          id serial PRIMARY KEY,
          exam_id integer NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
          section_id integer REFERENCES sections(id) ON DELETE CASCADE,
          qtype text NOT NULL DEFAULT 'mcq',
          text text NOT NULL,
          option_a text NOT NULL DEFAULT '',
          option_b text NOT NULL DEFAULT '',
          option_c text NOT NULL DEFAULT '',
          option_d text NOT NULL DEFAULT '',
          correct_option integer NOT NULL DEFAULT 0,
          accepted_answers text NOT NULL DEFAULT '',
          explanation text NOT NULL DEFAULT '',
          sort_order integer NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS attempts (
          id serial PRIMARY KEY,
          exam_id integer NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
          user_id integer REFERENCES users(id) ON DELETE SET NULL,
          student_name text NOT NULL,
          score real NOT NULL DEFAULT 0,
          band_score real,
          correct_count integer NOT NULL DEFAULT 0,
          wrong_count integer NOT NULL DEFAULT 0,
          skipped_count integer NOT NULL DEFAULT 0,
          total_questions integer NOT NULL DEFAULT 0,
          time_taken_seconds integer NOT NULL DEFAULT 0,
          answers jsonb NOT NULL DEFAULT '{}',
          essay_text text NOT NULL DEFAULT '',
          status text NOT NULL DEFAULT 'scored',
          feedback jsonb NOT NULL DEFAULT '{}',
          ip text NOT NULL DEFAULT '',
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS resources (
          id serial PRIMARY KEY,
          title text NOT NULL,
          description text NOT NULL DEFAULT '',
          category text NOT NULL DEFAULT 'সাধারণ',
          type text NOT NULL DEFAULT 'article',
          url text NOT NULL DEFAULT '#',
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS page_sections (
          id serial PRIMARY KEY,
          page text NOT NULL DEFAULT 'home',
          type text NOT NULL DEFAULT 'html',
          title text NOT NULL DEFAULT '',
          content jsonb NOT NULL DEFAULT '{}',
          sort_order integer NOT NULL DEFAULT 0,
          enabled boolean NOT NULL DEFAULT true,
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS staff (
          id serial PRIMARY KEY,
          name text NOT NULL,
          email text NOT NULL UNIQUE,
          password_hash text NOT NULL,
          salt text NOT NULL,
          role text NOT NULL DEFAULT 'content',
          session_token text NOT NULL DEFAULT '',
          created_at timestamp NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS exam_sessions (
          id serial PRIMARY KEY,
          token text NOT NULL UNIQUE,
          exam_id integer NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
          user_id integer REFERENCES users(id) ON DELETE SET NULL,
          student_name text NOT NULL DEFAULT '',
          submitted boolean NOT NULL DEFAULT false,
          last_seen timestamp NOT NULL DEFAULT now(),
          created_at timestamp NOT NULL DEFAULT now()
        );
      `);
    })().catch((err: unknown) => {
      // Do not cache failures; allow a later request to retry.
      globalForDb.__lhbdBootstrap = undefined;
      throw err;
    });
  }
  return globalForDb.__lhbdBootstrap;
}
