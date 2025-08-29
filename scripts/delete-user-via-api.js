const axios = require('axios');

const API_BASE_URL = 'https://fair-legal-gar.ngrok-free.app';

/**
 * Deletes a user via the existing API endpoint
 * @param {string} email - The email address to search for
 */
async function deleteUserViaAPI(email) {
  try {
    console.log(`🔍 Searching for user with email: ${email}`);
    
    // First, get all users to find the one with this email
    const usersResponse = await axios.get(`${API_BASE_URL}/api/auth/users`, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!usersResponse.data.success) {
      throw new Error('Failed to fetch users');
    }

    const users = usersResponse.data.users;
    const targetUser = users.find(user => user.email === email);

    if (!targetUser) {
      console.log('❌ User not found with email:', email);
      return;
    }

    console.log('✅ User found:', {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone,
      user_type: targetUser.user_type,
      auth_provider: targetUser.auth_provider,
      status: targetUser.status,
      created_at: targetUser.created_at
    });

    console.log('\n⚠️  WARNING: This will delete the user and ALL related data permanently!');
    console.log('📋 Data to be deleted:');
    console.log('   - User account');
    console.log('   - Creator/Brand profile');
    console.log('   - Portfolio items');
    console.log('   - Social media accounts');
    console.log('   - Packages');
    console.log('   - KYC information');
    console.log('   - Campaign applications');
    console.log('   - Collaborations');
    console.log('   - Invoices');
    console.log('   - Phone verifications');
    console.log('   - Notifications');
    console.log('   - Messages');
    console.log('   - Reviews');
    console.log('   - Payments');
    console.log('   - Content reviews');
    console.log('   - Content submissions');
    console.log('   - Collaboration channels');
    console.log('   - Tickets');

    // For automated deletion, you can set this to true
    const autoConfirm = true;
    
    if (!autoConfirm) {
      console.log('\n❓ To proceed with deletion, set autoConfirm = true in the script');
      console.log('   Or use the web interface at http://localhost:3000');
      return;
    }

    console.log('\n🗑️  Proceeding with deletion via API...');
    
    // Delete user using the existing API endpoint
    const deleteResponse = await axios.delete(`${API_BASE_URL}/api/auth/delete-user`, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      data: { userId: targetUser.id }
    });

    if (deleteResponse.data.success) {
      console.log('✅ User deleted successfully via API!');
      console.log(`📧 Email: ${email}`);
      console.log(`👤 Name: ${targetUser.name}`);
      console.log(`🆔 ID: ${targetUser.id}`);
    } else {
      throw new Error(deleteResponse.data.error || 'Failed to delete user');
    }

  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Usage: node delete-user-via-api.js <email>
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node delete-user-via-api.js <email>');
    console.error('Example: node delete-user-via-api.js yarrala.srinivas@gmail.com');
    process.exit(1);
  }
  
  deleteUserViaAPI(email)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = { deleteUserViaAPI };
