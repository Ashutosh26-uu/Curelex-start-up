-- Healthcare Telemedicine Platform Database Initialization
-- This script sets up the initial database configuration

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just placeholders for future optimizations

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Healthcare Telemedicine Platform database initialized successfully';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Timestamp: %', now();
END $$;