#!/bin/bash

# Install required dependencies for enhanced security features

echo "Installing security dependencies..."

# 2FA dependencies
npm install speakeasy qrcode

# Additional security dependencies  
npm install helmet
npm install express-rate-limit
npm install @types/speakeasy @types/qrcode --save-dev

echo "Security dependencies installed successfully!"
echo ""
echo "Required dependencies added:"
echo "- speakeasy: For TOTP-based 2FA"
echo "- qrcode: For generating QR codes for 2FA setup"
echo "- helmet: For additional HTTP security headers"
echo "- express-rate-limit: For enhanced rate limiting"
echo ""
echo "Please ensure your Prisma schema includes the following fields in the User model:"
echo "- twoFactorSecret: String?"
echo "- isTwoFactorEnabled: Boolean @default(false)"
echo "- twoFactorBackupCodes: String[]"
echo "- refreshTokenFamily: String?"
echo "- refreshTokenVersion: Int @default(0)"
echo ""
echo "And add these new models:"
echo "- UserSession"
echo "- SecurityEvent" 
echo "- AuditLog"