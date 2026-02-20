-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'head', 'manager', 'trainer')),
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Products/Training Topics
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Trainings
CREATE TABLE IF NOT EXISTS trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('client', 'internal')),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
  trainer_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  meeting_link TEXT,
  attendee_count INTEGER DEFAULT 0,
  actual_attendee_count INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id)
);

-- Training-Product relationship (many-to-many)
CREATE TABLE IF NOT EXISTS training_products (
  training_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  PRIMARY KEY (training_id, product_id),
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Feedback Forms
CREATE TABLE IF NOT EXISTS feedback_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training_id INTEGER NOT NULL UNIQUE,
  form_token TEXT UNIQUE NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE
);

-- Feedback Responses
CREATE TABLE IF NOT EXISTS feedback_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id INTEGER NOT NULL,
  respondent_name TEXT,
  respondent_email TEXT,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  content_quality INTEGER CHECK (content_quality BETWEEN 1 AND 5),
  trainer_effectiveness INTEGER CHECK (trainer_effectiveness BETWEEN 1 AND 5),
  relevance INTEGER CHECK (relevance BETWEEN 1 AND 5),
  pace TEXT CHECK (pace IN ('too_slow', 'just_right', 'too_fast')),
  key_takeaways TEXT,
  suggestions TEXT,
  would_recommend INTEGER CHECK (would_recommend IN (0, 1)),
  additional_comments TEXT,
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES feedback_forms(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trainings_trainer ON trainings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainings_status ON trainings(status);
CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(start_date);
CREATE INDEX IF NOT EXISTS idx_feedback_forms_token ON feedback_forms(form_token);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_form ON feedback_responses(form_id);
