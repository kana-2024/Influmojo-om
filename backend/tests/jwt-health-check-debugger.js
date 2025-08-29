const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class JWTHealthCheckDebugger {
  constructor() {
    this.results = {
      overall: 'PENDING',
      format: {},
      structure: {},
      signature: {},
      recommendations: []
    };
  }

  /**
   * Main health check function
   */
  async runHealthCheck(token, secret = null) {
    console.log('🔍 JWT Health Check & Debugger Starting...\n');
    
    try {
      // Check if token is provided
      if (!token) {
        throw new Error('No JWT token provided');
      }

      // Run all checks
      await this.checkFormat(token);
      await this.checkStructure(token);
      await this.checkSignature(token, secret);
      
      // Generate final report
      this.generateReport();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.results.overall = 'FAILED';
      this.results.recommendations.push(`Critical Error: ${error.message}`);
      this.generateReport();
      return this.results;
    }
  }

  /**
   * Check JWT format and basic structure
   */
  async checkFormat(token) {
    console.log('📋 Checking JWT Format...');
    
    try {
      // Check if token is a string
      if (typeof token !== 'string') {
        this.results.format.valid = false;
        this.results.format.errors = ['Token is not a string'];
        this.results.recommendations.push('Ensure token is a valid string');
        return;
      }

      // Check if token has 3 parts separated by dots
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        this.results.format.valid = false;
        this.results.format.errors = [`Invalid JWT structure: expected 3 parts, got ${parts.length}`];
        this.results.recommendations.push('JWT must have exactly 3 parts: header.payload.signature');
        return;
      }

      // Check each part
      const [header, payload, signature] = parts;
      
      // Check header
      if (!header || header.length === 0) {
        this.results.format.errors = this.results.format.errors || [];
        this.results.format.errors.push('Header is empty');
      }

      // Check payload
      if (!payload || payload.length === 0) {
        this.results.format.errors = this.results.format.errors || [];
        this.results.format.errors.push('Payload is empty');
      }

      // Check signature
      if (!signature || signature.length === 0) {
        this.results.format.errors = this.results.format.errors || [];
        this.results.format.errors.push('Signature is empty');
      }

      // Check if parts are base64 encoded
      const headerValid = this.isValidBase64(header);
      const payloadValid = this.isValidBase64(payload);
      const signatureValid = this.isValidBase64(signature);

      this.results.format.valid = !this.results.format.errors && headerValid && payloadValid && signatureValid;
      this.results.format.parts = {
        header: { valid: headerValid, length: header.length },
        payload: { valid: payloadValid, length: payload.length },
        signature: { valid: signatureValid, length: signature.length }
      };

      if (this.results.format.valid) {
        console.log('✅ JWT format is valid');
      } else {
        console.log('❌ JWT format issues found');
        this.results.recommendations.push('Fix JWT format issues before proceeding');
      }

    } catch (error) {
      this.results.format.valid = false;
      this.results.format.errors = [error.message];
      console.log('❌ Format check failed:', error.message);
    }
  }

  /**
   * Check JWT structure and decode payload
   */
  async checkStructure(token) {
    console.log('\n🔍 Checking JWT Structure...');
    
    try {
      // Decode without verification
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded) {
        this.results.structure.valid = false;
        this.results.structure.errors = ['Failed to decode JWT'];
        this.results.recommendations.push('Token may be corrupted or invalid');
        return;
      }

      const { header, payload } = decoded;

      // Check header structure
      this.results.structure.header = {
        alg: header.alg || 'NOT_FOUND',
        typ: header.typ || 'NOT_FOUND',
        kid: header.kid || 'NOT_FOUND'
      };

      // Check payload structure
      this.results.structure.payload = {
        userId: payload.userId || 'NOT_FOUND',
        user_type: payload.user_type || 'NOT_FOUND',
        email: payload.email || 'NOT_FOUND',
        iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'NOT_FOUND',
        exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'NOT_FOUND',
        iss: payload.iss || 'NOT_FOUND',
        aud: payload.aud || 'NOT_FOUND'
      };

      // Check for required fields
      const requiredFields = ['userId', 'user_type'];
      const missingFields = requiredFields.filter(field => !payload[field]);
      
      if (missingFields.length > 0) {
        this.results.structure.errors = [`Missing required fields: ${missingFields.join(', ')}`];
        this.results.recommendations.push(`Add missing required fields: ${missingFields.join(', ')}`);
      }

      // Check expiration
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < now;
        
        this.results.structure.expiration = {
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          isExpired,
          timeRemaining: isExpired ? 'EXPIRED' : `${payload.exp - now} seconds`
        };

        if (isExpired) {
          this.results.structure.errors = this.results.structure.errors || [];
          this.results.structure.errors.push('Token has expired');
          this.results.recommendations.push('Generate a new token');
        }
      }

      // Check issued at time
      if (payload.iat) {
        const now = Math.floor(Date.now() / 1000);
        const issuedAt = new Date(payload.iat * 1000).toISOString();
        const age = now - payload.iat;
        
        this.results.structure.issuedAt = {
          timestamp: issuedAt,
          age: `${age} seconds`,
          ageHours: `${(age / 3600).toFixed(2)} hours`
        };
      }

      this.results.structure.valid = !this.results.structure.errors;
      
      if (this.results.structure.valid) {
        console.log('✅ JWT structure is valid');
      } else {
        console.log('❌ JWT structure issues found');
      }

    } catch (error) {
      this.results.structure.valid = false;
      this.results.structure.errors = [error.message];
      console.log('❌ Structure check failed:', error.message);
    }
  }

  /**
   * Check JWT signature validity
   */
  async checkSignature(token, secret) {
    console.log('\n🔐 Checking JWT Signature...');
    
    try {
      if (!secret) {
        this.results.signature.valid = false;
        this.results.signature.errors = ['No secret provided for signature verification'];
        this.results.signature.recommendations = ['Provide JWT_SECRET for signature verification'];
        console.log('⚠️  No secret provided - skipping signature verification');
        return;
      }

      // Verify signature
      const verified = jwt.verify(token, secret, { 
        algorithms: ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'],
        ignoreExpiration: true // We already checked expiration in structure
      });

      this.results.signature.valid = true;
      this.results.signature.algorithm = verified.alg || 'UNKNOWN';
      this.results.signature.verified = true;
      
      console.log('✅ JWT signature is valid');

    } catch (error) {
      this.results.signature.valid = false;
      this.results.signature.errors = [error.message];
      
      if (error.name === 'JsonWebTokenError') {
        this.results.signature.recommendations = [
          'Check if JWT_SECRET is correct',
          'Verify the token was signed with the same secret',
          'Ensure the token hasn\'t been tampered with'
        ];
      } else if (error.name === 'TokenExpiredError') {
        this.results.signature.recommendations = [
          'Token has expired - generate a new one',
          'Check server clock synchronization'
        ];
      } else if (error.name === 'NotBeforeError') {
        this.results.signature.recommendations = [
          'Token is not yet valid - check server clock',
          'Verify token creation time'
        ];
      }

      console.log('❌ JWT signature verification failed:', error.message);
    }
  }

  /**
   * Generate comprehensive health report
   */
  generateReport() {
    console.log('\n📊 JWT Health Check Report');
    console.log('=' .repeat(60));

    // Overall status
    const allChecksPassed = this.results.format.valid && 
                           this.results.structure.valid && 
                           (this.results.signature.valid || !this.results.signature.errors);

    this.results.overall = allChecksPassed ? 'HEALTHY' : 'UNHEALTHY';

    console.log(`Overall Status: ${this.results.overall === 'HEALTHY' ? '✅ HEALTHY' : '❌ UNHEALTHY'}\n`);

    // Format check results
    console.log('📋 Format Check:');
    console.log(`   Status: ${this.results.format.valid ? '✅ Valid' : '❌ Invalid'}`);
    if (this.results.format.parts) {
      Object.entries(this.results.format.parts).forEach(([part, info]) => {
        console.log(`   ${part}: ${info.valid ? '✅' : '❌'} (${info.length} chars)`);
      });
    }
    if (this.results.format.errors) {
      this.results.format.errors.forEach(error => console.log(`   ❌ ${error}`));
    }

    // Structure check results
    console.log('\n🔍 Structure Check:');
    console.log(`   Status: ${this.results.structure.valid ? '✅ Valid' : '❌ Invalid'}`);
    if (this.results.structure.payload) {
      Object.entries(this.results.structure.payload).forEach(([field, value]) => {
        console.log(`   ${field}: ${value}`);
      });
    }
    if (this.results.structure.expiration) {
      const exp = this.results.structure.expiration;
      console.log(`   Expiration: ${exp.isExpired ? '❌ EXPIRED' : '✅ Valid'} (${exp.timeRemaining})`);
    }
    if (this.results.structure.errors) {
      this.results.structure.errors.forEach(error => console.log(`   ❌ ${error}`));
    }

    // Signature check results
    console.log('\n🔐 Signature Check:');
    if (this.results.signature.errors && this.results.signature.errors.includes('No secret provided')) {
      console.log('   Status: ⚠️  Skipped (no secret provided)');
    } else {
      console.log(`   Status: ${this.results.signature.valid ? '✅ Valid' : '❌ Invalid'}`);
      if (this.results.signature.algorithm) {
        console.log(`   Algorithm: ${this.results.signature.algorithm}`);
      }
    }
    if (this.results.signature.errors) {
      this.results.signature.errors.forEach(error => console.log(`   ❌ ${error}`));
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    // Save report to file
    this.saveReport();
  }

  /**
   * Save detailed report to JSON file
   */
  saveReport() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `jwt-health-check-${timestamp}.json`;
      const reportPath = path.join(__dirname, filename);
      
      const reportData = {
        timestamp: new Date().toISOString(),
        token: this.results.token ? this.results.token.substring(0, 20) + '...' : 'NOT_PROVIDED',
        results: this.results
      };

      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
      console.log(`\n💾 Detailed report saved to: ${filename}`);
      
    } catch (error) {
      console.log('\n⚠️  Could not save report to file:', error.message);
    }
  }

  /**
   * Check if string is valid base64
   */
  isValidBase64(str) {
    try {
      // Add padding if needed
      while (str.length % 4 !== 0) {
        str += '=';
      }
      
      // Try to decode
      Buffer.from(str, 'base64');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load environment variables
   */
  loadEnvironment() {
    try {
      const envPath = path.join(__dirname, '..', '.env.development');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
        if (jwtSecretMatch) {
          return jwtSecretMatch[1].trim();
        }
      }
    } catch (error) {
      console.log('⚠️  Could not load environment file:', error.message);
    }
    return null;
  }
}

// Main execution function
async function main() {
  const debugger = new JWTHealthCheckDebugger();
  
  // Get token from command line arguments
  const token = process.argv[2];
  
  if (!token) {
    console.log('❌ Usage: node jwt-health-check-debugger.js <JWT_TOKEN>');
    console.log('   Example: node jwt-health-check-debugger.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    process.exit(1);
  }

  // Load JWT secret from environment
  const secret = debugger.loadEnvironment();
  
  if (!secret) {
    console.log('⚠️  JWT_SECRET not found in environment - signature verification will be skipped\n');
  }

  // Run health check
  await debugger.runHealthCheck(token, secret);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = JWTHealthCheckDebugger;
