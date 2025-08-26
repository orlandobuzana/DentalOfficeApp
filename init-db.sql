-- SmileCare Dental Database Initialization
-- This script sets up the PostgreSQL database with proper encoding and extensions

-- Create extensions for UUID generation and other utilities
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by Drizzle migrations)
-- Note: The actual table schema is managed by Drizzle ORM
-- This file only sets up database-level configurations

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'SmileCare Dental database initialized successfully at %', now();
END
$$;