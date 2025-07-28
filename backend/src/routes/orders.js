const express = require('express');
const { PrismaClient } = require('../generated/client');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Checkout endpoint - create orders from cart items (packages)
router.post('/checkout', authenticateToken, asyncHandler(async (req, res) => {
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

      // Create order
      const order = await prisma.order.create({
        data: {
          package_id: package.id,
          brand_id: brandProfile.id,
          creator_id: package.creator_id,
          quantity: quantity,
          total_amount: totalAmount,
          currency: package.currency,
          status: 'pending'
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
          }
        }
      });

      createdOrders.push({
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
        created_at: order.order_date
      });
    }

    res.json({
      success: true,
      message: 'Orders created successfully',
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

// Get all orders for the authenticated user
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
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
        rejection_message: order.rejection_message || null
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
        rejection_message: order.rejection_message || null
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

// Get specific order details
router.get('/:orderId', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.user_type;
  const orderId = req.params.orderId;

  try {
    let order = null;

    if (userType === 'creator') {
      // For creators, get order details for their packages
      // First get the creator profile ID
      const creatorProfile = await prisma.creatorProfile.findFirst({
        where: { user_id: userId }
      });

      if (!creatorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Creator profile not found'
        });
      }

      order = await prisma.order.findFirst({
        where: {
          id: BigInt(orderId),
          creator_id: creatorProfile.id
        },
        include: {
          package: true,
          brand: {
            select: {
              company_name: true,
              location_city: true,
              location_state: true,
              industry: true,
              website_url: true
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
          }
        }
      });

    } else if (userType === 'brand') {
      // For brands, get order details they've placed
      // First get the brand profile ID
      const brandProfile = await prisma.brandProfile.findFirst({
        where: { user_id: userId }
      });

      if (!brandProfile) {
        return res.status(404).json({
          success: false,
          message: 'Brand profile not found'
        });
      }

      order = await prisma.order.findFirst({
        where: {
          id: BigInt(orderId),
          brand_id: brandProfile.id
        },
        include: {
          package: true,
          brand: {
            select: {
              company_name: true,
              location_city: true,
              location_state: true,
              industry: true,
              website_url: true
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
          }
        }
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderResponse = {
      id: order.id.toString(),
      package: {
        id: order.package.id.toString(),
        title: order.package.title,
        description: order.package.description,
        price: parseFloat(order.package.price),
        currency: order.package.currency,
        deliverables: order.package.deliverables || [],
        type: order.package.type
      },
      brand: order.brand,
      creator: order.creator,
      quantity: order.quantity,
      total_amount: parseFloat(order.total_amount),
      currency: order.currency,
      status: order.status,
      order_date: order.order_date,
      completed_at: order.completed_at,
      created_at: order.order_date,
      rejection_message: order.rejection_message || null
    };

    res.json({
      success: true,
      order: orderResponse
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
}));

// Accept order (creators only)
router.put('/:orderId/accept', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.user_type;
  const orderId = req.params.orderId;

  if (userType !== 'creator') {
    return res.status(403).json({
      success: false,
      message: 'Only creators can accept orders'
    });
  }

  try {
    // First get the creator profile ID
    const creatorProfile = await prisma.creatorProfile.findFirst({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    // Find the order and verify it belongs to this creator
    const order = await prisma.order.findFirst({
      where: {
        id: BigInt(orderId),
        creator_id: creatorProfile.id,
        status: 'pending'
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not in pending status'
      });
    }

    // Update order status to confirmed
    const updatedOrder = await prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { status: 'confirmed' }
    });

    res.json({
      success: true,
      message: 'Order accepted successfully',
      order: {
        id: updatedOrder.id.toString(),
        status: updatedOrder.status
      }
    });

  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept order',
      error: error.message
    });
  }
}));

// Reject order (creators only)
router.put('/:orderId/reject', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.user_type;
  const orderId = req.params.orderId;
  const { rejectionMessage } = req.body;

  if (userType !== 'creator') {
    return res.status(403).json({
      success: false,
      message: 'Only creators can reject orders'
    });
  }

  try {
    // First get the creator profile ID
    const creatorProfile = await prisma.creatorProfile.findFirst({
      where: { user_id: userId }
    });

    if (!creatorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Creator profile not found'
      });
    }

    // Find the order and verify it belongs to this creator
    const order = await prisma.order.findFirst({
      where: {
        id: BigInt(orderId),
        creator_id: creatorProfile.id,
        status: 'pending'
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not in pending status'
      });
    }

    // Generate appealing rejection message if not provided
    const appealingMessage = rejectionMessage || generateAppealingRejectionMessage();

    // Update order status to cancelled with rejection message
    const updatedOrder = await prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { 
        status: 'cancelled',
        rejection_message: appealingMessage
      }
    });

    res.json({
      success: true,
      message: 'Order rejected successfully',
      order: {
        id: updatedOrder.id.toString(),
        status: updatedOrder.status,
        rejection_message: updatedOrder.rejection_message
      }
    });

  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject order',
      error: error.message
    });
  }
}));

// Helper function to generate appealing rejection messages
function generateAppealingRejectionMessage() {
  const messages = [
    "Thank you for considering my services! Unfortunately, I'm currently unable to take on this project due to my current workload. I'd love to collaborate in the future when my schedule opens up. In the meantime, I'd recommend checking out some other talented creators who might be a perfect fit for your project!",
    
    "I appreciate you reaching out with this opportunity! At the moment, I'm fully booked with existing commitments and want to ensure I can deliver the quality you deserve. Please explore our platform to discover other amazing creators who are available and excited to work on your project!",
    
    "Thank you for your interest in working together! I'm currently at capacity with ongoing projects and wouldn't want to compromise on the quality of your content. I encourage you to browse through our community of skilled creators who are ready to bring your vision to life!",
    
    "I'm honored that you considered me for this project! Unfortunately, my current schedule doesn't allow me to take on additional work while maintaining the high standards I set for myself. Please take a look at some other fantastic creators on our platform who would be thrilled to collaborate with you!",
    
    "Thank you for reaching out! I'm currently focused on delivering excellence to my existing clients and wouldn't want to overcommit. I'd love to work together in the future! Meanwhile, I'm sure you'll find the perfect creator match for your project among our talented community."
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = router; 