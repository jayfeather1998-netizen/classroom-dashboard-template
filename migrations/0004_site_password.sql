-- =========================================================
-- SITE PASSWORD SETTINGS
-- =========================================================
--
-- Default password: classroom
--
-- The actual password is not stored in the database.
-- Instead, the Worker compares a salted SHA-256 verifier.
--
-- The teacher can change the password later from
-- Teacher Setup.

INSERT INTO app_settings (
  key,
  value
)
VALUES (
  'site_password_salt',
  'classroom-dashboard-default-v1'
);

INSERT INTO app_settings (
  key,
  value
)
VALUES (
  'site_password_hash',
  '67841cfa9013684bc8637450b566f1f893fe276d1d292c17595c94de261b8a1f'
);

INSERT INTO app_settings (
  key,
  value
)
VALUES (
  'site_auth_token',
  ''
);