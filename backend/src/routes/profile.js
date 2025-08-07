const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('../generated/client');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateJWT } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

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

// Get available industries for selection
router.get('/industries', async (req, res) => {
  try {
    // This could be moved to a database table in the future for better management
    const industries = [
      'IT & Technology', 'Entertainment', 'Fashion & Beauty', 'Food & Beverage', 
      'Healthcare', 'Education', 'Finance & Banking', 'Travel & Tourism',
      'Sports & Fitness', 'Automotive', 'Real Estate', 'E-commerce',
      'Manufacturing', 'Media & Advertising', 'Consulting', 'Non-Profit',
      'Retail', 'Telecommunications', 'Energy', 'Transportation',
      'Agriculture', 'Construction', 'Legal Services', 'Insurance'
    ];

    const highlighted = ['IT & Technology', 'Entertainment', 'Fashion & Beauty', 'E-commerce'];

    res.json({
      success: true,
      data: {
        industries,
        highlighted
      }
    });
  } catch (error) {
    console.error('Get industries error:', error);
    res.status(500).json({ 
      error: 'Failed to get industries',
      message: error.message 
    });
  }
});

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
  body('dob').optional(),
  body('city').notEmpty().withMessage('City is required'),
  body('business_type').optional().isIn(['SME', 'Startup', 'Enterprise']).withMessage('Valid business type is required'),
  body('website_url').optional().custom((value) => {
    if (value && value.trim() !== '') {
      try {
        let urlToTest = value.trim();
        if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
          urlToTest = 'https://' + urlToTest;
        }
        new URL(urlToTest);
      } catch {
        throw new Error('Valid website URL is required');
      }
    }
    return true;
  }),
  body('role').optional()
], validateRequest, authenticateJWT, async (req, res) => {
  try {
    const { gender, email, phone, dob, state, city, business_type, website_url, role } = req.body;
    const userId = BigInt(req.user.id);

    // Get user to check user type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate role and business_type for brands
    if (user.user_type === 'brand') {
      if (!role || !role.trim()) {
        return res.status(400).json({ 
          error: 'Role is required',
          message: 'Please select your role in the organization' 
        });
      }
      if (!business_type || !business_type.trim()) {
        return res.status(400).json({ 
          error: 'Business type is required',
          message: 'Please select your business type' 
        });
      }
    }

    // Parse date of birth (only for creators)
    let dateOfBirth = null;
    if (user.user_type === 'creator' && dob) {
      try {
        console.log('🔍 Debug: Received dob from frontend:', dob);
        console.log('🔍 Debug: dob type:', typeof dob);
        dateOfBirth = new Date(dob);
        console.log('🔍 Debug: Parsed dateOfBirth:', dateOfBirth);
        console.log('🔍 Debug: dateOfBirth is valid:', !isNaN(dateOfBirth.getTime()));
        if (isNaN(dateOfBirth.getTime())) {
          return res.status(400).json({ 
            error: 'Invalid date format',
            message: 'Please provide a valid date of birth' 
          });
        }
      } catch (error) {
        console.error('🔍 Debug: Date parsing error:', error);
        return res.status(400).json({ 
          error: 'Invalid date format',
          message: 'Please provide a valid date of birth' 
        });
      }
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

    // Create or update profile based on user type
    if (user.user_type === 'creator') {
      console.log('🔍 Debug: Creating/updating creator profile');
      console.log('🔍 Debug: dateOfBirth to save:', dateOfBirth);
      console.log('🔍 Debug: gender to save:', gender);
      console.log('🔍 Debug: city to save:', city);
      
      // Create or update creator profile
      const creatorProfile = await prisma.creatorProfile.upsert({
        where: { user_id: userId },
        update: {
          gender,
          date_of_birth: dateOfBirth,
          location_city: city
        },
        create: {
          user_id: userId,
          gender,
          date_of_birth: dateOfBirth,
          location_city: city
        }
      });

      console.log('🔍 Debug: Creator profile saved successfully');
      console.log('🔍 Debug: Saved date_of_birth:', creatorProfile.date_of_birth);
      console.log('🔍 Debug: Saved gender:', creatorProfile.gender);
      console.log('🔍 Debug: Saved location_city:', creatorProfile.location_city);

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
    } else if (user.user_type === 'brand') {
      // For brand profiles, we'll use a different approach
      // First try to find existing profile
      const existingProfile = await prisma.brandProfile.findMany({
        where: { user_id: userId },
        take: 1
      });

      let brandProfile;
      
      // Format website URL if provided
      let formattedWebsiteUrl = null;
      if (website_url && website_url.trim()) {
        formattedWebsiteUrl = website_url.trim();
        if (!formattedWebsiteUrl.startsWith('http://') && !formattedWebsiteUrl.startsWith('https://')) {
          formattedWebsiteUrl = 'https://' + formattedWebsiteUrl;
        }
      }

      if (existingProfile.length > 0) {
        // Update existing brand profile
        brandProfile = await prisma.brandProfile.update({
          where: { id: existingProfile[0].id },
          data: {
            gender,
            location_city: city,
            business_type: business_type,
            website_url: formattedWebsiteUrl,
            role_in_organization: role || null
          }
        });
      } else {
        // Create new brand profile
        brandProfile = await prisma.brandProfile.create({
          data: {
            user_id: userId,
            company_name: user.name, // Use user name as default company name
            gender,
            location_city: city,
            business_type: business_type,
            website_url: formattedWebsiteUrl,
            role_in_organization: role || null
          }
        });
      }

      // Convert BigInt to string for JSON serialization
      const serializedProfile = {
        ...brandProfile,
        id: brandProfile.id.toString(),
        user_id: brandProfile.user_id.toString()
      };

      res.json({
        success: true,
        message: 'Basic info updated successfully',
        profile: serializedProfile
      });
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

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
  body('platform').optional().isArray().withMessage('Platform must be an array'),
  body('role').optional(),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date required')
], validateRequest, authenticateJWT, async (req, res) => {
  try {
    const { categories, about, languages, platform, role, dateOfBirth } = req.body;
    const userId = BigInt(req.user.id);

    console.log('Update preferences request:', {
      userId: userId.toString(),
      categories,
      about,
      languages,
      platform,
      role,
      dateOfBirth
    });

    // Get user to check user type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User type:', user.user_type);
    console.log('🔍 Debug: dateOfBirth in update preferences:', dateOfBirth);
    console.log('🔍 Debug: dateOfBirth type:', typeof dateOfBirth);

    // Additional validation for brand users
    if (user.user_type === 'brand') {
      if (!categories || categories.length === 0) {
        return res.status(400).json({ error: 'At least one industry/category is required for brands' });
      }
      if (!about || about.trim() === '') {
        return res.status(400).json({ error: 'Company description is required for brands' });
      }
    }

    if (user.user_type === 'creator') {
      console.log('🔍 Debug: Creating/updating creator profile in update preferences');
      console.log('🔍 Debug: dateOfBirth for update:', dateOfBirth);
      console.log('🔍 Debug: Will update date_of_birth:', !!dateOfBirth);
      
      // Create or update creator profile
      const creatorProfile = await prisma.creatorProfile.upsert({
        where: { user_id: userId },
        update: {
          content_categories: categories,
          bio: about,
          languages: languages,
          platform: platform || null,
          // Only update date_of_birth if it's provided in the request
          ...(dateOfBirth && { date_of_birth: new Date(dateOfBirth) })
        },
        create: {
          user_id: userId,
          content_categories: categories,
          bio: about,
          languages: languages,
          platform: platform || null,
          // Only set date_of_birth if it's provided in the request
          ...(dateOfBirth && { date_of_birth: new Date(dateOfBirth) })
        }
      });

      console.log('🔍 Debug: Creator profile updated successfully');
      console.log('🔍 Debug: Final date_of_birth in profile:', creatorProfile.date_of_birth);

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
      console.log('Processing brand preferences...');
      
      // Check if brand profile exists
      const existingBrandProfile = await prisma.brandProfile.findFirst({
        where: { user_id: userId }
      });

      console.log('Existing brand profile:', existingBrandProfile ? 'Found' : 'Not found');

      let brandProfile;
      
      try {
        if (existingBrandProfile) {
          console.log('Updating existing brand profile...');
          // Update existing brand profile
          brandProfile = await prisma.brandProfile.update({
            where: { id: existingBrandProfile.id },
            data: {
              industries: categories, // Store selected industries as JSON array
              industry: categories[0], // Store first industry as primary
              description: about,
              languages: languages,
              role_in_organization: role,
              date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null
            }
          });
        } else {
          console.log('Creating new brand profile...');
          // Create new brand profile
          brandProfile = await prisma.brandProfile.create({
            data: {
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
        }
        
        console.log('Brand profile saved successfully:', brandProfile.id.toString());
      } catch (brandError) {
        console.error('Brand profile save error:', brandError);
        throw brandError;
      }

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
      res.status(400).json({ error: 'Invalid user type' });
    }

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      error: 'Failed to update preferences',
      message: error.message 
    });
  }
});

// Create package (from CreatePackageScreen) - Now using unified Package table
router.post('/create-package', [
  body('platform').notEmpty().withMessage('Platform is required'),
  body('contentType').notEmpty().withMessage('Content type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('revisions').isInt({ min: 0 }).withMessage('Valid revisions required'),
  body('duration1').notEmpty().withMessage('Duration 1 is required'),
  body('duration2').notEmpty().withMessage('Duration 2 is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('description').optional()
], validateRequest, authenticateJWT, async (req, res) => {
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
    const userId = BigInt(req.user.id);

    // Get user to check user type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a creator
    if (user.user_type !== 'creator') {
      return res.status(400).json({ 
        error: 'Access denied',
        message: 'Package creation is only available for creators. Brand users cannot create packages.'
      });
    }

    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(400).json({ 
        error: 'Creator profile not found',
        message: 'Please complete your creator profile setup before creating packages.'
      });
    }

    // Create package in the unified Package table
    const package = await prisma.package.create({
      data: {
        creator_id: creatorProfile.id,
        title: `${platform} ${contentType}`,
        description: description || '',
        price: parseFloat(price),
        currency: 'USD',
        deliverables: {
          platform: platform.toUpperCase(),
          content_type: contentType,
          quantity: parseInt(quantity),
          revisions: parseInt(revisions),
          duration1: duration1,
          duration2: duration2
        },
        type: 'predefined',
        is_active: true
      },
      include: {
        creator: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Package created successfully',
      package: {
        id: package.id.toString(),
        title: package.title,
        description: package.description,
        price: parseFloat(package.price),
        currency: package.currency,
        deliverables: package.deliverables || [],
        type: package.type,
        is_active: package.is_active,
        created_at: package.created_at,
        creator: {
          id: package.creator.id.toString(),
          user: package.creator.user
        }
      }
    });

  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ 
      error: 'Failed to create package',
      message: error.message 
    });
  }
});

// Update package - Now using unified Package table
router.put('/update-package', [
  body('id').notEmpty().withMessage('Package ID is required'),
  body('platform').notEmpty().withMessage('Platform is required'),
  body('content_type').notEmpty().withMessage('Content type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('revisions').isInt({ min: 0 }).withMessage('Valid revisions required'),
  body('duration1').notEmpty().withMessage('Duration 1 is required'),
  body('duration2').notEmpty().withMessage('Duration 2 is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('description').optional()
], validateRequest, authenticateJWT, async (req, res) => {
  try {
    const { 
      id,
      platform, 
      content_type, 
      quantity, 
      revisions, 
      duration1, 
      duration2, 
      price, 
      description 
    } = req.body;
    const userId = BigInt(req.user.id);

    // Get user to check user type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a creator
    if (user.user_type !== 'creator') {
      return res.status(400).json({ 
        error: 'Access denied',
        message: 'Package updates are only available for creators. Brand users cannot update packages.'
      });
    }

    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(400).json({ 
        error: 'Creator profile not found',
        message: 'Please complete your creator profile setup before updating packages.'
      });
    }

    // Check if package exists and belongs to this creator
    const existingPackage = await prisma.package.findFirst({
      where: {
        id: BigInt(id),
        creator_id: creatorProfile.id
      }
    });

    if (!existingPackage) {
      return res.status(404).json({ 
        error: 'Package not found',
        message: 'Package not found or you do not have permission to update it'
      });
    }

    // Update package in the unified Package table
    const updatedPackage = await prisma.package.update({
      where: { id: BigInt(id) },
      data: {
        title: `${platform} ${content_type}`,
        description: description || '',
        price: parseFloat(price),
        deliverables: {
          platform: platform.toUpperCase(),
          content_type: content_type,
          quantity: parseInt(quantity),
          revisions: parseInt(revisions),
          duration1: duration1,
          duration2: duration2
        },
        updated_at: new Date()
      },
      include: {
        creator: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Package updated successfully',
      package: {
        id: updatedPackage.id.toString(),
        title: updatedPackage.title,
        description: updatedPackage.description,
        price: parseFloat(updatedPackage.price),
        currency: updatedPackage.currency,
        deliverables: updatedPackage.deliverables || [],
        type: updatedPackage.type,
        is_active: updatedPackage.is_active,
        created_at: updatedPackage.created_at,
        updated_at: updatedPackage.updated_at,
        creator: {
          id: updatedPackage.creator.id.toString(),
          user: updatedPackage.creator.user
        }
      }
    });

  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ 
      error: 'Failed to update package',
      message: error.message 
    });
  }
});

// Delete package - Now using unified Package table
router.delete('/delete-package/:packageId', authenticateJWT, async (req, res) => {
  try {
    const { packageId } = req.params;
    const userId = BigInt(req.user.id);

    // Get user to check user type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a creator
    if (user.user_type !== 'creator') {
      return res.status(400).json({ 
        error: 'Access denied',
        message: 'Package deletion is only available for creators. Brand users cannot delete packages.'
      });
    }

    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(400).json({ 
        error: 'Creator profile not found',
        message: 'Please complete your creator profile setup before deleting packages.'
      });
    }

    // Check if package exists and belongs to this creator
    const existingPackage = await prisma.package.findFirst({
      where: {
        id: BigInt(packageId),
        creator_id: creatorProfile.id
      },
      include: {
        orders: {
          where: {
            status: {
              in: ['pending', 'confirmed', 'in_progress']
            }
          }
        }
      }
    });

    if (!existingPackage) {
      return res.status(404).json({ 
        error: 'Package not found',
        message: 'Package not found or you do not have permission to delete it'
      });
    }

    // Check if there are active orders for this package
    if (existingPackage.orders.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete package',
        message: 'Cannot delete package with active orders. Please complete or cancel existing orders first.'
      });
    }

    // Delete package from the unified Package table
    await prisma.package.delete({
      where: { id: BigInt(packageId) }
    });

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });

  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ 
      error: 'Failed to delete package',
      message: error.message 
    });
  }
});

