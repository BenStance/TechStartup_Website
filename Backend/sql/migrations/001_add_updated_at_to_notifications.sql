-- Migration script to add updated_at column to notifications table
-- This script recreates the notifications table with the missing updated_at column

-- Create new table with updated_at column
CREATE TABLE notifications_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Copy data from old table to new table
INSERT INTO notifications_new (id, user_id, title, message, type, is_read, created_at)
SELECT id, user_id, title, message, type, is_read, created_at FROM notifications;

-- Update existing records to have a value for updated_at (set to created_at value)
UPDATE notifications_new SET updated_at = created_at WHERE updated_at IS NULL;

-- Drop old table
DROP TABLE notifications;

-- Rename new table to original name
ALTER TABLE notifications_new RENAME TO notifications;

-- Recreate indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_updated_at ON notifications(updated_at);