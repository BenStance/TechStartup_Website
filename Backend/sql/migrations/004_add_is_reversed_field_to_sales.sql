-- Migration: Add is_reversed field to sales table

-- Add is_reversed column to sales table
ALTER TABLE sales ADD COLUMN is_reversed BOOLEAN DEFAULT 0;

-- Update existing sales records to have is_reversed = 0
UPDATE sales SET is_reversed = 0 WHERE is_reversed IS NULL;