// Create portfolio item (from CreatePortfolioScreen)
router.post('/create-portfolio', [
  body('mediaUrl').notEmpty().withMessage('Media URL is required'),
  body('mediaType').isIn(['image', 'video', 'text']).withMessage('Valid media type required'),
  body('fileName').notEmpty().withMessage('File name is required'),
  body('fileSize').isInt({ min: 1 }).withMessage('Valid file size required'),
  body('mimeType').optional()
], validateRequest, authenticateJWT, async (req, res) => {
  try {
    const { mediaUrl, mediaType, fileName, fileSize, mimeType } = req.body;
    const userId = BigInt(req.user.id);

    // Get user to check user type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a creator or brand (both can have portfolios)
    if (user.user_type !== 'creator' && user.user_type !== 'brand') {
      return res.status(400).json({ 
        error: 'Access denied',
        message: 'Portfolio creation is only available for creators and brands.'
      });
    }

    // Get user profile based on user type
    let userProfile;
    let profileType;
    
    if (user.user_type === 'creator') {
      userProfile = await prisma.creatorProfile.findUnique({
        where: { user_id: userId }
      });
      profileType = 'creator';
    } else if (user.user_type === 'brand') {
      userProfile = await prisma.brandProfile.findFirst({
        where: { user_id: userId }
      });
      profileType = 'brand';
    }

    if (!userProfile) {
      return res.status(400).json({ 
        error: `${profileType} profile not found`,
        message: `Please complete your ${profileType} profile setup before creating portfolio items.`
      });
    }

    // Map media type to enum value (always lowercase)
    let portfolioMediaType;
    if (mediaType && typeof mediaType === 'string') {
      if (mediaType.toLowerCase() === 'image') {
        portfolioMediaType = 'image';
      } else if (mediaType.toLowerCase() === 'video') {
        portfolioMediaType = 'video';
      } else {
        portfolioMediaType = 'text'; // Default for documents/archives
      }
    } else {
      portfolioMediaType = 'text';
    }

    // Create portfolio item
    const portfolioData = {
      title: fileName,
      description: `Uploaded file: ${fileName}`,
      media_url: mediaUrl,
      media_type: portfolioMediaType,
      file_size: fileSize ? BigInt(fileSize) : null,
      mime_type: mimeType || null
    };

    // Set the appropriate ID based on user type
    if (user.user_type === 'creator') {
      portfolioData.creator_id = userProfile.id;
    } else if (user.user_type === 'brand') {
      portfolioData.brand_id = userProfile.id;
    }

    const portfolioItem = await prisma.portfolioItem.create({
      data: portfolioData
    });

    // Convert BigInt to string for JSON serialization
    const serializedPortfolioItem = {
      ...portfolioItem,
      id: portfolioItem.id.toString(),
      creator_id: portfolioItem.creator_id?.toString(),
      brand_id: portfolioItem.brand_id?.toString()
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
  body('documentType').isIn(['aadhaar', 'pan', 'ekyc']).withMessage('Valid document type required'),
  body('frontImageUrl').optional(),
  body('backImageUrl').optional(),
  body('aadhaarData').optional(),
  body('verificationMethod').optional()
], validateRequest, authenticateJWT, async (req, res) => {
  try {
    const { documentType, frontImageUrl, backImageUrl, aadhaarData, verificationMethod } = req.body;
    const userId = BigInt(req.user.id);

    // Get user to check user type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a creator
    if (user.user_type !== 'creator') {
      return res.status(400).json({ 
        error: 'Access denied',
        message: 'KYC submission is only available for creators. Brand users cannot submit KYC.'
      });
    }

    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(400).json({ 
        error: 'Creator profile not found',
        message: 'Please complete your creator profile setup before submitting KYC.'
      });
    }

    // Prepare KYC data based on document type
    let kycData = {
      document_type: documentType.toUpperCase(),
      status: 'pending',
      submitted_at: new Date()
    };

    if (documentType === 'ekyc') {
      // Handle eKYC data
      if (!aadhaarData) {
        return res.status(400).json({ 
          error: 'Aadhaar data is required for eKYC submission' 
        });
      }
      
      // Store eKYC data in additional fields or as JSON
      kycData = {
        ...kycData,
        document_number: aadhaarData.uid,
        document_front_url: null, // eKYC doesn't need image uploads
        document_back_url: null,
        // You might want to add additional fields to store eKYC data
        // For now, we'll store it as a note or extend the schema
      };
    } else {
      // Handle manual uploads
      if (!frontImageUrl || !backImageUrl) {
        return res.status(400).json({ 
          error: 'Front and back image URLs are required for manual uploads' 
        });
      }
      
      kycData = {
        ...kycData,
        document_front_url: frontImageUrl,
        document_back_url: backImageUrl,
      };
    }

    // Create or update KYC
    const kyc = await prisma.kYC.upsert({
      where: { creator_id: creatorProfile.id },
      update: kycData,
      create: {
        creator_id: creatorProfile.id,
        ...kycData
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
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = BigInt(req.user.id);

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
router.get('/creator-profile', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 Creator profile request received for user ID:', req.user.id);
    const userId = BigInt(req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creator_profiles: {
          include: {
            kyc: true,
            portfolio_items: true,
            social_media_accounts: true,
            packages_created: {
              orderBy: {
                created_at: 'desc'
              }
            }
          }
        }
      }
    });

    console.log('🔍 User found:', !!user);
    if (user) {
      console.log('🔍 User type:', user.user_type);
      console.log('🔍 Creator profile exists:', !!user.creator_profiles);
    }

    if (!user) {
      console.log('❌ User not found for ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.user_type !== 'creator') {
      console.log('❌ User is not a creator. User type:', user.user_type);
      return res.status(403).json({ error: 'User is not a creator' });
    }

    if (!user.creator_profiles) {
      console.log('❌ Creator profile not found for user ID:', req.user.id);
      return res.status(404).json({ error: 'Creator profile not found' });
    }

    console.log('🔍 Creator profile interests:', user.creator_profiles?.interests);
    console.log('🔍 Creator profile packages from interests:', user.creator_profiles?.interests?.packages);
    console.log('🔍 Creator profile packages type:', typeof user.creator_profiles?.interests?.packages);
    console.log('🔍 Creator profile packages length:', user.creator_profiles?.interests?.packages?.length);
    console.log('🔍 Creator profile packages stringified:', JSON.stringify(user.creator_profiles?.interests?.packages));
    console.log('🔍 Creator profile gender:', user.creator_profiles?.gender);
    console.log('🔍 Creator profile date_of_birth:', user.creator_profiles?.date_of_birth);
    console.log('🔍 Creator profile languages field:', user.creator_profiles?.languages);
    console.log('🔍 Creator profile content_categories field:', user.creator_profiles?.content_categories);
    console.log('🔍 Creator profile platform field:', user.creator_profiles?.platform);
    console.log('🔍 Creator profile packages field:', user.creator_profiles?.packages);
    
    // Convert BigInt values to strings for JSON serialization
    const serializedProfile = {
      ...user.creator_profiles,
      id: user.creator_profiles?.id.toString(),
      user_id: user.creator_profiles?.user_id.toString(),
      // Handle Decimal fields
      min_rate: user.creator_profiles?.min_rate?.toString() || null,
      max_rate: user.creator_profiles?.max_rate?.toString() || null,
      rating: user.creator_profiles?.rating?.toString() || '0',
      // Handle Date fields
      created_at: user.creator_profiles?.created_at?.toISOString() || null,
      updated_at: user.creator_profiles?.updated_at?.toISOString() || null,
      date_of_birth: user.creator_profiles?.date_of_birth?.toISOString() || null,
      // Handle JSON fields properly
      languages: (() => {
        const languages = user.creator_profiles?.languages;
        if (!languages) return [];
        if (Array.isArray(languages)) return languages;
        if (typeof languages === 'string') {
          try {
            return JSON.parse(languages);
          } catch (e) {
            console.warn('Failed to parse languages:', e);
            return [];
          }
        }
        return [];
      })(),
      content_categories: (() => {
        const categories = user.creator_profiles?.content_categories;
        if (!categories) return [];
        if (Array.isArray(categories)) return categories;
        if (typeof categories === 'string') {
          try {
            return JSON.parse(categories);
          } catch (e) {
            console.warn('Failed to parse content_categories:', e);
            return [];
          }
        }
        return [];
      })(),
      platform: (() => {
        const platform = user.creator_profiles?.platform;
        if (!platform) return [];
        if (Array.isArray(platform)) return platform;
        if (typeof platform === 'string') {
          try {
            return JSON.parse(platform);
          } catch (e) {
            console.warn('Failed to parse platform:', e);
            return [];
          }
        }
        return [];
      })(),
      packages: user.creator_profiles?.packages_created?.map(pkg => ({
        id: pkg.id.toString(),
        title: pkg.title,
        description: pkg.description,
        price: parseFloat(pkg.price),
        currency: pkg.currency,
        deliverables: pkg.deliverables || [],
        type: pkg.type,
        is_active: pkg.is_active,
        created_at: pkg.created_at?.toISOString() || null,
        updated_at: pkg.updated_at?.toISOString() || null
      })) || [],
      kyc: user.creator_profiles?.kyc ? {
        ...user.creator_profiles.kyc,
        id: user.creator_profiles.kyc.id.toString(),
        creator_id: user.creator_profiles.kyc.creator_id.toString(),
        created_at: user.creator_profiles.kyc.created_at?.toISOString() || null,
        updated_at: user.creator_profiles.kyc.updated_at?.toISOString() || null
      } : null,
      portfolio_items: user.creator_profiles?.portfolio_items?.map(item => ({
        ...item,
        id: item.id.toString(),
        creator_id: item.creator_id?.toString(),
        brand_id: item.brand_id?.toString(),
        file_size: item.file_size?.toString(),
        created_at: item.created_at?.toISOString() || null,
        updated_at: item.updated_at?.toISOString() || null
      })) || [],
      social_media_accounts: user.creator_profiles?.social_media_accounts?.map(account => ({
        ...account,
        id: account.id.toString(),
        creator_id: account.creator_id.toString(),
        follower_count: account.follower_count.toString(),
        avg_views: account.avg_views.toString(),
        created_at: account.created_at?.toISOString() || null,
        updated_at: account.updated_at?.toISOString() || null
      })) || [],
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        profile_image_url: user.profile_image_url,
        cover_image_url: user.cover_image_url
      }
    };

    res.json({
      success: true,
      data: serializedProfile
    });

  } catch (error) {
    console.error('❌ Get creator profile error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to get creator profile',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get brand profile with all related data
router.get('/brand-profile', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 Brand profile request received for user ID:', req.user.id);
    const userId = BigInt(req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        brand_profiles: {
          include: {
            campaigns: true,
            collaborations: true,
            portfolio_items: {
              orderBy: {
                created_at: 'desc'
              }
            }
          }
        }
      }
    });

    console.log('🔍 User found:', !!user);
    console.log('🔍 User type:', user?.user_type);

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.user_type !== 'brand') {
      console.log('❌ User is not a brand, user type:', user.user_type);
      return res.status(403).json({ error: 'User is not a brand' });
    }

    // Get the first brand profile (assuming one brand profile per user)
    const brandProfile = user.brand_profiles[0];
    console.log('🔍 Brand profile found:', !!brandProfile);

    if (!brandProfile) {
      console.log('❌ Brand profile not found');
      return res.status(404).json({ error: 'Brand profile not found' });
    }

    console.log('🔍 Brand profile data:', {
      id: brandProfile.id.toString(),
      user_id: brandProfile.user_id.toString(),
      campaigns_count: brandProfile.campaigns?.length || 0,
      collaborations_count: brandProfile.collaborations?.length || 0,
      portfolio_items_count: brandProfile.portfolio_items?.length || 0,
      portfolio_items: brandProfile.portfolio_items
    });
    
    // Debug portfolio items serialization
    if (brandProfile.portfolio_items && brandProfile.portfolio_items.length > 0) {
      console.log('🔍 Raw portfolio items (first 2):', brandProfile.portfolio_items.slice(0, 2));
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
        required_follower_count_min: campaign.required_follower_count_min?.toString(),
        required_follower_count_max: campaign.required_follower_count_max?.toString()
      })) || [],
      collaborations: brandProfile.collaborations?.map(collaboration => ({
        ...collaboration,
        id: collaboration.id.toString(),
        brand_id: collaboration.brand_id.toString(),
        creator_id: collaboration.creator_id.toString()
      })) || [],
      portfolio_items: brandProfile.portfolio_items?.map(item => {
        const serializedItem = {
          ...item,
          id: item.id.toString(),
          creator_id: item.creator_id?.toString(),
          brand_id: item.brand_id?.toString(),
          file_size: item.file_size?.toString()
        };
        console.log('🔍 Serialized portfolio item:', {
          id: serializedItem.id,
          title: serializedItem.title,
          brand_id: serializedItem.brand_id
        });
        return serializedItem;
      }) || [],
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        profile_image_url: user.profile_image_url,
        cover_image_url: user.cover_image_url
      }
    };

    console.log('✅ Sending brand profile response with portfolio items:', {
      portfolio_items_count: serializedProfile.portfolio_items?.length || 0,
      portfolio_items: serializedProfile.portfolio_items
    });
    res.json({
      success: true,
      data: serializedProfile
    });

  } catch (error) {
    console.error('❌ Get brand profile error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to get brand profile',
      message: error.message 
    });
  }
});

