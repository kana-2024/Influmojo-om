const express = require('express');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/client');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateJWT } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Request deduplication cache (in-memory)
const pendingRequests = new Map();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Generate JWT token
const generateToken = (userId, userType = 'creator') => {
  return jwt.sign(
    { userId: userId.toString(), user_type: userType, iat: Date.now() },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '7d' }
  );
};

// Email/Password login endpoint
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user has password_hash (email/password auth)
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'This account uses a different authentication method. Please use Google or phone login.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active. Please contact support.'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    // Generate JWT token
    const token = generateToken(user.id, user.user_type);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        profileImage: user.profile_image_url,
        cover_image_url: user.cover_image_url,
        isVerified: user.email_verified,
        user_type: user.user_type,
        status: user.status
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
}));

// Clean up old OTP records periodically (every 5 minutes)
let cleanupInterval;
if (process.env.NODE_ENV !== 'production') {
  cleanupInterval = setInterval(async () => {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const deletedRecords = await prisma.phoneVerification.deleteMany({
        where: {
          created_at: {
            lt: tenMinutesAgo
          }
        }
      });
      
      if (deletedRecords.count > 0) {
        console.log(`🧹 Auto-cleanup: Deleted ${deletedRecords.count} old OTP records`);
      }
    } catch (error) {
      console.error('Auto-cleanup error:', error);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
}

// Google OAuth for mobile
router.post('/google-mobile', [
  body('idToken').notEmpty().withMessage('ID token is required'),
  body('isSignup').optional().isBoolean().withMessage('isSignup must be a boolean'),
  body('userType').optional().isIn(['creator', 'brand']).withMessage('userType must be creator or brand')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { idToken, isSignup = false, userType = 'creator' } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists with Google auth provider
    let user = await prisma.user.findFirst({
      where: {
        email: email,
        auth_provider: 'google'
      }
    });

    // Also check if user exists with different auth provider
    let existingUserWithDifferentProvider = null;
    if (!user) {
      existingUserWithDifferentProvider = await prisma.user.findFirst({
        where: {
          email: email,
          auth_provider: { not: 'google' }
        }
      });
    }

    let isNewUser = false;

    if (!user) {
      if (existingUserWithDifferentProvider) {
        // User exists with different auth provider (e.g., phone)
        if (isSignup) {
          // Update the existing user to use Google auth provider
          user = await prisma.user.update({
            where: { id: existingUserWithDifferentProvider.id },
            data: {
              auth_provider: 'google',
              profile_image_url: picture,
              email_verified: true,
              last_login_at: new Date()
            }
          });
          isNewUser = false;
        } else {
          // Login - update the existing user
          user = await prisma.user.update({
            where: { id: existingUserWithDifferentProvider.id },
            data: {
              auth_provider: 'google',
              profile_image_url: picture,
              email_verified: true,
              last_login_at: new Date()
            }
          });
          isNewUser = false;
        }
      } else {
        // No user exists at all
        if (isSignup) {
          // Create new user for signup
          user = await prisma.user.create({
            data: {
              email,
              name,
              profile_image_url: picture,
              auth_provider: 'google',
              email_verified: true,
              user_type: userType, // Use the userType from request
              status: 'active'
            }
          });
          isNewUser = true;
        } else {
          // User doesn't exist but this is a login attempt
          return res.status(404).json({
            success: false,
            error: 'No account found with this Google account. Please sign up first.',
            userExists: false
          });
        }
      }
    } else {
      // User exists with Google auth provider
      if (isSignup) {
        // User exists but this is a signup attempt
        return res.status(409).json({
          success: false,
          error: 'An account with this Google account already exists. Please log in instead.',
          userExists: true
        });
      } else {
        // Update existing user for login
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            last_login_at: new Date(),
            profile_image_url: picture,
            email_verified: true
          }
        });
        isNewUser = false;
      }
    }

    // Generate JWT token
    const token = generateToken(user.id, user.user_type);

    res.json({
      success: true,
      message: 'Google authentication successful',
      userExists: !isNewUser, // true if user existed before, false if newly created
      isNewUser: isNewUser,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        profileImage: user.profile_image_url,
        cover_image_url: user.cover_image_url,
        isVerified: user.email_verified,
        user_type: user.user_type
      },
      token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      error: 'Google authentication failed',
      message: error.message 
    });
  }
}));

