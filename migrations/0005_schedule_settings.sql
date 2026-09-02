INSERT INTO app_settings (key, value)
VALUES ('schedule_mode', 'block')
ON CONFLICT(key) DO NOTHING;

INSERT INTO app_settings (key, value)
VALUES ('standard_period_count', '8')
ON CONFLICT(key) DO NOTHING;

INSERT INTO app_settings (key, value)
VALUES ('a_day_period_count', '4')
ON CONFLICT(key) DO NOTHING;

INSERT INTO app_settings (key, value)
VALUES ('b_day_period_count', '4')
ON CONFLICT(key) DO NOTHING;