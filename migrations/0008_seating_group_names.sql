ALTER TABLE seating_charts
ADD COLUMN group_names TEXT NOT NULL DEFAULT '{}';

ALTER TABLE seating_charts
ADD COLUMN student_name_size INTEGER NOT NULL DEFAULT 24;
