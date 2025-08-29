const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('../generated/client');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

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

/**
 * Cart Persistence Routes
 * Provides backend storage for cart items across login sessions
 * Complements existing frontend cart system
 */

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Get user's cart from backend
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: userId },
      include: {
        package: {
          include: {
            creator: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    profile_image_url: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

          // Transform to match frontend CartItem interface (both webapp and mobile)
      const transformedItems = cartItems.map(item => ({
        id: item.id.toString(),
        creatorId: item.package.creator.user.id.toString(),
        creatorName: item.package.creator.user.name,
        creatorImage: item.package.creator.user.profile_image_url,
        packageId: item.package.id.toString(),
        packageName: item.package.title,
        packageDescription: item.package.description || '',
        packagePrice: parseFloat(item.package.price),
        packageCurrency: item.package.currency, // Consistent field name for both platforms
        packageDuration: 'custom', // Default since not in package model
        platform: 'custom', // Default since not in package model
        quantity: item.quantity,
        addedAt: item.created_at,
        deliveryTime: item.delivery_time,
        additionalInstructions: item.additional_instructions,
        references: item.references || []
      }));

    res.json({
      success: true,
      cartItems: transformedItems
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart',
      message: error.message
    });
  }
}));

// Add item to backend cart
router.post('/add', [
  body('packageId').isString().notEmpty(),
  body('quantity').isInt({ min: 1 }).optional(),
  body('deliveryTime').isInt({ min: 1, max: 365 }).optional(),
  body('additionalInstructions').isString().optional(),
  body('references').isArray().optional(),
  validateRequest
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { packageId, quantity = 1, deliveryTime, additionalInstructions, references } = req.body;

  try {
    // Verify package exists and is active
    const package = await prisma.package.findFirst({
      where: { 
        id: BigInt(packageId),
        is_active: true
      }
    });

    if (!package) {
      return res.status(404).json({
        success: false,
        error: 'Package not found or inactive'
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        user_id_package_id: {
          user_id: userId,
          package_id: BigInt(packageId)
        }
      }
    });

    if (existingItem) {
      // Update existing item
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          delivery_time: deliveryTime || existingItem.delivery_time,
          additional_instructions: additionalInstructions || existingItem.additional_instructions,
          references: references || existingItem.references,
          updated_at: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Cart item updated',
        cartItem: updatedItem
      });
    } else {
      // Create new cart item
      const newItem = await prisma.cartItem.create({
        data: {
          user_id: userId,
          package_id: BigInt(packageId),
          quantity,
          delivery_time: deliveryTime,
          additional_instructions: additionalInstructions,
          references: references || []
        }
      });

      res.json({
        success: true,
        message: 'Item added to cart',
        cartItem: newItem
      });
    }

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
      message: error.message
    });
  }
}));

// Update cart item
router.put('/update/:itemId', [
  body('quantity').isInt({ min: 1 }).optional(),
  body('deliveryTime').isInt({ min: 1, max: 365 }).optional(),
  body('additionalInstructions').isString().optional(),
  body('references').isArray().optional(),
  validateRequest
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.itemId;
  const updates = req.body;

  try {
    // Verify item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: BigInt(itemId),
        user_id: userId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    // Update item
    const updatedItem = await prisma.cartItem.update({
      where: { id: BigInt(itemId) },
      data: {
        quantity: updates.quantity || cartItem.quantity,
        delivery_time: updates.deliveryTime !== undefined ? updates.deliveryTime : cartItem.delivery_time,
        additional_instructions: updates.additionalInstructions !== undefined ? updates.additionalInstructions : cartItem.additional_instructions,
        references: updates.references !== undefined ? updates.references : cartItem.references,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Cart item updated',
      cartItem: updatedItem
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item',
      message: error.message
    });
  }
}));

// Remove item from backend cart
router.delete('/remove/:itemId', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.itemId;

  try {
    // Verify item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: BigInt(itemId),
        user_id: userId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: BigInt(itemId) }
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove cart item',
      message: error.message
    });
  }
}));

// Clear user's entire cart
router.delete('/clear', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.cartItem.deleteMany({
      where: { user_id: userId }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
      message: error.message
    });
  }
}));

// Sync frontend cart with backend (for login/logout)
router.post('/sync', [
  body('cartItems').isArray(),
  validateRequest
], asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { cartItems } = req.body;

  try {
    // Clear existing cart
    await prisma.cartItem.deleteMany({
      where: { user_id: userId }
    });

    // Add new items
    if (cartItems.length > 0) {
      const itemsToCreate = cartItems.map(item => ({
        user_id: userId,
        package_id: BigInt(item.packageId),
        quantity: item.quantity,
        delivery_time: item.deliveryTime,
        additional_instructions: item.additionalInstructions,
        references: item.references || []
      }));

      await prisma.cartItem.createMany({
        data: itemsToCreate
      });
    }

    res.json({
      success: true,
      message: 'Cart synced successfully',
      syncedItems: cartItems.length
    });

  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync cart',
      message: error.message
    });
  }
}));

module.exports = router;
