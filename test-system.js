const axios = require('axios');

async function testSystem() {
  console.log('🧪 Testing Healthcare Platform...\n');

  try {
    // Test Backend Health
    console.log('1. Testing Backend API...');
    const healthCheck = await axios.get('http://localhost:3000/api/v1');
    console.log('   ✅ Backend is running');
  } catch (error) {
    console.log('   ❌ Backend not responding');
    return;
  }

  try {
    // Test Login
    console.log('2. Testing Authentication...');
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@healthcare.com',
      password: 'admin123'
    });
    console.log('   ✅ Login successful');
    
    const token = loginResponse.data.access_token;
    
    // Test Protected Route
    console.log('3. Testing Protected Routes...');
    const usersResponse = await axios.get('http://localhost:3000/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Protected routes working');
    console.log(`   📊 Found ${usersResponse.data.data?.length || 0} users in system`);
    
  } catch (error) {
    console.log('   ❌ Authentication failed:', error.response?.data?.message || error.message);
  }

  console.log('\n🎉 System Test Complete!');
  console.log('\n🌐 Access your platform:');
  console.log('   Frontend: http://localhost:3001');
  console.log('   Backend:  http://localhost:3000');
  console.log('   API Docs: http://localhost:3000/api/docs');
  console.log('\n🔑 Login with:');
  console.log('   Admin: admin@healthcare.com / admin123');
  console.log('   Doctor: doctor@healthcare.com / doctor123');
  console.log('   Patient: patient@healthcare.com / patient123');
}

testSystem();