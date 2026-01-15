-- Create admin user
INSERT OR IGNORE INTO users (email, password, role, first_name, last_name, phone, is_verified) VALUES
('admin@origintechnologies.com', '$2b$10$rZ7znSJX.yr.b.BUIfmTnu0F/OXZYOMcEuOEjE0LxJuZDykcx7kIu', 'admin', 'Admin', 'User', '+1234567890', 1);