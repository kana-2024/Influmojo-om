# JWT Health Check & Debugger

A comprehensive JWT validation, format, and signature health check debugger for the Influmojo backend system.

## Features

✅ **Format Validation**: Checks JWT structure (3 parts, base64 encoding)  
✅ **Structure Analysis**: Decodes payload and validates required fields  
✅ **Signature Verification**: Verifies JWT signature with secret  
✅ **Expiration Checking**: Validates token expiration and age  
✅ **Detailed Reporting**: Comprehensive health status and recommendations  
✅ **Auto-save Reports**: Saves detailed JSON reports for analysis  

## Installation

The debugger requires the `jsonwebtoken` package which should already be installed in your backend:

```bash
cd backend
npm install jsonwebtoken
```

## Usage

### 1. Basic Usage

```bash
cd backend/tests
node jwt-health-check-debugger.js <JWT_TOKEN>
```

**Example:**
```bash
node jwt-health-check-debugger.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcl90eXBlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE2MzQ1Njc4OTB9.signature
```

### 2. Programmatic Usage

```javascript
const JWTHealthCheckDebugger = require('./jwt-health-check-debugger');

async function debugToken() {
  const debugger = new JWTHealthCheckDebugger();
  const results = await debugger.runHealthCheck(token, secret);
  console.log('Health Status:', results.overall);
}
```

## What It Checks

### 📋 Format Check
- Validates JWT has exactly 3 parts (header.payload.signature)
- Checks each part is properly base64 encoded
- Verifies no empty parts exist

### 🔍 Structure Check
- Decodes JWT payload without verification
- Validates required fields (userId, user_type)
- Checks token expiration and age
- Analyzes header algorithm and type

### 🔐 Signature Check
- Verifies JWT signature using JWT_SECRET
- Supports multiple algorithms (HS256, RS256, etc.)
- Provides specific error recommendations

## Output Example

```
🔍 JWT Health Check & Debugger Starting...

📋 Checking JWT Format...
✅ JWT format is valid

🔍 Checking JWT Structure...
✅ JWT structure is valid

🔐 Checking JWT Signature...
✅ JWT signature is valid

📊 JWT Health Check Report
============================================================
Overall Status: ✅ HEALTHY

📋 Format Check:
   Status: ✅ Valid
   header: ✅ (36 chars)
   payload: ✅ (89 chars)
   signature: ✅ (43 chars)

🔍 Structure Check:
   Status: ✅ Valid
   userId: 1
   user_type: super_admin
   email: NOT_FOUND
   iat: 2021-10-20T10:31:30.000Z
   exp: 2021-10-27T10:31:30.000Z
   iss: NOT_FOUND
   aud: NOT_FOUND
   Expiration: ✅ Valid (604800 seconds)

🔐 Signature Check:
   Status: ✅ Valid
   Algorithm: HS256

💾 Detailed report saved to: jwt-health-check-2021-10-20T10-31-30-000Z.json
```

## Environment Setup

The debugger automatically loads `JWT_SECRET` from your `.env.development` file. If not found, signature verification will be skipped.

**Required Environment Variable:**
```env
JWT_SECRET=your_jwt_secret_here
```

## Generated Reports

Each health check generates a timestamped JSON report with:
- Complete validation results
- Error details and recommendations
- Token metadata (first 20 chars for security)
- Timestamp of the check

**Report Location:** `backend/tests/jwt-health-check-{timestamp}.json`

## Common Issues & Solutions

### ❌ "Invalid JWT structure: expected 3 parts, got X"
- **Cause**: Malformed JWT token
- **Solution**: Ensure token follows `header.payload.signature` format

### ❌ "Token has expired"
- **Cause**: JWT expiration time has passed
- **Solution**: Generate a new token

### ❌ "Failed to decode JWT"
- **Cause**: Corrupted or invalid base64 encoding
- **Solution**: Check token source and regenerate if needed

### ❌ "JWT signature verification failed"
- **Cause**: Wrong JWT_SECRET or tampered token
- **Solution**: Verify JWT_SECRET matches the one used to sign the token

## Integration with Existing Tools

This debugger complements your existing JWT tools:
- **`generate-super-admin-jwt-simple.js`** - Generate tokens
- **`jwt-health-check-debugger.js`** - Validate and debug tokens

## Security Notes

- Tokens are only logged as first 20 characters in reports
- No sensitive data is stored in debug output
- Reports are saved locally in the tests directory
- JWT_SECRET is loaded from environment, not hardcoded

## Troubleshooting

### "Module not found: jsonwebtoken"
```bash
cd backend
npm install jsonwebtoken
```

### "Permission denied" when saving reports
```bash
# Ensure write permissions to tests directory
chmod 755 backend/tests
```

### Environment variables not loading
```bash
# Check if .env.development exists
ls -la backend/.env.development

# Verify JWT_SECRET is set
grep JWT_SECRET backend/.env.development
```

## Advanced Usage

### Custom Validation Rules
```javascript
const debugger = new JWTHealthCheckDebugger();

// Add custom validation
debugger.results.customChecks = {
  customField: payload.customField ? '✅ Found' : '❌ Missing'
};
```

### Batch Token Validation
```javascript
const tokens = ['token1', 'token2', 'token3'];
const results = [];

for (const token of tokens) {
  const debugger = new JWTHealthCheckDebugger();
  const result = await debugger.runHealthCheck(token, secret);
  results.push({ token: token.substring(0, 20), result });
}
```

## Support

For issues or questions about the JWT debugger:
1. Check the generated JSON report for detailed error information
2. Verify your JWT_SECRET is correctly set
3. Ensure tokens are properly formatted
4. Check console output for specific error messages