// Create campaign (from CreateCampaignScreen)
router.post('/create-campaign', [
  body('title').notEmpty().withMessage('Campaign title is required'),
  body('description').notEmpty().withMessage('Campaign description is required'),
  body('budget').notEmpty().withMessage('Budget is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('requirements').notEmpty().withMessage('Requirements are required'),
  body('targetAudience').notEmpty().withMessage('Target audience is required')
], validateRequest, authenticateJWT, async (req, res) => {
  try {
    const { title, description, budget, duration, requirements, targetAudience } = req.body;
    const userId = BigInt(req.user.id);

    // Get user to check user type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a brand
    if (user.user_type !== 'brand') {
      return res.status(400).json({ 
        error: 'Access denied',
        message: 'Campaign creation is only available for brands. Creators cannot create campaigns.'
      });
    }

    // Get brand profile
    const brandProfile = await prisma.brandProfile.findFirst({
      where: { user_id: userId }
    });

    if (!brandProfile) {
      return res.status(400).json({ 
        error: 'Brand profile not found',
        message: 'Please complete your brand profile setup before creating campaigns.'
      });
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        brand_id: brandProfile.id,
        title: title,
        description: description,
        budget_min: parseFloat(budget),
        budget_max: parseFloat(budget),
        campaign_type: 'sponsored_content', // Default campaign type
        content_guidelines: requirements,
        target_demographics: { target_audience: targetAudience },
        status: 'active'
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedCampaign = {
      ...campaign,
      id: campaign.id.toString(),
      brand_id: campaign.brand_id.toString(),
      budget_min: campaign.budget_min?.toString(),
      budget_max: campaign.budget_max?.toString()
    };

    res.json({
      success: true,
      message: 'Campaign created successfully',
      campaign: serializedCampaign
    });

  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ 
      error: 'Failed to create campaign',
      message: error.message 
    });
  }
});