// Google OAuth endpoint (alias for google-mobile)
router.post('/google', [
  body('idToken').notEmpty().withMessage('ID token is required'),
  body('isSignup').optional().isBoolean().withMessage('isSignup must be a boolean'),
  body('userType').optional().isIn(['creator', 'brand']).withMessage('userType must be creator or brand')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { idToken, isSignup = false, userType = 'creator' } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists with Google auth provider
    let user = await prisma.user.findFirst({
      where: {
        email: email,
        auth_provider: 'google'
      }
    });

    // Also check if user exists with different auth provider
    let existingUserWithDifferentProvider = null;
    if (!user) {
      existingUserWithDifferentProvider = await prisma.user.findFirst({
        where: {
          email: email,
          auth_provider: { not: 'google' }
        }
      });
    }

    let isNewUser = false;

    if (!user) {
      if (existingUserWithDifferentProvider) {
        // User exists with different auth provider (e.g., phone)
        if (isSignup) {
          // Update the existing user to use Google auth provider
          user = await prisma.user.update({
            where: { id: existingUserWithDifferentProvider.id },
            data: {
              auth_provider: 'google',
              profile_image_url: picture,
              email_verified: true,
              last_login_at: new Date()
            }
          });
          isNewUser = false;
        } else {
          // Login - update the existing user
          user = await prisma.user.update({
            where: { id: existingUserWithDifferentProvider.id },
            data: {
              auth_provider: 'google',
              profile_image_url: picture,
              email_verified: true,
              last_login_at: new Date()
            }
          });
          isNewUser = false;
        }
      } else {
        // No user exists at all
        if (isSignup) {
          // Create new user for signup
          user = await prisma.user.create({
            data: {
              email,
              name,
              profile_image_url: picture,
              auth_provider: 'google',
              email_verified: true,
              user_type: userType, // Use the userType from request
              status: 'active'
            }
          });
          isNewUser = true;
        } else {
          // User doesn't exist but this is a login attempt
          return res.status(404).json({
            success: false,
            error: 'No account found with this Google account. Please sign up first.',
            userExists: false
          });
        }
      }
    } else {
      // User exists with Google auth provider
      if (isSignup) {
        // User exists but this is a signup attempt
        return res.status(409).json({
          success: false,
          error: 'Account already exists with this Google account. Please log in.',
          userExists: true
        });
      } else {
        // Login - update last login
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            last_login_at: new Date(),
            profile_image_url: picture,
            email_verified: true
          }
        });
        isNewUser = false;
      }
    }

    // Generate JWT token
    const token = generateToken(user.id, user.user_type);

    res.json({
      success: true,
      message: 'Google authentication successful',
      userExists: !isNewUser, // true if user existed before, false if newly created
      isNewUser: isNewUser,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        profileImage: user.profile_image_url,
        cover_image_url: user.cover_image_url,
        isVerified: user.email_verified,
        user_type: user.user_type
      },
      token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      error: 'Google authentication failed',
      message: error.message 
    });
  }
}));

// Development endpoint to disable rate limiting (only in development)
if (process.env.NODE_ENV !== 'production') {
  router.post('/disable-rate-limit', async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      
      // Delete all OTP records for this phone
      const deletedRecords = await prisma.phoneVerification.deleteMany({
        where: { phone }
      });
      
      console.log(`🧹 Development: Disabled rate limit for ${phone} by deleting ${deletedRecords.count} records`);
      
      res.json({
        success: true,
        message: `Rate limit disabled for ${phone}`,
        deletedCount: deletedRecords.count
      });
    } catch (error) {
      console.error('Error disabling rate limit:', error);
      res.status(500).json({ error: 'Failed to disable rate limit' });
    }
  });
}

// Development endpoint to clear OTP records (only in development)
if (process.env.NODE_ENV !== 'production') {
  router.delete('/clear-otp/:phone', async (req, res) => {
    try {
      const { phone } = req.params;
      
      const deletedRecords = await prisma.phoneVerification.deleteMany({
        where: { phone }
      });
      
      console.log(`🧹 Development: Cleared ${deletedRecords.count} OTP records for ${phone}`);
      
      res.json({
        success: true,
        message: `Cleared ${deletedRecords.count} OTP records for ${phone}`,
        deletedCount: deletedRecords.count
      });
    } catch (error) {
      console.error('Error clearing OTP records:', error);
      res.status(500).json({ error: 'Failed to clear OTP records' });
    }
  });
}

