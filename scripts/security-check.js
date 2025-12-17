#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔒 Running security checks...');

// Check for sensitive files
const sensitiveFiles = [
  '.env',
  'frontend/.env.local',
  'prisma/dev.db'
];

sensitiveFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists (should not be in git)`);
  }
});

// Check environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'DATABASE_URL'
];

const missing = requiredEnvVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('✅ Security checks passed');