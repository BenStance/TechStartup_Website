-- Migration script to remove project_progress table
-- This script drops the project_progress table as we're now using only the projects table

-- Drop the project_progress table
DROP TABLE IF EXISTS project_progress;

-- Remove indexes related to project_progress table
DROP INDEX IF EXISTS idx_project_progress_project_id;
DROP INDEX IF EXISTS idx_project_progress_status;