// Get all creators for brand home screen
router.get('/creators', async (req, res) => {
  try {
    console.log('🔍 Fetching creators for brand home screen...');
    
    // Get all creator profiles with their related data
    const influencers = await prisma.creatorProfile.findMany({
      where: {
        user: {
          status: 'active' // Only active users
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_image_url: true,
            cover_image_url: true,
            email: true,
            phone: true
          }
        },
        social_media_accounts: {
          select: {
            id: true,
            platform: true,
            username: true,
            follower_count: true,
            engagement_rate: true,
            avg_views: true,
            verified: true
          }
        },
        portfolio_items: {
          select: {
            id: true,
            title: true,
            media_url: true,
            media_type: true,
            platform: true
          },
          take: 5 // Limit to 5 portfolio items
        },
        packages_created: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            deliverables: true,
            is_active: true,
            created_at: true,
            updated_at: true
          },
          where: {
            is_active: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ Found ${influencers.length} creators`);

    // Group creators by platform for easier frontend consumption
    const groupedCreators = {
      youtube: [],
      instagram: [],
      tiktok: [],
      twitter: [],
      facebook: []
    };

    influencers.forEach(creator => {
      // Convert BigInt to string for JSON serialization
      const serializedCreator = {
        id: creator.id.toString(),
        user_id: creator.user_id.toString(),
        name: creator.user.name,
        profile_image_url: creator.user.profile_image_url,
        cover_image_url: creator.user.cover_image_url,
        email: creator.user.email,
        phone: creator.user.phone,
        bio: creator.bio,
        gender: creator.gender,
        date_of_birth: creator.date_of_birth,
        location_city: creator.location_city,
        location_state: creator.location_state,
        content_categories: creator.content_categories,
        interests: creator.interests,
        platform: creator.platform,
        rating: creator.rating?.toString(),
        total_collaborations: creator.total_collaborations?.toString(),
        average_response_time: creator.average_response_time,
        verified: creator.verified,
        featured: creator.featured,
        social_accounts: creator.social_media_accounts.map(account => ({
          id: account.id.toString(),
          platform: account.platform,
          username: account.username,
          follower_count: account.follower_count.toString(),
          engagement_rate: account.engagement_rate.toString(),
          avg_views: account.avg_views.toString(),
          verified: account.verified
        })),
        portfolio_items: creator.portfolio_items.map(item => ({
          id: item.id.toString(),
          title: item.title,
          media_url: item.media_url,
          media_type: item.media_type,
          platform: item.platform
        })),
        packages: creator.packages_created.map(pkg => ({
          id: pkg.id.toString(),
          type: pkg.type,
          title: pkg.title,
          description: pkg.description,
          price: pkg.price.toString(),
          currency: pkg.currency,
          deliverables: pkg.deliverables,
          is_active: pkg.is_active,
          created_at: pkg.created_at,
          updated_at: pkg.updated_at
        }))
      };

      // Add to appropriate platform group based on their platform preferences
      if (creator.platform && Array.isArray(creator.platform)) {
        creator.platform.forEach(platform => {
          const platformKey = platform.toLowerCase();
          if (groupedCreators[platformKey]) {
            // Check if creator is already in this platform group to avoid duplicates
            const existingCreator = groupedCreators[platformKey].find(c => c.id === serializedCreator.id);
            if (!existingCreator) {
              groupedCreators[platformKey].push(serializedCreator);
            }
          }
        });
      }

      // If no platform preferences, add to a default group
      if (!creator.platform || !Array.isArray(creator.platform) || creator.platform.length === 0) {
        groupedCreators.instagram.push(serializedCreator);
      }
    });

    console.log('📊 Grouped creators by platform:', {
      youtube: groupedCreators.youtube.length,
      instagram: groupedCreators.instagram.length,
      tiktok: groupedCreators.tiktok.length,
      twitter: groupedCreators.twitter.length,
      facebook: groupedCreators.facebook.length
    });

    res.json({
      success: true,
      data: groupedCreators
    });

  } catch (error) {
    console.error('❌ Get creators error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch creators',
      message: error.message 
    });
  }
});

// Get creators by platform
router.get('/creators/:platform', authenticateJWT, async (req, res) => {
  try {
    const { platform } = req.params;
    
    // Validate platform parameter
    if (!platform || platform === 'undefined' || platform === 'null') {
      console.error('❌ Invalid platform parameter:', platform);
      return res.status(400).json({ 
        error: 'Invalid platform parameter',
        message: 'Platform parameter is required and must be valid.'
      });
    }
    
    console.log(`🔍 Fetching creators for platform: ${platform}`);
    
    // Get influencers with the specified platform preference
    const influencers = await prisma.creatorProfile.findMany({
      where: {
        user: {
          status: 'active'
        },
        platform: {
          array_contains: [platform]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_image_url: true,
            cover_image_url: true,
            email: true,
            phone: true
          }
        },
        social_media_accounts: {
          where: {
            platform: platform.toUpperCase()
          },
          select: {
            id: true,
            platform: true,
            username: true,
            follower_count: true,
            engagement_rate: true,
            avg_views: true,
            verified: true
          }
        },
        packages_created: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            deliverables: true,
            is_active: true,
            created_at: true,
            updated_at: true
          },
          where: {
            is_active: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ Found ${influencers.length} influencers for ${platform}`);

    // Serialize the data
    const serializedInfluencers = influencers.map(influencer => ({
      id: influencer.id.toString(),
      user_id: influencer.user_id.toString(),
      name: influencer.user.name,
      profile_image_url: influencer.user.profile_image_url,
      cover_image_url: influencer.user.cover_image_url,
      email: influencer.user.email,
      phone: influencer.user.phone,
      bio: influencer.bio,
      gender: influencer.gender,
      date_of_birth: influencer.date_of_birth,
      location_city: influencer.location_city,
      location_state: influencer.location_state,
      content_categories: influencer.content_categories,
      interests: influencer.interests,
      platform: influencer.platform,
      rating: influencer.rating?.toString(),
      total_collaborations: influencer.total_collaborations?.toString(),
      average_response_time: influencer.average_response_time,
      verified: influencer.verified,
      featured: influencer.featured,
      social_account: influencer.social_media_accounts[0] ? {
        id: influencer.social_media_accounts[0].id.toString(),
        platform: influencer.social_media_accounts[0].platform,
        username: influencer.social_media_accounts[0].username,
        follower_count: influencer.social_media_accounts[0].follower_count.toString(),
        engagement_rate: influencer.social_media_accounts[0].engagement_rate.toString(),
        avg_views: influencer.social_media_accounts[0].avg_views.toString(),
        verified: influencer.social_media_accounts[0].verified
      } : null,
      packages: influencer.packages_created.map(pkg => ({
        id: pkg.id.toString(),
        type: pkg.type,
        title: pkg.title,
        description: pkg.description,
        price: pkg.price.toString(),
        currency: pkg.currency,
        deliverables: pkg.deliverables,
        is_active: pkg.is_active,
        created_at: pkg.created_at,
        updated_at: pkg.updated_at
      }))
    }));

    res.json({
      success: true,
      data: serializedInfluencers
    });

  } catch (error) {
    console.error('❌ Get influencers by platform error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch influencers by platform',
      message: error.message 
    });
  }
});

