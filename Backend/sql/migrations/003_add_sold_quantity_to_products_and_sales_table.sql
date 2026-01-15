-- Migration: Add sold_quantity column to products table and create sales table

-- Add sold_quantity column to products table
ALTER TABLE products ADD COLUMN sold_quantity INTEGER DEFAULT 0;

-- Create sales table to track all sales
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_reversed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Update existing sales records to have is_reversed = 0
UPDATE sales SET is_reversed = 0 WHERE is_reversed IS NULL;