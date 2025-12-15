# Portal Testing Checklist

## 🔐 Authentication Test

### Patient Portal
- **URL**: http://localhost:3001/patient-login
- **Test Credentials**: patient@healthcare.com / patient123
- **Expected**: Redirect to /patient dashboard
- **Features**: Registration, appointments, medical history

### Doctor Portal  
- **URL**: http://localhost:3001/doctor-login
- **Test Credentials**: doctor@healthcare.com / doctor123
- **Expected**: Redirect to /doctor dashboard
- **Features**: Patient management, prescriptions

### Junior Doctor Portal
- **URL**: http://localhost:3001/junior-doctor-login
- **Test Credentials**: junior@healthcare.com / junior123
- **Expected**: Redirect to /doctor dashboard
- **Features**: Limited doctor access

## 🔑 Auto Key Generation Test

### Patient Registration
```bash
POST /api/v1/patients/self-register
{
  "name": "John Doe",
  "phone": "+91-9999888777", 
  "age": 25,
  "captcha": "ABC123"
}
```
**Expected**: Generate unique ID like `CX8777ABCD567`

### Doctor Registration
```bash
POST /api/v1/auth/register/doctor
{
  "email": "newdoc@test.com",
  "specialization": "Cardiology",
  "captcha": "XYZ789"
}
```
**Expected**: Generate doctor ID like `DRCAR1234ABC`

## 🤖 Captcha Test

### Generate Captcha
```bash
GET /api/v1/auth/captcha
```
**Expected**: Return captcha code and expiry

### Validate Captcha
- Include captcha in registration requests
- Should validate before creating account

## 🗄️ Database Test

### Check User Roles
```sql
SELECT role, COUNT(*) FROM users GROUP BY role;
```
**Expected**: Only PATIENT, DOCTOR, JUNIOR_DOCTOR

### Check Phone-based IDs
```sql
SELECT patientId, phone FROM patients WHERE patientId LIKE 'CX%';
```
**Expected**: Phone-based unique IDs

## 🔄 Session Management Test

### Token Validity
- **Access Token**: 24 hours
- **Refresh Token**: 30 days
- **Session**: Auto-extend if active

### Auto Refresh
```bash
POST /api/v1/auth/auto-refresh
Authorization: Bearer <token>
```
**Expected**: New tokens if near expiry

## ✅ Test Results

- [ ] Patient login works
- [ ] Doctor login works  
- [ ] Junior doctor login works
- [ ] Phone-based ID generation
- [ ] Captcha generation/validation
- [ ] Token auto-refresh
- [ ] Database role cleanup
- [ ] Session management

## 🚨 Common Issues

1. **404 on login**: Check API endpoints match
2. **Token expiry**: Verify 24h validity
3. **Role validation**: Ensure only 3 roles exist
4. **Captcha failure**: Check generation endpoint
5. **ID generation**: Verify phone format validation