const express = require('express');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/client');

const router = express.Router();
const prisma = new PrismaClient();

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString(), iat: Date.now() },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Google OAuth for mobile
router.post('/google-mobile', [
  body('idToken').notEmpty().withMessage('ID token is required'),
  body('isSignup').optional().isBoolean().withMessage('isSignup must be a boolean'),
  body('userType').optional().isIn(['creator', 'brand']).withMessage('userType must be creator or brand')
], validateRequest, async (req, res) => {
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
    const token = generateToken(user.id);

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
});

// Send phone verification code
router.post('/send-phone-verification-code', [
  body('phone').isMobilePhone().withMessage('Valid phone number is required')
], validateRequest, async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Check for recent OTP requests to prevent spam
    const recentVerification = await prisma.phoneVerification.findFirst({
      where: {
        phone,
        created_at: { gt: new Date(Date.now() - 60 * 1000) } // Last 1 minute
      }
    });
    
    if (recentVerification) {
      return res.status(429).json({
        error: 'Please wait 1 minute before requesting another code'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate unique token
    const token = require('crypto').randomBytes(32).toString('hex');
    
    // Store OTP in database
    await prisma.phoneVerification.create({
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
        console.log(`Verification SMS sent to ${phone}`);
        smsSent = true;
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        
        // Handle rate limiting specifically
        if (smsError.status === 429) {
          console.log(`Rate limit hit for ${phone}. OTP: ${otp} (check console for development)`);
          console.log(`Please wait before requesting another code or upgrade your Twilio plan`);
        } else {
          console.log(`OTP for ${phone}: ${otp} (SMS failed, using console log)`);
        }
      }
    } else {
      // Development mode - just log the OTP
      console.log(`OTP for ${phone}: ${otp} (Twilio not configured)`);
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      phone,
      // Include OTP in development mode for testing
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      error: 'Failed to send verification code',
      message: error.message 
    });
  }
});

// Verify phone code
router.post('/verify-phone-code', [
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('6-digit code is required'),
  body('fullName').optional().isString().withMessage('Full name must be a string'),
  body('userType').optional().isIn(['creator', 'brand']).withMessage('userType must be creator or brand')
], validateRequest, async (req, res) => {
  try {
    const { phone, code, fullName, userType = 'creator' } = req.body;

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
        } else {
          return res.status(400).json({ 
            error: 'Invalid verification code' 
          });
        }
      } catch (verifyError) {
        console.error('Twilio verification failed:', verifyError);
        
        // If Twilio fails (rate limit, etc.), fall back to database verification
        if (verifyError.status === 429) {
          console.log('Twilio rate limit hit, falling back to database verification');
        } else {
          console.log('Twilio verification error, falling back to database verification');
        }
      }
    }
    
    // If Twilio verification failed or not configured, use database verification
    if (!twilioVerification) {
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
        return res.status(400).json({ 
          error: 'Invalid or expired verification code' 
        });
      }

      // Mark as verified
      await prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { verified_at: new Date() }
      });
    }

    // Check if user exists with this phone
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
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
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          phone_verified: true,
          last_login_at: new Date(),
          ...(fullName && { name: fullName }) // Update name if provided
        }
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Phone verification successful',
      user: {
        id: user.id.toString(),
        phone: user.phone,
        name: user.name,
        isVerified: user.phone_verified
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
});

// Update user name (for phone signup flow)
router.post('/update-name', [
  body('name').notEmpty().withMessage('Name is required')
], validateRequest, async (req, res) => {
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
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({ 
      error: 'Failed to update name',
      message: error.message 
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
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
});

// Get all users (admin/developer endpoint)
router.get('/users', async (req, res) => {
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
});

// Delete user (admin/developer endpoint)
router.delete('/delete-user', [
  body('userId').notEmpty().withMessage('User ID is required')
], validateRequest, async (req, res) => {
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
        where: { verifier_id: userIdBigInt }
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
});

// Delete user by phone number (admin/developer endpoint)
router.delete('/delete-user-by-phone', [
  body('phone').notEmpty().withMessage('Phone number is required')
], validateRequest, async (req, res) => {
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
      await tx.kYC.deleteMany({ where: { verifier_id: userIdBigInt } });
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
});

// Check if user exists
router.post('/check-user-exists', [
  body('phone').notEmpty().withMessage('Phone number is required')
], validateRequest, async (req, res) => {
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
});

module.exports = router; 