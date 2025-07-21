const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      error: 'Validation failed', 
      message: errors.array()[0]?.msg || 'Validation failed',
      details: errors.array() 
    });
  }
  next();
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Update user basic info (from ProfileSetupScreen)
router.post('/update-basic-info', [
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('email').optional().custom((value) => {
    if (value && value.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new Error('Valid email is required');
      }
    }
    return true;
  }),
  body('phone').optional().custom((value) => {
    if (value && value.trim() !== '') {
      if (!/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''))) {
        throw new Error('Valid phone number is required');
      }
    }
    return true;
  }),
  body('dob').notEmpty().withMessage('Date of birth is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('pincode').notEmpty().withMessage('Pincode is required')
], validateRequest, authenticateToken, async (req, res) => {
  try {
    const { gender, email, phone, dob, state, city, pincode } = req.body;
    const userId = BigInt(req.userId);

    // Parse date of birth
    let dateOfBirth;
    try {
      dateOfBirth = new Date(dob);
      if (isNaN(dateOfBirth.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid date format',
          message: 'Please provide a valid date of birth' 
        });
      }
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid date format',
        message: 'Please provide a valid date of birth' 
      });
    }

    // Check if email already exists for another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: userId }
        }
      });
      
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already exists',
          message: 'An account with this email already exists'
        });
      }
    }

    // Check if phone already exists for another user
    if (phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: phone,
          id: { not: userId }
        }
      });
      
      if (existingUser) {
        return res.status(409).json({
          error: 'Phone already exists',
          message: 'An account with this phone number already exists'
        });
      }
    }

    // Update user email and/or phone
    const updateData = {
      onboarding_step: 2
    };
    
    if (email) {
      updateData.email = email;
      updateData.email_verified = true;
    }
    
    if (phone) {
      updateData.phone = phone;
      updateData.phone_verified = true;
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Create or update creator profile
    const creatorProfile = await prisma.creatorProfile.upsert({
      where: { user_id: userId },
      update: {
        gender,
        date_of_birth: dateOfBirth,
        location_state: state,
        location_city: city,
        location_pincode: pincode
      },
      create: {
        user_id: userId,
        gender,
        date_of_birth: dateOfBirth,
        location_state: state,
        location_city: city,
        location_pincode: pincode
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedProfile = {
      ...creatorProfile,
      id: creatorProfile.id.toString(),
      user_id: creatorProfile.user_id.toString()
    };

    res.json({
      success: true,
      message: 'Basic info updated successfully',
      profile: serializedProfile
    });

  } catch (error) {
    console.error('Update basic info error:', error);
    res.status(500).json({ 
      error: 'Failed to update basic info',
      message: error.message 
    });
  }
});

// Update creator preferences (from CreatorPreferencesScreen)
router.post('/update-preferences', [
  body('categories').isArray({ min: 1, max: 5 }).withMessage('1-5 categories required'),
  body('about').notEmpty().withMessage('About is required'),
  body('languages').isArray({ min: 1 }).withMessage('At least one language required'),
  body('role').optional(),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date required')
], validateRequest, authenticateToken, async (req, res) => {
  try {
    const { categories, about, languages, role, dateOfBirth } = req.body;
    const userId = BigInt(req.userId);

    // Get user to check user type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.user_type === 'creator') {
      // Create or update creator profile
      const creatorProfile = await prisma.creatorProfile.upsert({
        where: { user_id: userId },
        update: {
          content_categories: categories,
          bio: about,
          interests: languages,
          date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null
        },
        create: {
          user_id: userId,
          content_categories: categories,
          bio: about,
          interests: languages,
          date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null
        }
      });

      // Update user onboarding step
      await prisma.user.update({
        where: { id: userId },
        data: { onboarding_step: 1 }
      });

      // Convert BigInt to string for JSON serialization
      const serializedProfile = {
        ...creatorProfile,
        id: creatorProfile.id.toString(),
        user_id: creatorProfile.user_id.toString()
      };

      res.json({
        success: true,
        message: 'Creator preferences updated successfully',
        profile: serializedProfile
      });

    } else if (user.user_type === 'brand') {
      // Create or update brand profile
      const brandProfile = await prisma.brandProfile.upsert({
        where: { user_id: userId },
        update: {
          industries: categories, // Store selected industries as JSON array
          industry: categories[0], // Store first industry as primary
          description: about,
          languages: languages,
          role_in_organization: role,
          date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null
        },
        create: {
          user_id: userId,
          company_name: user.name, // Use user name as default company name
          industries: categories, // Store selected industries as JSON array
          industry: categories[0], // Store first industry as primary
          description: about,
          languages: languages,
          role_in_organization: role,
          date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null
        }
      });

      // Update user onboarding step
      await prisma.user.update({
        where: { id: userId },
        data: { onboarding_step: 1 }
      });

      // Convert BigInt to string for JSON serialization
      const serializedProfile = {
        ...brandProfile,
        id: brandProfile.id.toString(),
        user_id: brandProfile.user_id.toString()
      };

      res.json({
        success: true,
        message: 'Brand preferences updated successfully',
        profile: serializedProfile
      });

    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      error: 'Failed to update preferences',
      message: error.message 
    });
  }
});

