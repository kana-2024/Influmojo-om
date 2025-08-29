const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNiIsInVzZXJfdHlwZSI6ImFnZW50IiwiaWF0IjoxNzU0NDY5MDg4OTE3LCJleHAiOjE3NTQ0Njk2OTM3MTd9.UdwXbOaoC48kylmTPoNTzno0vx5wOP4VTwu4OYS03QY';

async function testTicketsMy() {
  try {
    console.log('🔍 Testing /api/crm/tickets/my endpoint...');
    
    const response = await axios.get(`${BASE_URL}/api/crm/tickets/my`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing /api/crm/tickets/my:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testTicketsMy(); 