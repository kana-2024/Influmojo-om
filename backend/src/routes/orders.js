const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('../generated/client');
const orderService = require('../services/orderService');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/isSuperAdmin');
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
 * Order Routes with Integrated Auto-Ticket Creation
 * Handles cart checkout, order management, and automatic ticket generation
 */

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Checkout endpoint - create orders from cart items (packages) with auto-ticket creation
router.post('/checkout', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.user_type;
  const { cartItems } = req.body;

  if (userType !== 'brand') {
    return res.status(403).json({
      success: false,
      message: 'Only brands can checkout orders'
    });
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart items are required'
    });
  }

  try {
    const createdOrders = [];

    // Get brand profile first
    const brandProfile = await prisma.brandProfile.findFirst({
      where: { user_id: userId }
    });

    if (!brandProfile) {
      return res.status(404).json({
        success: false,
        message: 'Brand profile not found'
      });
    }

    // Process each cart item
    for (const cartItem of cartItems) {
      const { packageId, quantity = 1 } = cartItem;

      // Validate package exists and is active
      const package = await prisma.package.findFirst({
        where: { 
          id: BigInt(packageId),
          is_active: true
        },
        include: {
          creator: {
            include: {
              user: true
            }
          }
        }
      });

      if (!package) {
        return res.status(404).json({
          success: false,
          message: `Package with ID ${packageId} not found or inactive`
        });
      }

      // Check for existing pending/confirmed/in_progress orders for the same brand, creator, and package
      const existingOrder = await prisma.order.findFirst({
        where: {
          package_id: package.id,
          brand_id: brandProfile.id,
          creator_id: package.creator_id,
          status: {
            in: ['pending', 'confirmed', 'in_progress']
          },
          order_date: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // Check orders from last 5 minutes
          }
        }
      });

      if (existingOrder) {
        console.log(`⚠️ Duplicate order detected for package ${packageId}, brand ${brandProfile.id}, creator ${package.creator_id}`);
        return res.status(409).json({
          success: false,
          message: 'An order for this package already exists. Please check your orders.',
          existingOrderId: existingOrder.id.toString()
        });
      }

      // Calculate total amount
      const totalAmount = package.price * quantity;

      // Create order with automatic ticket generation
      console.log('🛒 Creating order with auto-ticket generation...');
      
      const orderData = {
        package_id: package.id,
        brand_id: brandProfile.id,
        creator_id: package.creator_id,
        total_amount: totalAmount,
        currency: package.currency,
        quantity: quantity
      };

      const result = await orderService.createOrder(orderData);
      
      console.log(`✅ Order #${result.order.id} created with ticket #${result.ticket.id}`);

      createdOrders.push({
        id: result.order.id.toString(),
        package: {
          id: result.order.package.id.toString(),
          title: result.order.package.title,
          description: result.order.package.description,
          price: parseFloat(result.order.package.price),
          currency: result.order.package.currency,
          deliverables: result.order.package.deliverables || []
        },
        brand: result.order.brand,
        creator: result.order.creator,
        quantity: result.order.quantity,
        total_amount: parseFloat(result.order.total_amount),
        currency: result.order.currency,
        status: result.order.status,
        order_date: result.order.order_date,
        created_at: result.order.order_date,
        // Ticket information
        ticket: {
          id: result.ticket.id.toString(),
          status: result.ticket.status,
          agent: result.ticket.agent
        }
      });
    }

    res.json({
      success: true,
      message: 'Orders created successfully with support tickets',
      orders: createdOrders
    });

  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process checkout',
      error: error.message
    });
  }
}));

// Create a new order with automatic ticket creation (direct API)
router.post('/', [
  body('package_id').isInt().withMessage('Valid package_id is required'),
  body('brand_id').isInt().withMessage('Valid brand_id is required'),
  body('creator_id').isInt().withMessage('Valid creator_id is required'),
  body('total_amount').isFloat({ min: 0 }).withMessage('Valid total_amount is required'),
  body('currency').optional().isString().withMessage('Currency must be a string')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const orderData = req.body;

    console.log('🛒 Creating new order with auto-ticket generation...');

    const result = await orderService.createOrder(orderData);

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        order: result.order,
        ticket: result.ticket
      }
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
}));