// Send phone verification code
router.post('/send-phone-verification-code', [
  body('phone').isMobilePhone().withMessage('Valid phone number is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Check for duplicate requests
    if (pendingRequests.has(phone)) {
      const existingPromise = pendingRequests.get(phone);
      const result = await existingPromise;
      return res.json(result);
    }
    
    // Create a promise for this request
    const requestPromise = (async () => {
      try {
        // Check for recent OTP requests to prevent spam
        const rateLimitWindow = process.env.NODE_ENV === 'production' ? 60 * 1000 : 10 * 1000; // 10 seconds in dev, 60 in prod
        
        // Check for recent verification attempts
        const recentVerification = await prisma.phoneVerification.findFirst({
          where: {
            phone,
            created_at: {
              gte: new Date(Date.now() - rateLimitWindow)
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        });
        
        if (recentVerification) {
          const timeElapsed = Date.now() - recentVerification.created_at.getTime();
          const timeRemaining = Math.ceil((rateLimitWindow - timeElapsed) / 1000); // seconds remaining
          
          // In development, allow bypassing rate limit with a special flag
          if (process.env.NODE_ENV !== 'production' && req.headers['x-bypass-rate-limit'] === 'true') {
            // Allow bypass in development
          } else if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_RATE_LIMIT === 'true') {
            // Allow bypass in development
          } else if (process.env.NODE_ENV !== 'production' && process.env.DEV_MODE === 'true') {
            // Allow bypass in development
          } else {
            return {
              status: 429,
              data: {
                error: 'Rate limit exceeded',
                message: `Please wait ${timeRemaining} seconds before requesting another code.`,
                timeRemaining
              }
            };
          }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Generate unique token
        const token = require('crypto').randomBytes(32).toString('hex');
        
        // Store OTP in database
        const verificationRecord = await prisma.phoneVerification.create({
          data: {
            phone,
            code: otp,
            token,
            expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          }
        });

        // Send SMS using Twilio Verify (if configured)
        let smsSent = false;
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
          const twilio = require('twilio')(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );

          try {
            await twilio.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
              .verifications.create({
                to: phone,
                channel: 'sms'
              });
            console.log(`📱 Verification SMS sent to ${phone}`);
            smsSent = true;
          } catch (smsError) {
            console.error('SMS sending failed:', smsError);
            
            // Handle rate limiting specifically
            if (smsError.status === 429) {
              console.log(`📱 Twilio rate limit hit for ${phone}. OTP: ${otp} (check console for development)`);
              console.log(`Please wait before requesting another code or upgrade your Twilio plan`);
            } else {
              console.log(`📱 OTP for ${phone}: ${otp} (SMS failed, using console log)`);
            }
          }
        } else {
          // Development mode - just log the OTP
          console.log(`🔧 Development OTP for ${phone}: ${otp} (Twilio not configured)`);
        }

        return {
          status: 200,
          data: {
            success: true,
            message: 'Verification code sent successfully',
            phone,
            // Include OTP in development mode for testing
            ...(process.env.NODE_ENV !== 'production' && { otp })
          }
        };

      } catch (error) {
        console.error('❌ Send OTP error:', error);
        return {
          status: 500,
          data: { 
            error: 'Failed to send verification code',
            message: error.message 
          }
        };
      }
    })();

    // Store the promise in the cache
    pendingRequests.set(phone, requestPromise);
    
    // Wait for the result
    const result = await requestPromise;
    
    // Remove from cache after a delay to prevent immediate duplicates
    setTimeout(() => {
      pendingRequests.delete(phone);
    }, 5000); // 5 second delay
    
    // Return the appropriate response
    if (result.status === 429) {
      return res.status(429).json(result.data);
    } else if (result.status === 500) {
      return res.status(500).json(result.data);
    } else {
      return res.json(result.data);
    }

  } catch (error) {
    console.error('❌ Outer OTP error:', error);
    res.status(500).json({ 
      error: 'Failed to send verification code',
      message: error.message 
    });
  }
}));

