-- Seed data for development

-- Insert sample services
INSERT OR IGNORE INTO services (name, description, category, price) VALUES
('Cyber Security', 'Comprehensive cybersecurity solutions to protect your business', 'Security', 500.00),
('IT Consultation', 'Expert advice on IT infrastructure and strategy', 'Consultation', 200.00),
('Network Administration', 'Professional network setup and maintenance', 'Administration', 300.00),
('Computer Servicing', 'Hardware repair and maintenance services', 'Hardware', 100.00),
('Software Installation', 'Installation and configuration of software applications', 'Software', 75.00),
('Graphic Design', 'Creative graphic design services for branding and marketing', 'Design', 150.00),
('Website Development', 'Custom website development solutions', 'Development', 1000.00),
('Mobile App Development', 'Native and cross-platform mobile application development', 'Development', 1500.00),
('Laptop Sales', 'Latest laptops and notebooks for personal and business use', 'Sales', 800.00),
('Gaming Consoles', 'Latest gaming consoles and accessories', 'Sales', 400.00);

-- Insert sample products
INSERT OR IGNORE INTO products (name, description, price, category, stock_quantity) VALUES
('Gaming Laptop', 'High-performance laptop for gaming and professional use', 1200.00, 'Laptops', 10),
('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 25.00, 'Accessories', 50),
('Mechanical Keyboard', 'RGB mechanical keyboard with customizable keys', 80.00, 'Accessories', 30),
('External SSD', 'Portable solid-state drive with USB 3.0 interface', 120.00, 'Storage', 25),
('Webcam', 'HD webcam with built-in microphone for video conferencing', 60.00, 'Accessories', 40);

-- Insert admin user
INSERT OR IGNORE INTO users (email, password, role, first_name, last_name, phone, is_verified) VALUES
('admin@origintechnologies.com', '$2b$10$rZ7znSJX.yr.b.BUIfmTnu0F/OXZYOMcEuOEjE0LxJuZDykcx7kIu', 'admin', 'Admin', 'User', '+1234567890', 1);