-- Give the additional period slots unique default colors.
-- Existing user customizations to other periods are left untouched.

UPDATE periods
SET
  color_name = 'Teal',
  accent = '#2A9D8F',
  light = '#DDF3F0',
  text_color = '#163A36'
WHERE id = 'p0';

UPDATE periods
SET
  color_name = 'Gold',
  accent = '#D9A514',
  light = '#FFF3C4',
  text_color = '#3A2B00'
WHERE id = 'p5';

UPDATE periods
SET
  color_name = 'Lavender',
  accent = '#9B7ED9',
  light = '#EEE8FA',
  text_color = '#2D214A'
WHERE id = 'p10';

UPDATE periods
SET
  color_name = 'Tan',
  accent = '#A97452',
  light = '#F1E4DA',
  text_color = '#332117'
WHERE id = 'p11';

UPDATE periods
SET
  color_name = 'Slate',
  accent = '#5F6F7A',
  light = '#E5EBEE',
  text_color = '#FFFFFF'
WHERE id = 'p12';