// Verify phone code
router.post('/verify-phone-code', [
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('6-digit code is required'),
  body('fullName').optional().isString().withMessage('Full name must be a string'),
  body('userType').optional().isIn(['creator', 'brand']).withMessage('userType must be creator or brand')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { phone, code, fullName, userType = 'creator' } = req.body;

    // Check for authenticated user (JWT in Authorization header)
    let authUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        authUserId = decoded.userId;
      } catch (err) {
        // Invalid token, ignore
      }
    }

    // Verify with Twilio Verify (if configured)
    let twilioVerification = false;
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      try {
        const verificationCheck = await twilio.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({
            to: phone,
            code: code
          });

        if (verificationCheck.status === 'approved') {
          twilioVerification = true;
          console.log('✅ Twilio verification successful for:', phone);
        } else {
          console.log('❌ Twilio verification failed - status:', verificationCheck.status);
          return res.status(400).json({ 
            error: 'Invalid verification code' 
          });
        }
      } catch (verifyError) {
        console.error('❌ Twilio verification failed:', verifyError.message);
        console.error('❌ Twilio error code:', verifyError.code);
        console.error('❌ Twilio error status:', verifyError.status);
        
        // If Twilio fails (rate limit, auth error, etc.), fall back to database verification
        if (verifyError.status === 429) {
          console.log('⚠️ Twilio rate limit hit, falling back to database verification');
        } else if (verifyError.status === 401) {
          console.log('⚠️ Twilio authentication error, falling back to database verification');
        } else {
          console.log('⚠️ Twilio verification error, falling back to database verification');
        }
      }
    } else {
      console.log('ℹ️ Twilio not configured, using database verification');
    }
    
    // If Twilio verification failed or not configured, use database verification
    if (!twilioVerification) {
      console.log('🔍 Using database verification for:', phone);
      // Fallback to database verification for development
      const verification = await prisma.phoneVerification.findFirst({
        where: {
          phone,
          code,
          expires_at: { gt: new Date() },
          verified_at: null
        },
        orderBy: { created_at: 'desc' }
      });

      if (!verification) {
        console.log('❌ No valid verification found for:', phone, 'code:', code);
        return res.status(400).json({ 
          error: 'Invalid or expired verification code' 
        });
      }

      console.log('✅ Database verification successful for:', phone);
      // Mark as verified
      await prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { verified_at: new Date() }
      });
    }

    // Check if user exists with this phone
    let userWithPhone = await prisma.user.findUnique({ where: { phone } });

    if (authUserId) {
      // First check if the user with authUserId actually exists
      const existingUser = await prisma.user.findUnique({
        where: { id: BigInt(authUserId) }
      });

      if (!existingUser) {
        console.log('[verify-phone-code] User with authUserId not found:', authUserId);
        // If the authenticated user doesn't exist, treat this as a new user creation
        if (userWithPhone) {
          console.log('[verify-phone-code] Phone number already in use by another account.');
          return res.status(409).json({ error: 'Phone number already in use by another account.' });
        }
        
        console.log('[verify-phone-code] Creating new user with phone:', phone);
        user = await prisma.user.create({
          data: {
            phone,
            phone_verified: true,
            user_type: userType,
            status: 'active',
            name: fullName || 'User'
          }
        });
        console.log('[verify-phone-code] Created new user ID:', user.id);
      } else {
        // If authenticated, update the current user with the phone number
        // If another user already has this phone, handle the conflict
        if (userWithPhone && userWithPhone.id !== BigInt(authUserId)) {
          console.log('[verify-phone-code] Phone number already in use by another account.');
          return res.status(409).json({ error: 'Phone number already in use by another account.' });
        }
        user = await prisma.user.update({
          where: { id: BigInt(authUserId) },
          data: {
            phone,
            phone_verified: true,
            last_login_at: new Date(),
            ...(fullName && { name: fullName }),
          }
        });
        console.log('[verify-phone-code] Updated user ID:', user.id, 'User data:', { id: user.id.toString(), phone: user.phone, name: user.name, email: user.email });
      }
    } else if (!userWithPhone) {
      console.log('[verify-phone-code] Creating new user with phone:', phone);
      // Create new user with full name
      user = await prisma.user.create({
        data: {
          phone,
          phone_verified: true,
          user_type: userType, // Use the userType from request
          status: 'active',
          name: fullName || 'User' // Use provided full name or default
        }
      });
      console.log('[verify-phone-code] Created new user ID:', user.id);
    } else {
      console.log('[verify-phone-code] Updating existing phone user ID:', userWithPhone.id);
      // Update existing user (phone login)
      user = await prisma.user.update({
        where: { id: userWithPhone.id },
        data: {
          phone_verified: true,
          last_login_at: new Date(),
          ...(fullName && { name: fullName }) // Update name if provided
        }
      });
      console.log('[verify-phone-code] Updated existing user ID:', user.id);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.user_type);

    res.json({
      success: true,
      message: 'Phone verification successful',
      user: {
        id: user.id.toString(),
        phone: user.phone,
        name: user.name,
        profileImage: user.profile_image_url,
        cover_image_url: user.cover_image_url,
        isVerified: user.phone_verified,
        user_type: user.user_type // Add user_type to response
      },
      token
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      error: 'Phone verification failed',
      message: error.message 
    });
  }
}));

