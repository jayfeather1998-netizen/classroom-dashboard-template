ALTER TABLE seating_charts
ADD COLUMN layout_mode TEXT NOT NULL
DEFAULT 'groupCount';

ALTER TABLE seating_charts
ADD COLUMN group_count INTEGER NOT NULL
DEFAULT 9;

ALTER TABLE seating_charts
ADD COLUMN group_size INTEGER NOT NULL
DEFAULT 4;