const express = require('express');
const { PrismaClient } = require('../generated/client');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateJWT } = require('../middlewares/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// Create a new package (for creators)
router.post('/', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.user_type;
  const { title, description, price, currency, deliverables, type } = req.body;

  if (userType !== 'creator') {
    return res.status(403).json({
      success: false,
      message: 'Only creators can create packages'
    });
  }

  if (!title || !price) {
    return res.status(400).json({
      success: false,
      message: 'Title and price are required'
    });
  }

  try {
    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findFirst({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    // Create package
    const package = await prisma.package.create({
      data: {
        creator_id: creatorProfile.id,
        title,
        description,
        price: parseFloat(price),
        currency: currency || 'USD',
        deliverables: deliverables || [],
        type: type || 'predefined',
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
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create package',
      error: error.message
    });
  }
}));

// Get all packages (for browsing)
router.get('/', asyncHandler(async (req, res) => {
  const { creator_id, is_active, limit = 20, offset = 0 } = req.query;

  try {
    const where = {
      is_active: true
    };

    if (creator_id) {
      where.creator_id = BigInt(creator_id);
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const packages = await prisma.package.findMany({
      where,
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
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: {
        created_at: 'desc'
      }
    });

    const transformedPackages = packages.map(pkg => ({
      id: pkg.id.toString(),
      title: pkg.title,
      description: pkg.description,
      price: parseFloat(pkg.price),
      currency: pkg.currency,
      deliverables: pkg.deliverables || [],
      type: pkg.type,
      is_active: pkg.is_active,
      created_at: pkg.created_at,
      creator: {
        id: pkg.creator.id.toString(),
        user: pkg.creator.user,
        location_city: pkg.creator.location_city,
        rating: pkg.creator.rating ? parseFloat(pkg.creator.rating) : null
      }
    }));

    res.json({
      success: true,
      packages: transformedPackages,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: transformedPackages.length
      }
    });

  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message
    });
  }
}));

// Get packages created by the authenticated creator
router.get('/my-packages', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.user_type;

  if (userType !== 'creator') {
    return res.status(403).json({
      success: false,
      message: 'Only creators can view their packages'
    });
  }

  try {
    const creatorProfile = await prisma.creatorProfile.findFirst({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    const packages = await prisma.package.findMany({
      where: {
        creator_id: creatorProfile.id
      },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            order_date: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const transformedPackages = packages.map(pkg => ({
      id: pkg.id.toString(),
      title: pkg.title,
      description: pkg.description,
      price: parseFloat(pkg.price),
      currency: pkg.currency,
      deliverables: pkg.deliverables || [],
      type: pkg.type,
      is_active: pkg.is_active,
      created_at: pkg.created_at,
      orders_count: pkg.orders.length,
      recent_orders: pkg.orders.slice(0, 5).map(order => ({
        id: order.id.toString(),
        status: order.status,
        order_date: order.order_date
      }))
    }));

    res.json({
      success: true,
      packages: transformedPackages
    });

  } catch (error) {
    console.error('Error fetching creator packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message
    });
  }
}));

// Get specific package details
router.get('/:packageId', asyncHandler(async (req, res) => {
  const packageId = req.params.packageId;

  try {
    const package = await prisma.package.findFirst({
      where: {
        id: BigInt(packageId),
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
            },
            social_media_accounts: {
              select: {
                platform: true,
                username: true,
                follower_count: true,
                engagement_rate: true
              }
            }
          }
        }
      }
    });

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      package: {
        id: package.id.toString(),
        title: package.title,
        description: package.description,
        price: parseFloat(package.price),
        currency: package.currency,
        deliverables: package.deliverables || [],
        type: package.type,
        created_at: package.created_at,
        creator: {
          id: package.creator.id.toString(),
          user: package.creator.user,
          bio: package.creator.bio,
          location_city: package.creator.location_city,
          rating: package.creator.rating ? parseFloat(package.creator.rating) : null,
          total_collaborations: package.creator.total_collaborations,
          social_media_accounts: package.creator.social_media_accounts.map(account => ({
            platform: account.platform,
            username: account.username,
            follower_count: account.follower_count.toString(),
            engagement_rate: parseFloat(account.engagement_rate)
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching package details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package details',
      error: error.message
    });
  }
}));

// Update package (for creators)
router.put('/:packageId', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.user_type;
  const packageId = req.params.packageId;
  const { title, description, price, currency, deliverables, type, is_active } = req.body;

  if (userType !== 'creator') {
    return res.status(403).json({
      success: false,
      message: 'Only creators can update packages'
    });
  }

  try {
    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findFirst({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    // Check if package exists and belongs to this creator
    const existingPackage = await prisma.package.findFirst({
      where: {
        id: BigInt(packageId),
        creator_id: creatorProfile.id
      }
    });

    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found or you do not have permission to update it'
      });
    }

    // Update package
    const updatedPackage = await prisma.package.update({
      where: { id: BigInt(packageId) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(currency && { currency }),
        ...(deliverables !== undefined && { deliverables }),
        ...(type && { type }),
        ...(is_active !== undefined && { is_active }),
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
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package',
      error: error.message
    });
  }
}));

// Delete package (for creators)
router.delete('/:packageId', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.user_type;
  const packageId = req.params.packageId;

  if (userType !== 'creator') {
    return res.status(403).json({
      success: false,
      message: 'Only creators can delete packages'
    });
  }

  try {
    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findFirst({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
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
        success: false,
        message: 'Package not found or you do not have permission to delete it'
      });
    }

    // Check if there are active orders for this package
    if (existingPackage.orders.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete package with active orders. Please complete or cancel existing orders first.'
      });
    }

    // Delete package
    await prisma.package.delete({
      where: { id: BigInt(packageId) }
    });

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package',
      error: error.message
    });
  }
}));

module.exports = router; 