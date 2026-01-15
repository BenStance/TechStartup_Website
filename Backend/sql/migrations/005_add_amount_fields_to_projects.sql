-- Migration script to add amount and amountDescription columns to projects table
-- This script adds the amount and amountDescription columns to track project financial information

-- Add amount column to projects table
ALTER TABLE projects ADD COLUMN amount DECIMAL(10, 2);

-- Add amount_description column to projects table
ALTER TABLE projects ADD COLUMN amount_description TEXT;