-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    recipient_id UUID REFERENCES profiles(id) NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Users can see messages they sent or received
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
);

-- 2. Users can send messages (any authenticated user can insert, logic/UI can restrict)
-- We might want to restrict this to only Admins sending to Users, or similar, but for now allow general sending.
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
);

-- 3. Recipients can update 'is_read' status
CREATE POLICY "Recipients can update their messages"
ON messages FOR UPDATE
TO authenticated
USING (
    auth.uid() = recipient_id
)
WITH CHECK (
    auth.uid() = recipient_id
);