// Update user name (for phone signup flow)
router.post('/update-name', [
  body('name').notEmpty().withMessage('Name is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { name }
    });

    res.json({
      success: true,
      message: 'Name updated successfully',
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profile_image_url,
        cover_image_url: user.cover_image_url
      }
    });

  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({ 
      error: 'Failed to update name',
      message: error.message 
    });
  }
}));

// Get user profile
router.get('/profile', asyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        profileImage: user.profile_image_url,
        cover_image_url: user.cover_image_url,
        isVerified: user.email_verified || user.phone_verified,
        userType: user.user_type,
        status: user.status,
        auth_provider: user.auth_provider
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}));

// Get current user information
router.get('/me', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const userId = BigInt(req.user.id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        user_type: true,
        profile_image_url: true,
        cover_image_url: true,
        status: true,
        created_at: true,
        last_login_at: true,
        email_verified: true,
        phone_verified: true,
        onboarding_completed: true,
        onboarding_step: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          user_type: user.user_type,
          profile_image_url: user.profile_image_url,
          cover_image_url: user.cover_image_url,
          status: user.status,
          created_at: user.created_at,
          last_login_at: user.last_login_at,
          email_verified: user.email_verified,
          phone_verified: user.phone_verified,
          onboarding_completed: user.onboarding_completed,
          onboarding_step: user.onboarding_step
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information',
      message: error.message
    });
  }
}));

// Get all users (admin/developer endpoint)
router.get('/users', asyncHandler(async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        auth_provider: true,
        email_verified: true,
        phone_verified: true,
        user_type: true,
        status: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedUsers = users.map(user => ({
      ...user,
      id: user.id.toString()
    }));

    res.json({
      success: true,
      users: serializedUsers
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      message: error.message 
    });
  }
}));