// Get individual creator profile
router.get('/creators/:platform/:id', authenticateJWT, async (req, res) => {
  try {
    const { platform, id } = req.params;
    
    // Validate parameters
    if (!platform || platform === 'undefined' || platform === 'null') {
      console.error('❌ Invalid platform parameter:', platform);
      return res.status(400).json({ 
        error: 'Invalid platform parameter',
        message: 'Platform parameter is required and must be valid.'
      });
    }
    
    if (!id || id === 'undefined' || id === 'null') {
      console.error('❌ Invalid creator ID:', id);
      return res.status(400).json({ 
        error: 'Invalid creator ID',
        message: 'Creator ID is required and must be valid.'
      });
    }
    
    const creatorId = BigInt(id);
    
    console.log(`🔍 Fetching influencer profile: ${id}`);
    
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_image_url: true,
            cover_image_url: true,
            email: true,
            phone: true
          }
        },
        social_media_accounts: {
          select: {
            id: true,
            platform: true,
            username: true,
            follower_count: true,
            engagement_rate: true,
            avg_views: true,
            verified: true
          }
        },
        portfolio_items: {
          select: {
            id: true,
            title: true,
            description: true,
            media_url: true,
            media_type: true,
            platform: true,
            tags: true,
            is_featured: true
          }
        },
        packages_created: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            deliverables: true,
            is_active: true,
            created_at: true,
            updated_at: true
          },
          where: {
            is_active: true
          }
        },
        // Include recent orders with rejection messages for brand view
        orders_received: {
          select: {
            id: true,
            status: true,
            rejection_message: true,
            order_date: true,
            brand: {
              select: {
                company_name: true
              }
            }
          },
          where: {
            status: 'cancelled',
            rejection_message: {
              not: null
            }
          },
          orderBy: {
            order_date: 'desc'
          },
          take: 5 // Limit to recent 5 rejection messages
        }
      }
    });

    if (!creator) {
      return res.status(404).json({ 
        error: 'Creator not found',
        message: 'The requested creator profile does not exist.'
      });
    }

    console.log(`✅ Found creator: ${creator.user.name}`);
    console.log('🔍 Creator packages field:', creator.packages);
    console.log('🔍 Creator packages type:', typeof creator.packages);
    console.log('🔍 Creator packages length:', creator.packages?.length);
    console.log('🔍 Creator gender:', creator.gender);
    console.log('🔍 Creator date_of_birth:', creator.date_of_birth);
    console.log('🔍 Creator languages field:', creator.languages);
    console.log('🔍 Creator content_categories field:', creator.content_categories);

    // Serialize the data
    const serializedCreator = {
      id: creator.id.toString(),
      user_id: creator.user_id.toString(),
      name: creator.user.name,
      profile_image_url: creator.user.profile_image_url,
      cover_image_url: creator.user.cover_image_url,
      email: creator.user.email,
      phone: creator.user.phone,
      bio: creator.bio,
      gender: creator.gender,
      date_of_birth: creator.date_of_birth?.toISOString() || null,
      location_city: creator.location_city,
      location_state: creator.location_state,
      content_categories: (() => {
        const categories = creator.content_categories;
        if (!categories) return [];
        if (Array.isArray(categories)) return categories;
        if (typeof categories === 'string') {
          try {
            return JSON.parse(categories);
          } catch (e) {
            console.warn('Failed to parse content_categories:', e);
            return [];
          }
        }
        return [];
      })(),
      languages: (() => {
        const languages = creator.languages;
        if (!languages) return [];
        if (Array.isArray(languages)) return languages;
        if (typeof languages === 'string') {
          try {
            return JSON.parse(languages);
          } catch (e) {
            console.warn('Failed to parse languages:', e);
            return [];
          }
        }
        return [];
      })(),
      platform: (() => {
        const platform = creator.platform;
        if (!platform) return [];
        if (Array.isArray(platform)) return platform;
        if (typeof platform === 'string') {
          try {
            return JSON.parse(platform);
          } catch (e) {
            console.warn('Failed to parse platform:', e);
            return [];
          }
        }
        return [];
      })(),
      rating: creator.rating?.toString(),
      total_collaborations: creator.total_collaborations?.toString(),
      verified: creator.verified,
      featured: creator.featured,
      social_media_accounts: creator.social_media_accounts.map(account => ({
        id: account.id.toString(),
        platform: account.platform,
        username: account.username,
        follower_count: account.follower_count.toString(),
        engagement_rate: account.engagement_rate.toString(),
        avg_views: account.avg_views.toString(),
        verified: account.verified
      })),
      portfolio_items: creator.portfolio_items.map(item => ({
        id: item.id.toString(),
        title: item.title,
        description: item.description,
        media_url: item.media_url,
        media_type: item.media_type,
        platform: item.platform,
        tags: item.tags,
        is_featured: item.is_featured
      })),
      packages: creator.packages_created.map(pkg => ({
        id: pkg.id.toString(),
        type: pkg.type,
        title: pkg.title,
        description: pkg.description,
        price: pkg.price.toString(),
        currency: pkg.currency,
        deliverables: pkg.deliverables,
        is_active: pkg.is_active,
        created_at: pkg.created_at,
        updated_at: pkg.updated_at
      })),
      // Include rejection messages for brand view
      rejection_messages: creator.orders_received.map(order => ({
        id: order.id.toString(),
        message: order.rejection_message,
        order_date: order.order_date,
        brand_name: order.brand?.company_name || 'Unknown Brand'
      }))
    };

    res.json({
      success: true,
      data: serializedCreator
    });

  } catch (error) {
    console.error('❌ Get creator profile error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch creator profile',
      message: error.message 
    });
  }
});

// Update cover image
router.post('/update-cover-image', authenticateJWT, [
  body('cover_image_url').notEmpty().withMessage('Cover image URL is required'),
  body('cover_image_url').isURL().withMessage('Valid cover image URL is required'),
], validateRequest, async (req, res) => {
  try {
    const { cover_image_url } = req.body;
    const userId = req.user.id;

    console.log('🔍 Updating cover image for user:', userId);
    console.log('🔍 Cover image URL:', cover_image_url);

    // Update the user's cover image
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        cover_image_url: cover_image_url,
        updated_at: new Date()
      },
      select: {
        id: true,
        name: true,
        cover_image_url: true,
        profile_image_url: true,
        user_type: true
      }
    });

    console.log('✅ Cover image updated successfully for user:', userId);

    res.json({
      success: true,
      message: 'Cover image updated successfully',
      data: {
        user_id: updatedUser.id.toString(),
        cover_image_url: updatedUser.cover_image_url,
        profile_image_url: updatedUser.profile_image_url,
        user_type: updatedUser.user_type
      }
    });

  } catch (error) {
    console.error('❌ Update cover image error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to update cover image',
      message: error.message 
    });
  }
});

module.exports = router; 