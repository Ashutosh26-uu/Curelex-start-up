const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', health.data.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Login
  try {
    console.log('\n2. Testing login...');
    const login = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ashutosh@curelex.com',
      password: 'admin@123'
    });
    console.log('✅ Login successful:', login.data.user.role);
    
    const token = login.data.accessToken;
    
    // Test 3: Protected endpoint
    try {
      console.log('\n3. Testing protected endpoint...');
      const profile = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile fetch successful:', profile.data.email);
    } catch (error) {
      console.log('❌ Profile fetch failed:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
  }

  // Test 4: Patient Registration
  try {
    console.log('\n4. Testing patient registration...');
    const patientData = {
      firstName: 'Test',
      lastName: 'Patient',
      email: `test.patient.${Date.now()}@example.com`,
      mobile: '9876543210',
      age: 30,
      gender: 'MALE',
      emergencyContact: '9876543211'
    };
    
    const register = await axios.post(`${API_BASE}/patients/register`, patientData);
    console.log('✅ Patient registration successful:', register.data.email);
  } catch (error) {
    console.log('❌ Patient registration failed:', error.response?.data?.message || error.message);
  }

  console.log('\n🏁 Test completed!');
}

testEndpoints();