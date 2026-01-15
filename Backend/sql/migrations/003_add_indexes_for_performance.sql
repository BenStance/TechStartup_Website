-- Migration script to add indexes for better performance
-- This script adds indexes for better query performance

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_progress_project_id ON project_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_project_progress_status ON project_progress(status);