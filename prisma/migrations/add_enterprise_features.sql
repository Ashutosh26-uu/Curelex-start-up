-- Add enterprise security fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_history JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS compliance_flags JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_retention_policy VARCHAR(50) DEFAULT 'standard';

-- Create token blacklist table
CREATE TABLE IF NOT EXISTS token_blacklist (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  jti TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES users(id),
  blacklisted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create API rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(jti);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);