// Delete user (admin/developer endpoint)
router.delete('/delete-user', [
  body('userId').notEmpty().withMessage('User ID is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    const userIdBigInt = BigInt(userId);

    console.log('🗑️ Attempting to delete user:', userId, 'BigInt:', userIdBigInt.toString());

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userIdBigInt }
    });

    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
      auth_provider: user.auth_provider
    });

    // Delete related data first (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete phone verifications
      if (user.phone) {
        await tx.phoneVerification.deleteMany({
          where: { phone: user.phone }
        });
      }

      // Delete notifications
      await tx.notification.deleteMany({
        where: { user_id: userIdBigInt }
      });

      // Delete messages sent by user
      await tx.message.deleteMany({
        where: { sender_id: userIdBigInt }
      });

      // Delete reviews where user is reviewer
      await tx.review.deleteMany({
        where: { reviewer_id: userIdBigInt }
      });

      // Delete reviews where user is reviewed
      await tx.review.deleteMany({
        where: { reviewed_id: userIdBigInt }
      });

      // Delete payments where user is payer
      await tx.payment.deleteMany({
        where: { payer_id: userIdBigInt }
      });

      // Delete payments where user is payee
      await tx.payment.deleteMany({
        where: { payee_id: userIdBigInt }
      });

      // Delete packages where user is admin
      await tx.package.deleteMany({
        where: { admin_id: userIdBigInt }
      });

      // Delete content reviews where user is reviewer
      await tx.contentReview.deleteMany({
        where: { reviewer_id: userIdBigInt }
      });

      // Delete content submissions where user is admin
      await tx.contentSubmission.deleteMany({
        where: { admin_id: userIdBigInt }
      });

      // Delete collaboration channels where user is admin
      await tx.collaborationChannel.deleteMany({
        where: { admin_id: userIdBigInt }
      });

      // Delete KYC verifications where user is verifier
      await tx.kYC.deleteMany({
        where: { verified_by: userIdBigInt }
      });

      // Delete creator profile and related data
      if (user.user_type === 'creator') {
        const creatorProfile = await tx.creatorProfile.findUnique({
          where: { user_id: userIdBigInt }
        });

        if (creatorProfile) {
          // Delete portfolio items
          await tx.portfolioItem.deleteMany({
            where: { creator_id: creatorProfile.id }
          });

          // Delete social media accounts
          await tx.socialMediaAccount.deleteMany({
            where: { creator_id: creatorProfile.id }
          });

          // Delete packages
          await tx.package.deleteMany({
            where: { creator_id: creatorProfile.id }
          });

          // Delete KYC
          await tx.kYC.deleteMany({
            where: { creator_id: creatorProfile.id }
          });

          // Delete campaign applications
          await tx.campaignApplication.deleteMany({
            where: { creator_id: creatorProfile.id }
          });

          // Delete collaborations
          await tx.collaboration.deleteMany({
            where: { creator_id: creatorProfile.id }
          });

          // Delete invoices
          await tx.invoice.deleteMany({
            where: { creator_id: creatorProfile.id }
          });

          // Delete creator profile
          await tx.creatorProfile.delete({
            where: { id: creatorProfile.id }
          });
        }
      }

      // Delete brand profile and related data
      if (user.user_type === 'brand') {
        const brandProfile = await tx.brandProfile.findUnique({
          where: { user_id: userIdBigInt }
        });

        if (brandProfile) {
          // Delete campaigns
          await tx.campaign.deleteMany({
            where: { brand_id: brandProfile.id }
          });

          // Delete collaborations
          await tx.collaboration.deleteMany({
            where: { brand_id: brandProfile.id }
          });

          // Delete invoices
          await tx.invoice.deleteMany({
            where: { brand_id: brandProfile.id }
          });

          // Delete brand profile
          await tx.brandProfile.delete({
            where: { id: brandProfile.id }
          });
        }
      }

      // Finally delete the user
      await tx.user.delete({
        where: { id: userIdBigInt }
      });
    });

    console.log('✅ User deleted successfully:', userId);
    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: 'Failed to delete user',
      message: error.message 
    });
  }
}));

