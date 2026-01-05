-- Authentication System Database Schema
-- Supports user authentication, session management, 2FA, and security logging

-- Users table with authentication fields
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false,
    lock_reason VARCHAR(255),
    account_lock_until TIMESTAMP,
    
    -- Login tracking
    failed_login_attempts INT DEFAULT 0,
    last_failed_login_at TIMESTAMP,
    last_login_at TIMESTAMP,
    last_logout_at TIMESTAMP,
    
    -- Token management
    refresh_token VARCHAR(255),
    refresh_token_family VARCHAR(36),
    refresh_token_version INT DEFAULT 0,
    session_id VARCHAR(36),
    device_fingerprint VARCHAR(255),
    
    -- 2FA
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_session_id (session_id),
    INDEX idx_refresh_token_family (refresh_token_family)
);

-- Login history for security tracking
CREATE TABLE login_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    email VARCHAR(255) NOT NULL,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Token blacklist for JWT invalidation
CREATE TABLE token_blacklist (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    jti VARCHAR(36) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    reason VARCHAR(100),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_jti (jti),
    INDEX idx_expires_at (expires_at)
);

-- User sessions for session management
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_expires_at (expires_at)
);

-- Security events logging
CREATE TABLE security_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    event_type ENUM('LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);

-- Cleanup procedures for maintenance
DELIMITER //

CREATE PROCEDURE CleanupExpiredTokens()
BEGIN
    DELETE FROM token_blacklist WHERE expires_at < NOW();
    DELETE FROM user_sessions WHERE expires_at < NOW();
END //

CREATE PROCEDURE CleanupOldLoginHistory()
BEGIN
    -- Keep only last 50 records per user
    DELETE lh1 FROM login_history lh1
    INNER JOIN (
        SELECT email, id
        FROM (
            SELECT email, id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
            FROM login_history
        ) ranked
        WHERE rn > 50
    ) lh2 ON lh1.id = lh2.id;
END //

DELIMITER ;