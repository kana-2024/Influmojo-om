const AWS = require('aws-sdk');

/**
 * AWS Parameter Store Utility for Influmojo Backend
 * Handles loading sensitive environment variables from AWS Parameter Store
 */

class AWSParameterStore {
  constructor() {
    this.ssm = new AWS.SSM({ 
      region: process.env.AWS_REGION || 'us-east-1' 
    });
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Load a single parameter from AWS Parameter Store
   */
  async getParameter(paramName, useCache = true) {
    // Check cache first
    if (useCache && this.cache.has(paramName)) {
      const cached = this.cache.get(paramName);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.value;
      }
      this.cache.delete(paramName); // Expired
    }

    try {
      const response = await this.ssm.getParameter({
        Name: paramName,
        WithDecryption: true
      }).promise();
      
      const value = response.Parameter.Value;
      
      // Cache the value
      if (useCache) {
        this.cache.set(paramName, {
          value,
          timestamp: Date.now()
        });
      }
      
      return value;
    } catch (error) {
      console.error(`❌ Failed to load parameter ${paramName}:`, error.message);
      return null;
    }
  }

  /**
   * Load multiple parameters at once
   */
  async getParameters(paramNames) {
    const results = {};
    
    for (const paramName of paramNames) {
      const value = await this.getParameter(paramName);
      if (value) {
        // Extract environment variable name from parameter path
        const envVarName = paramName.split('/').pop().toUpperCase().replace(/-/g, '_');
        results[envVarName] = value;
      }
    }
    
    return results;
  }

  /**
   * Load all production environment variables
   */
  async loadProductionEnvVars() {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Not in production mode, skipping AWS Parameter Store');
      return {};
    }

    console.log('🔐 Loading production environment variables from AWS Parameter Store...');
    
    // Backend-specific parameters
    const parameters = [
      '/influmojo/production/JWT_SECRET',
      '/influmojo/production/JWT_SECRET_PREVIOUS',
      '/influmojo/production/DATABASE_URL',
      '/influmojo/production/GOOGLE_CLIENT_ID',
      '/influmojo/production/NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      '/influmojo/production/GOOGLE_CLIENT_SECRET',
      '/influmojo/production/GOOGLE_CALLBACK_URL',
      '/influmojo/production/NEXT_PUBLIC_WEBAPP_URL',
      '/influmojo/production/FACEBOOK_APP_SECRET',
      '/influmojo/production/STREAM_API_SECRET',
      '/influmojo/production/TWILIO_ACCOUNT_SID',
      '/influmojo/production/TWILIO_AUTH_TOKEN',
      '/influmojo/production/TWILIO_VERIFY_SERVICE_SID',
      '/influmojo/production/SENDGRID_API_KEY',
      '/influmojo/production/ZOHO_CLIENT_ID',
      '/influmojo/production/ZOHO_CLIENT_SECRET',
      '/influmojo/production/ZOHO_REFRESH_TOKEN',
      '/influmojo/production/CLOUDINARY_CLOUD_NAME',
      '/influmojo/production/CLOUDINARY_API_KEY',
      '/influmojo/production/CLOUDINARY_API_SECRET'
    ];

    const loadedVars = await this.getParameters(parameters);
    
    // Set environment variables
    Object.entries(loadedVars).forEach(([key, value]) => {
      process.env[key] = value;
    });

    console.log(`✅ Loaded ${Object.keys(loadedVars).length} parameters from AWS Parameter Store`);
    return loadedVars;
  }

  /**
   * Validate required environment variables
   */
  validateRequiredVars(requiredVars) {
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️  AWS Parameter Store cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
const awsParameterStore = new AWSParameterStore();
module.exports = awsParameterStore;
