-- MIGRATION: UPDATE MESSAGES TABLE SCHEMA
-- Date: 2026-05-04
-- Target: Add category and status columns for better tracking and UI categorization

DO $$ 
BEGIN 
    -- 1. Add 'category' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'category') THEN
        ALTER TABLE messages ADD COLUMN category text DEFAULT 'SYSTEM';
    END IF;

    -- 2. Add 'status' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'status') THEN
        ALTER TABLE messages ADD COLUMN status text DEFAULT 'sent';
    END IF;

    -- 3. Update existing messages to have a category if they are NULL
    UPDATE messages SET category = 'SYSTEM' WHERE category IS NULL;
    UPDATE messages SET status = 'sent' WHERE status IS NULL;

END $$;