// Get all orders for the authenticated user
router.get('/', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.user_type;

  try {
    let orders = [];

    if (userType === 'creator') {
      // For creators, get orders for their packages
      // First get the creator profile ID
      const creatorProfile = await prisma.creatorProfile.findFirst({
        where: { user_id: userId }
      });

      if (!creatorProfile) {
        return res.json({
          success: true,
          orders: []
        });
      }

      orders = await prisma.order.findMany({
        where: {
          creator_id: {
            equals: creatorProfile.id
          }
        },
        include: {
          package: true,
          brand: {
            select: {
              company_name: true,
              location_city: true,
              location_state: true
            }
          },
          creator: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          ticket: {
            include: {
              agent: { select: { name: true, email: true } }
            }
          }
        },
        orderBy: {
          order_date: 'desc'
        }
      });

      // Transform the data to match the expected format
      orders = orders.map(order => ({
        id: order.id.toString(),
        package: {
          id: order.package.id.toString(),
          title: order.package.title,
          description: order.package.description,
          price: parseFloat(order.package.price),
          currency: order.package.currency,
          deliverables: order.package.deliverables || []
        },
        brand: order.brand,
        creator: order.creator,
        quantity: order.quantity,
        total_amount: parseFloat(order.total_amount),
        currency: order.currency,
        status: order.status,
        order_date: order.order_date,
        created_at: order.order_date,
        rejection_message: order.rejection_message || null,
        ticket: order.ticket ? {
          id: order.ticket.id.toString(),
          status: order.ticket.status,
          agent: order.ticket.agent
        } : null
      }));

    } else if (userType === 'brand') {
      // For brands, get orders they've placed
      // First get the brand profile ID
      const brandProfile = await prisma.brandProfile.findFirst({
        where: { user_id: userId }
      });

      if (!brandProfile) {
        return res.json({
          success: true,
          orders: []
        });
      }

      orders = await prisma.order.findMany({
        where: {
          brand_id: {
            equals: brandProfile.id
          }
        },
        include: {
          package: true,
          brand: {
            select: {
              company_name: true,
              location_city: true,
              location_state: true
            }
          },
          creator: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          ticket: {
            include: {
              agent: { select: { name: true, email: true } }
            }
          }
        },
        orderBy: {
          order_date: 'desc'
        }
      });

      // Transform the data to match the expected format
      orders = orders.map(order => ({
        id: order.id.toString(),
        package: {
          id: order.package.id.toString(),
          title: order.package.title,
          description: order.package.description,
          price: parseFloat(order.package.price),
          currency: order.package.currency,
          deliverables: order.package.deliverables || []
        },
        brand: order.brand,
        creator: order.creator,
        quantity: order.quantity,
        total_amount: parseFloat(order.total_amount),
        currency: order.currency,
        status: order.status,
        order_date: order.order_date,
        created_at: order.order_date,
        rejection_message: order.rejection_message || null,
        ticket: order.ticket ? {
          id: order.ticket.id.toString(),
          status: order.ticket.status,
          agent: order.ticket.agent
        } : null
      }));
    }

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
}));

// Get order with full details including ticket
router.get('/:orderId', asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('🔍 Getting order with ticket details:', orderId);

    const order = await orderService.getOrderWithTicket(orderId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: { order }
    });

  } catch (error) {
    console.error('❌ Error getting order:', error);
    res.status(500).json({
      error: 'Failed to get order',
      message: error.message
    });
  }
}));

// Update order status
router.put('/:orderId/status', [
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded']).withMessage('Valid status is required')
], validateRequest, asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log('🔄 Updating order status:', { orderId, status });

    const order = await orderService.updateOrderStatus(orderId, status);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: error.message
    });
  }
}));

// Get all orders with ticket information (admin only)
router.get('/', isAdmin, asyncHandler(async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    console.log('📊 Getting all orders with tickets:', { status, limit, offset });

    const result = await orderService.getAllOrdersWithTickets(status, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: { 
        orders: result.orders,
        total: result.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('❌ Error getting all orders:', error);
    res.status(500).json({
      error: 'Failed to get orders',
      message: error.message
    });
  }
}));

// Get orders for a specific brand
router.get('/brand/:brandId', asyncHandler(async (req, res) => {
  try {
    const { brandId } = req.params;
    const { status } = req.query;

    console.log('🏢 Getting orders for brand:', brandId, 'status:', status);

    const orders = await orderService.getBrandOrders(brandId, status);

    res.json({
      success: true,
      message: 'Brand orders retrieved successfully',
      data: { 
        brand_id: brandId,
        orders,
        total_orders: orders.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting brand orders:', error);
    res.status(500).json({
      error: 'Failed to get brand orders',
      message: error.message
    });
  }
}));

// Get orders for a specific creator
router.get('/creator/:creatorId', asyncHandler(async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { status } = req.query;

    console.log('👤 Getting orders for creator:', creatorId, 'status:', status);

    const orders = await orderService.getCreatorOrders(creatorId, status);

    res.json({
      success: true,
      message: 'Creator orders retrieved successfully',
      data: { 
        creator_id: creatorId,
        orders,
        total_orders: orders.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting creator orders:', error);
    res.status(500).json({
      error: 'Failed to get creator orders',
      message: error.message
    });
  }
}));

// Get order statistics (admin only)
router.get('/stats/overview', isAdmin, asyncHandler(async (req, res) => {
  try {
    console.log('📊 Getting order statistics...');

    // Get basic order statistics
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
    const completedOrders = await prisma.order.count({ where: { status: 'completed' } });
    const cancelledOrders = await prisma.order.count({ where: { status: 'cancelled' } });

    // Get orders with tickets
    const ordersWithTickets = await prisma.order.count({
      where: {
        ticket: { isNot: null }
      }
    });

    const stats = {
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      cancelled_orders: cancelledOrders,
      orders_with_tickets: ordersWithTickets,
      ticket_coverage_rate: totalOrders > 0 ? ((ordersWithTickets / totalOrders) * 100).toFixed(2) : 0
    };

    res.json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: { stats }
    });

  } catch (error) {
    console.error('❌ Error getting order statistics:', error);
    res.status(500).json({
      error: 'Failed to get order statistics',
      message: error.message
    });
  }
}));

module.exports = router; 