// Delete user by phone number (admin/developer endpoint)
router.delete('/delete-user-by-phone', [
  body('phone').notEmpty().withMessage('Phone number is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { phone } = req.body;
    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found with this phone number' });
    }
    const userIdBigInt = BigInt(user.id);
    // Delete related data (reuse logic from /delete-user)
    await prisma.$transaction(async (tx) => {
      if (user.phone) {
        await tx.phoneVerification.deleteMany({ where: { phone: user.phone } });
      }
      await tx.notification.deleteMany({ where: { user_id: userIdBigInt } });
      await tx.message.deleteMany({ where: { sender_id: userIdBigInt } });
      await tx.review.deleteMany({ where: { reviewer_id: userIdBigInt } });
      await tx.review.deleteMany({ where: { reviewed_id: userIdBigInt } });
      await tx.payment.deleteMany({ where: { payer_id: userIdBigInt } });
      await tx.payment.deleteMany({ where: { payee_id: userIdBigInt } });
      await tx.package.deleteMany({ where: { admin_id: userIdBigInt } });
      await tx.contentReview.deleteMany({ where: { reviewer_id: userIdBigInt } });
      await tx.contentSubmission.deleteMany({ where: { admin_id: userIdBigInt } });
      await tx.collaborationChannel.deleteMany({ where: { admin_id: userIdBigInt } });
      await tx.kYC.deleteMany({ where: { verified_by: userIdBigInt } });
      if (user.user_type === 'creator') {
        const creatorProfile = await tx.creatorProfile.findUnique({ where: { user_id: userIdBigInt } });
        if (creatorProfile) {
          await tx.portfolioItem.deleteMany({ where: { creator_id: creatorProfile.id } });
          await tx.socialMediaAccount.deleteMany({ where: { creator_id: creatorProfile.id } });
          await tx.package.deleteMany({ where: { creator_id: creatorProfile.id } });
          await tx.kYC.deleteMany({ where: { creator_id: creatorProfile.id } });
          await tx.campaignApplication.deleteMany({ where: { creator_id: creatorProfile.id } });
          await tx.collaboration.deleteMany({ where: { creator_id: creatorProfile.id } });
          await tx.invoice.deleteMany({ where: { creator_id: creatorProfile.id } });
          await tx.creatorProfile.delete({ where: { id: creatorProfile.id } });
        }
      }
      if (user.user_type === 'brand') {
        const brandProfile = await tx.brandProfile.findUnique({ where: { user_id: userIdBigInt } });
        if (brandProfile) {
          await tx.campaign.deleteMany({ where: { brand_id: brandProfile.id } });
          await tx.collaboration.deleteMany({ where: { brand_id: brandProfile.id } });
          await tx.invoice.deleteMany({ where: { brand_id: brandProfile.id } });
          await tx.brandProfile.delete({ where: { id: brandProfile.id } });
        }
      }
      await tx.user.delete({ where: { id: userIdBigInt } });
    });
    res.json({ success: true, message: 'User deleted successfully by phone number' });
  } catch (error) {
    console.error('❌ Delete user by phone error:', error);
    res.status(500).json({ error: 'Failed to delete user by phone', message: error.message });
  }
}));

// Check if user exists
router.post('/check-user-exists', [
  body('phone').notEmpty().withMessage('Phone number is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { phone } = req.body;

    // Check if user exists with this phone number
    const user = await prisma.user.findFirst({
      where: { phone }
    });

    res.json({
      success: true,
      exists: !!user,
      message: user ? 'User found' : 'User not found'
    });

  } catch (error) {
    console.error('Check user exists error:', error);
    res.status(500).json({ 
      error: 'Failed to check user existence',
      message: error.message 
    });
  }
}));

// Agent email login
router.post('/agent-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is an agent
    if (user.user_type !== 'agent') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only agents can login through this endpoint'
      });
    }

    // Check if user has a password (for existing agents without passwords)
    if (!user.password_hash) {
      // For existing agents without passwords, create a default password
      const defaultPassword = 'agent123'; // You can change this default password
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password_hash: hashedPassword }
      });

      console.log(`🔑 Created default password for agent ${user.email}`);
      
      // For now, allow login with default password
      if (password !== defaultPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: `Please use the default password: ${defaultPassword}`
        });
      }
    } else {
      // Verify password for existing agents
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user.id, user.user_type);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    console.log('✅ Agent login successful:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          user_type: user.user_type,
          status: user.status
        }
      }
    });

  } catch (error) {
    console.error('❌ Agent login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
}));

// Super Admin email login
router.post('/super-admin-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is a super admin
    if (user.user_type !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only super admins can login through this endpoint'
      });
    }

    // Check if user has a password
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Password not set for this account'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.user_type);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    console.log('✅ Super Admin login successful:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          user_type: user.user_type,
          status: user.status
        }
      }
    });

  } catch (error) {
    console.error('❌ Super Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
}));

// Get current user information
router.get('/me', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        user_type: true,
        status: true,
        profile_image_url: true,
        cover_image_url: true,
        email_verified: true,
        phone_verified: true,
        created_at: true,
        last_login_at: true,
        auth_provider: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User information retrieved successfully',
      data: {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          user_type: user.user_type,
          status: user.status,
          profile_image_url: user.profile_image_url,
          cover_image_url: user.cover_image_url,
          email_verified: user.email_verified,
          phone_verified: user.phone_verified,
          created_at: user.created_at,
          last_login_at: user.last_login_at,
          auth_provider: user.auth_provider
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting user info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information',
      message: error.message
    });
  }
}));

module.exports = { router }; 