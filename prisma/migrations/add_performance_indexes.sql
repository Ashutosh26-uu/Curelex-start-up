-- Add performance indexes for frequently queried fields

-- User table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON users(email) WHERE is_active = true AND is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active ON users(role) WHERE is_active = true AND is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_session_id ON users(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_failed_attempts ON users(failed_login_attempts) WHERE failed_login_attempts > 0;

-- Profile table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Patient table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_status_active ON patients(status) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- Doctor table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doctors_doctor_id ON doctors(doctor_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doctors_specialization ON doctors(specialization) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doctors_available ON doctors(is_available) WHERE is_available = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doctors_npi ON doctors(npi) WHERE npi IS NOT NULL;

-- Appointment table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_patient_scheduled ON appointments(patient_id, scheduled_at) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_doctor_scheduled ON appointments(doctor_id, scheduled_at) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_status_scheduled ON appointments(status, scheduled_at) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_scheduled_date ON appointments(DATE(scheduled_at)) WHERE is_deleted = false;

-- User session indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_active ON user_sessions(user_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at) WHERE is_active = true;

-- Login history indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_login_history_user_created ON login_history(user_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_login_history_email_created ON login_history(email, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_login_history_success ON login_history(success, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_login_history_ip_created ON login_history(ip_address, created_at);

-- Notification indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type_priority ON notifications(type, priority) WHERE is_deleted = false;

-- Prescription indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prescriptions_patient_created ON prescriptions(patient_id, created_at) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prescriptions_doctor_created ON prescriptions(doctor_id, created_at) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prescriptions_status ON prescriptions(status) WHERE is_deleted = false;

-- Vitals indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vitals_patient_recorded ON vitals(patient_id, recorded_at) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vitals_type_recorded ON vitals(type, recorded_at) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vitals_abnormal ON vitals(is_abnormal, recorded_at) WHERE is_abnormal = true;

-- Audit log indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource_created ON audit_logs(resource, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_retention ON audit_logs(retention_date) WHERE retention_date IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_patient_status_date ON appointments(patient_id, status, scheduled_at) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_doctor_status_date ON appointments(doctor_id, status, scheduled_at) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active_created ON users(role, is_active, created_at) WHERE is_deleted = false;