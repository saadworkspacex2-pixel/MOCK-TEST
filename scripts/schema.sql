BEGIN;
CREATE SCHEMA IF NOT EXISTS lhbd_app;
SET LOCAL search_path TO lhbd_app;

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
CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value text NOT NULL DEFAULT '');
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

ALTER TABLE exams ADD COLUMN IF NOT EXISTS rules jsonb NOT NULL DEFAULT '{}';
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS feedback jsonb NOT NULL DEFAULT '{}';
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS ip text NOT NULL DEFAULT '';

COMMIT;
