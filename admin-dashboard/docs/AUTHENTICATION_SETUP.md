# Admin Dashboard Authentication Setup

## Overview
The admin dashboard requires JWT authentication to access the API endpoints. This guide will help you set up authentication and resolve the 403 Forbidden errors you're seeing.

## Issues You're Experiencing

1. **403 Forbidden errors** - These occur because you're not authenticated
2. **StreamChat not available** - This happens when authentication fails
3. **Infinite re-render errors** - Fixed in the latest update

## Step-by-Step Setup

### 1. Create a Super Admin User

First, you need to create a super admin user in the database:

```bash
# Navigate to the backend directory
cd backend

# Create a super admin user
node create-super-admin.js
```

This will create a user with:
- Email: `admin@influmojo.com`
- Password: `admin123`
- User Type: `super_admin`

### 2. Generate a JWT Token

Once you have a super admin user, generate a JWT token:

```bash
# Generate a test JWT token
node test-auth.js
```

This will output a JWT token that you can use for authentication.

### 3. Login to the Admin Dashboard

1. Open the admin dashboard in your browser (usually `http://localhost:3000`)
2. You'll see a login form asking for a JWT token
3. Copy the token from step 2 and paste it into the text area
4. Click "Sign In"

### 4. Verify Authentication

After logging in, you should see:
- ✅ No more 403 Forbidden errors
- ✅ StreamChat authentication working
- ✅ Access to tickets, agents, and other admin features

## Troubleshooting

### Still Getting 403 Errors?

1. **Check if the backend is running:**
   ```bash
   cd backend
   npm start
   ```

2. **Verify the JWT token is valid:**
   - Make sure you copied the entire token
   - Check that the token hasn't expired (default: 1 hour)
   - Regenerate a new token if needed

3. **Check if the super admin user exists:**
   ```bash
   node create-super-admin.js
   ```

### StreamChat Issues?

1. **StreamChat requires authentication first**
   - Make sure you're logged in with a valid JWT token
   - StreamChat will automatically initialize after successful authentication

2. **If StreamChat still doesn't work:**
   - Check the browser console for specific error messages
   - Verify that the StreamChat API key is being retrieved successfully

### Database Issues?

1. **Make sure the database is running:**
   ```bash
   cd backend
   npx prisma db push
   ```

2. **Check database connection:**
   ```bash
   npx prisma studio
   ```

## API Endpoints

Once authenticated, you can access these endpoints:

- `GET /api/admin/agents` - List all agents
- `GET /api/crm/tickets` - List all tickets
- `GET /api/chat/token` - Get StreamChat token
- `POST /api/crm/tickets` - Create new ticket
- `PUT /api/crm/tickets/:id/status` - Update ticket status

## Development Notes

- The admin dashboard uses JWT tokens stored in `localStorage`
- Tokens expire after 1 hour by default
- StreamChat integration requires a valid JWT token
- All API requests automatically include the JWT token in the Authorization header

## Security Considerations

- JWT tokens should be kept secure
- Don't share tokens in public repositories
- Use environment variables for JWT secrets in production
- Regularly rotate JWT secrets

## Support

If you're still experiencing issues:

1. Check the browser console for error messages
2. Verify all services are running (backend, database)
3. Ensure you have the latest code changes
4. Check the network tab for failed API requests 