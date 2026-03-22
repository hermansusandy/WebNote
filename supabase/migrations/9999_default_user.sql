-- Seed default user for no-auth mode
INSERT INTO users (id, email, password_hash)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@webnote.local', 'no-password')
ON CONFLICT (id) DO NOTHING;
