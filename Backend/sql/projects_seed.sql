-- Seed data for projects (March to November 2025)

-- Insert sample projects with different months
INSERT OR IGNORE INTO projects (title, description, service_id, client_id, controller_id, status, progress, amount, amount_description, created_at) VALUES
('Website Development for ABC Corp', 'Complete website development project for ABC Corporation', 7, 1, 2, 'completed', 100, 5000.00, 'Initial payment', '2025-03-15 10:30:00'),
('Cyber Security Audit', 'Comprehensive security audit for financial institution', 1, 2, 3, 'in_progress', 65, 8000.00, 'Security assessment', '2025-03-20 14:22:00'),
('IT Consultation for Startup', 'IT infrastructure consultation for new startup', 2, 3, 1, 'completed', 100, 2000.00, 'Consultation fee', '2025-04-05 09:15:00'),
('Network Setup for Office', 'Complete network infrastructure setup', 3, 4, 2, 'in_progress', 40, 4500.00, 'Installation cost', '2025-04-18 16:45:00'),
('Computer Repair Service', 'Hardware repair and maintenance for business', 4, 5, 1, 'pending', 0, 500.00, 'Repair cost', '2025-05-10 11:30:00'),
('Software Installation Package', 'Complete software package installation', 5, 1, 3, 'completed', 100, 1200.00, 'Software license', '2025-05-25 13:20:00'),
('Brand Identity Design', 'Complete brand identity and marketing materials', 6, 2, 1, 'in_progress', 75, 3000.00, 'Design package', '2025-06-12 08:45:00'),
('Mobile App Development', 'Custom mobile application for retail business', 8, 3, 2, 'in_progress', 30, 12000.00, 'Development cost', '2025-06-28 15:10:00'),
('Laptop Sales for School', 'Bulk laptop purchase for educational institution', 9, 4, NULL, 'completed', 100, 24000.00, 'Equipment purchase', '2025-07-08 12:00:00'),
('Gaming Console Setup', 'Gaming console setup for entertainment center', 10, 5, NULL, 'pending', 10, 2000.00, 'Setup fee', '2025-07-22 17:30:00'),
('E-commerce Platform', 'Online store development for retail business', 7, 1, 2, 'in_progress', 55, 8000.00, 'Platform development', '2025-08-14 10:15:00'),
('Cloud Migration Project', 'Migrating on-premise infrastructure to cloud', 2, 2, 3, 'completed', 100, 15000.00, 'Migration service', '2025-08-30 14:00:00'),
('Database Optimization', 'Database performance optimization and maintenance', 3, 3, 1, 'in_progress', 25, 3500.00, 'Optimization service', '2025-09-15 09:30:00'),
('Cyber Security Training', 'Employee cybersecurity awareness training', 1, 4, 2, 'completed', 100, 4000.00, 'Training cost', '2025-09-28 16:20:00'),
('Server Maintenance', 'Quarterly server maintenance and updates', 3, 5, 1, 'pending', 5, 2500.00, 'Maintenance contract', '2025-10-10 11:45:00'),
('App UI/UX Redesign', 'Complete redesign of mobile application UI/UX', 6, 1, 3, 'in_progress', 45, 6000.00, 'Design service', '2025-10-25 13:10:00'),
('Hardware Upgrade', 'Computer hardware upgrade for design team', 4, 2, NULL, 'completed', 100, 8000.00, 'Hardware cost', '2025-11-05 08:30:00'),
('API Integration', 'Third-party API integration for existing system', 8, 3, 2, 'in_progress', 60, 7000.00, 'Integration service', '2025-11-18 15:45:00'),
('Backup Solution Setup', 'Enterprise backup solution implementation', 1, 4, 1, 'pending', 15, 5500.00, 'Backup setup', '2025-11-22 12:15:00'),
('POS System Installation', 'Point of sale system installation for retail', 5, 5, 3, 'completed', 100, 2500.00, 'Installation cost', '2025-11-30 10:00:00');