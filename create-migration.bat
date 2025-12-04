@echo off
echo Creating database migration...
npx prisma migrate dev --name add_password_fields
echo Migration created successfully!