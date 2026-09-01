PRAGMA foreign_keys = ON;

CREATE TABLE subjects (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE periods (
  id TEXT PRIMARY KEY NOT NULL,
  number INTEGER NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('A', 'B')),
  type TEXT NOT NULL CHECK (type IN ('class', 'prep')),
  subject_id TEXT,
  color_name TEXT NOT NULL,
  accent TEXT NOT NULL,
  light TEXT NOT NULL,
  text_color TEXT NOT NULL,

  FOREIGN KEY (subject_id)
    REFERENCES subjects(id)
    ON DELETE RESTRICT
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY NOT NULL,
  subject_id TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  learning_target TEXT NOT NULL DEFAULT '',
  instructions TEXT NOT NULL DEFAULT '',
  homework TEXT NOT NULL DEFAULT '',
  warm_up TEXT NOT NULL DEFAULT '',

  FOREIGN KEY (subject_id)
    REFERENCES subjects(id)
    ON DELETE RESTRICT
);

CREATE TABLE lesson_assignments (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  period_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,

  FOREIGN KEY (period_id)
    REFERENCES periods(id)
    ON DELETE CASCADE,

  FOREIGN KEY (lesson_id)
    REFERENCES lessons(id)
    ON DELETE CASCADE,

  UNIQUE (date, period_id)
);

CREATE TABLE school_days (
  date TEXT PRIMARY KEY NOT NULL,
  day_type TEXT NOT NULL
    CHECK (day_type IN ('A', 'B', 'none'))
);

CREATE TABLE students (
  id TEXT PRIMARY KEY NOT NULL,
  period_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_initial TEXT NOT NULL,

  FOREIGN KEY (period_id)
    REFERENCES periods(id)
    ON DELETE CASCADE
);

CREATE TABLE forbidden_pairs (
  id TEXT PRIMARY KEY NOT NULL,
  period_id TEXT NOT NULL,
  student_id_1 TEXT NOT NULL,
  student_id_2 TEXT NOT NULL,

  FOREIGN KEY (period_id)
    REFERENCES periods(id)
    ON DELETE CASCADE,

  FOREIGN KEY (student_id_1)
    REFERENCES students(id)
    ON DELETE CASCADE,

  FOREIGN KEY (student_id_2)
    REFERENCES students(id)
    ON DELETE CASCADE,

  CHECK (student_id_1 <> student_id_2)
);

CREATE UNIQUE INDEX forbidden_pairs_unique
ON forbidden_pairs (
  period_id,
  CASE
    WHEN student_id_1 < student_id_2
      THEN student_id_1
    ELSE student_id_2
  END,
  CASE
    WHEN student_id_1 < student_id_2
      THEN student_id_2
    ELSE student_id_1
  END
);

CREATE TABLE seating_charts (
  period_id TEXT PRIMARY KEY NOT NULL,
  assignments TEXT NOT NULL DEFAULT '{}',
  blocked_seat_ids TEXT NOT NULL DEFAULT '[]',

  FOREIGN KEY (period_id)
    REFERENCES periods(id)
    ON DELETE CASCADE
);

CREATE INDEX lessons_subject_idx
ON lessons(subject_id);

CREATE INDEX assignments_date_idx
ON lesson_assignments(date);

CREATE INDEX assignments_period_idx
ON lesson_assignments(period_id);

CREATE INDEX students_period_idx
ON students(period_id);

CREATE INDEX forbidden_pairs_period_idx
ON forbidden_pairs(period_id);

-- =========================================================
-- DEFAULT SUBJECTS
-- =========================================================

INSERT INTO subjects (
  id,
  name
)
VALUES
  ('math8', 'Math 8'),
  ('algebra', 'Algebra');


-- =========================================================
-- DEFAULT CLASS PERIODS
-- =========================================================

INSERT INTO periods (
  id,
  number,
  day,
  type,
  subject_id,
  color_name,
  accent,
  light,
  text_color
)
VALUES
  (
    'p1',
    1,
    'A',
    'class',
    'math8',
    'Light Pink',
    '#f4a6c1',
    '#fde8ef',
    '#35141f'
  ),
  (
    'p2',
    2,
    'A',
    'class',
    'math8',
    'Magenta',
    '#c72c78',
    '#f8dfeb',
    '#ffffff'
  ),
  (
    'p3',
    3,
    'A',
    'class',
    'math8',
    'Red',
    '#d64545',
    '#f9e1e1',
    '#ffffff'
  ),
  (
    'p4',
    4,
    'A',
    'class',
    'math8',
    'Orange',
    '#e88735',
    '#fceddf',
    '#2e1807'
  ),
  (
    'p6',
    6,
    'B',
    'class',
    'math8',
    'Green',
    '#4b9f58',
    '#e3f2e6',
    '#ffffff'
  ),
  (
    'p7',
    7,
    'B',
    'class',
    'math8',
    'Light Blue',
    '#69b9de',
    '#e4f4fb',
    '#12313f'
  ),
  (
    'p8',
    8,
    'B',
    'class',
    'math8',
    'Dark Blue',
    '#2878b5',
    '#e0edf7',
    '#ffffff'
  ),
  (
    'p9',
    9,
    'B',
    'class',
    'math8',
    'Purple',
    '#7a4ba3',
    '#eee5f5',
    '#ffffff'
  );