// Create package (from CreatePackageScreen)
router.post('/create-package', [
  body('platform').notEmpty().withMessage('Platform is required'),
  body('contentType').notEmpty().withMessage('Content type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('revisions').isInt({ min: 0 }).withMessage('Valid revisions required'),
  body('duration1').notEmpty().withMessage('Duration 1 is required'),
  body('duration2').notEmpty().withMessage('Duration 2 is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('description').optional()
], validateRequest, authenticateToken, async (req, res) => {
  try {
    const { 
      platform, 
      contentType, 
      quantity, 
      revisions, 
      duration1, 
      duration2, 
      price, 
      description 
    } = req.body;
    const userId = BigInt(req.userId);

    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(400).json({ error: 'Creator profile not found' });
    }

    // Create package
    const package = await prisma.package.create({
      data: {
        creator_id: creatorProfile.id,
        package_type: 'content',
        title: `${platform} ${contentType}`,
        description: description || '',
        platform: platform.toUpperCase(),
        content_type: contentType,
        quantity: parseInt(quantity),
        revisions: parseInt(revisions),
        duration: `${duration1} ${duration2}`,
        price: parseFloat(price),
        currency: 'INR',
        status: 'active'
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedPackage = {
      ...package,
      id: package.id.toString(),
      creator_id: package.creator_id.toString()
    };

    res.json({
      success: true,
      message: 'Package created successfully',
      package: serializedPackage
    });

  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ 
      error: 'Failed to create package',
      message: error.message 
    });
  }
});

// Create portfolio item (from CreatePortfolioScreen)
router.post('/create-portfolio', [
  body('mediaUrl').notEmpty().withMessage('Media URL is required'),
  body('mediaType').isIn(['image', 'video', 'archive', 'document']).withMessage('Valid media type required'),
  body('fileName').notEmpty().withMessage('File name is required'),
  body('fileSize').isInt({ min: 1 }).withMessage('Valid file size required'),
  body('mimeType').optional()
], validateRequest, authenticateToken, async (req, res) => {
  try {
    const { mediaUrl, mediaType, fileName, fileSize, mimeType } = req.body;
    const userId = BigInt(req.userId);

    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(400).json({ error: 'Creator profile not found' });
    }

    // Create portfolio item
    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        creator_id: creatorProfile.id,
        media_type: mediaType.toUpperCase(),
        media_url: mediaUrl,
        title: fileName,
        description: `Uploaded file: ${fileName}`,
        file_size: BigInt(fileSize),
        mime_type: mimeType || '',
        status: 'active'
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedPortfolioItem = {
      ...portfolioItem,
      id: portfolioItem.id.toString(),
      creator_id: portfolioItem.creator_id.toString(),
      file_size: portfolioItem.file_size.toString()
    };

    res.json({
      success: true,
      message: 'Portfolio item created successfully',
      portfolioItem: serializedPortfolioItem
    });

  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({ 
      error: 'Failed to create portfolio item',
      message: error.message 
    });
  }
});

// Submit KYC (from KycModal)
router.post('/submit-kyc', [
  body('documentType').isIn(['aadhaar', 'pan']).withMessage('Valid document type required'),
  body('frontImageUrl').notEmpty().withMessage('Front image URL is required'),
  body('backImageUrl').notEmpty().withMessage('Back image URL is required')
], validateRequest, authenticateToken, async (req, res) => {
  try {
    const { documentType, frontImageUrl, backImageUrl } = req.body;
    const userId = BigInt(req.userId);

    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(400).json({ error: 'Creator profile not found' });
    }

    // Create or update KYC
    const kyc = await prisma.kYC.upsert({
      where: { creator_id: creatorProfile.id },
      update: {
        document_type: documentType.toUpperCase(),
        document_front_url: frontImageUrl,
        document_back_url: backImageUrl,
        status: 'pending',
        submitted_at: new Date()
      },
      create: {
        creator_id: creatorProfile.id,
        document_type: documentType.toUpperCase(),
        document_front_url: frontImageUrl,
        document_back_url: backImageUrl,
        status: 'pending',
        submitted_at: new Date()
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedKyc = {
      ...kyc,
      id: kyc.id.toString(),
      creator_id: kyc.creator_id.toString()
    };

    res.json({
      success: true,
      message: 'KYC submitted successfully',
      kyc: serializedKyc
    });

  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({ 
      error: 'Failed to submit KYC',
      message: error.message 
    });
  }
});

// Get user profile with all related data
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = BigInt(req.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creator_profiles: {
          include: {
            kyc: true,
            portfolio_items: true,
            social_media_accounts: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedUser = {
      ...user,
      id: user.id.toString(),
      creator_profile: user.creator_profiles ? {
        ...user.creator_profiles,
        id: user.creator_profiles.id.toString(),
        user_id: user.creator_profiles.user_id.toString(),
        kyc: user.creator_profiles.kyc ? {
          ...user.creator_profiles.kyc,
          id: user.creator_profiles.kyc.id.toString(),
          creator_id: user.creator_profiles.kyc.creator_id.toString()
        } : null,
        portfolio_items: user.creator_profiles.portfolio_items?.map(item => ({
          ...item,
          id: item.id.toString(),
          creator_id: item.creator_id.toString(),
          file_size: item.file_size.toString()
        })) || [],
        social_media_accounts: user.creator_profiles.social_media_accounts?.map(account => ({
          ...account,
          id: account.id.toString(),
          creator_id: account.creator_id.toString(),
          follower_count: account.follower_count.toString(),
          avg_views: account.avg_views.toString()
        })) || []
      } : null
    };

    res.json({
      success: true,
      user: serializedUser
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get profile',
      message: error.message 
    });
  }
});

// Get creator profile with all related data
router.get('/creator-profile', authenticateToken, async (req, res) => {
  try {
    const userId = BigInt(req.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creator_profiles: {
          include: {
            kyc: true,
            portfolio_items: true,
            social_media_accounts: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.user_type !== 'creator') {
      return res.status(403).json({ error: 'User is not a creator' });
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedProfile = {
      ...user.creator_profiles,
      id: user.creator_profiles?.id.toString(),
      user_id: user.creator_profiles?.user_id.toString(),
      kyc: user.creator_profiles?.kyc ? {
        ...user.creator_profiles.kyc,
        id: user.creator_profiles.kyc.id.toString(),
        creator_id: user.creator_profiles.kyc.creator_id.toString()
      } : null,
      portfolio_items: user.creator_profiles?.portfolio_items?.map(item => ({
        ...item,
        id: item.id.toString(),
        creator_id: item.creator_id.toString(),
        file_size: item.file_size.toString()
      })) || [],
      social_media_accounts: user.creator_profiles?.social_media_accounts?.map(account => ({
        ...account,
        id: account.id.toString(),
        creator_id: account.creator_id.toString(),
        follower_count: account.follower_count.toString(),
        avg_views: account.avg_views.toString()
      })) || [],
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type
      }
    };

    res.json({
      success: true,
      data: serializedProfile
    });

  } catch (error) {
    console.error('Get creator profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get creator profile',
      message: error.message 
    });
  }
});

// Get brand profile with all related data
router.get('/brand-profile', authenticateToken, async (req, res) => {
  try {
    const userId = BigInt(req.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        brand_profiles: {
          include: {
            campaigns: true,
            collaborations: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.user_type !== 'brand') {
      return res.status(403).json({ error: 'User is not a brand' });
    }

    // Get the first brand profile (assuming one brand profile per user)
    const brandProfile = user.brand_profiles[0];

    if (!brandProfile) {
      return res.status(404).json({ error: 'Brand profile not found' });
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedProfile = {
      ...brandProfile,
      id: brandProfile.id.toString(),
      user_id: brandProfile.user_id.toString(),
      campaigns: brandProfile.campaigns?.map(campaign => ({
        ...campaign,
        id: campaign.id.toString(),
        brand_id: campaign.brand_id.toString(),
        budget_min: campaign.budget_min?.toString(),
        budget_max: campaign.budget_max?.toString(),
        required_follower_count_min: campaign.required_follower_count_min.toString(),
        required_follower_count_max: campaign.required_follower_count_max?.toString()
      })) || [],
      collaborations: brandProfile.collaborations?.map(collaboration => ({
        ...collaboration,
        id: collaboration.id.toString(),
        brand_id: collaboration.brand_id.toString(),
        creator_id: collaboration.creator_id.toString()
      })) || [],
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type
      }
    };

    res.json({
      success: true,
      data: serializedProfile
    });

  } catch (error) {
    console.error('Get brand profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get brand profile',
      message: error.message 
    });
  }
});

module.exports = router; 