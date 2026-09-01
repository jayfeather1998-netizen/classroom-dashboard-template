CREATE TABLE app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

INSERT INTO app_settings (
  key,
  value
)
VALUES (
  'teacher_pin',
  '1234'
);