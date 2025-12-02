const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with ashutosh@curelex.com...');
    
    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'ashutosh@curelex.com',
      password: 'admin@123'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.user.profile.firstName, response.data.user.profile.lastName);
    console.log('Role:', response.data.user.role);
    console.log('Token received:', response.data.access_token ? 'Yes' : 'No');
    
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
  }
}

testLogin();