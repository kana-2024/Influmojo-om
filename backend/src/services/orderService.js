const { PrismaClient } = require('../generated/client');
const crmService = require('./crmService');

const prisma = new PrismaClient();

class OrderService {
  /**
   * Create a new order and automatically create a support ticket
   */
  async createOrder(orderData) {
    try {
      console.log('🛒 Creating new order with auto-ticket generation...');
      
      // Validate required data
      const { package_id, brand_id, creator_id, total_amount, currency = 'USD' } = orderData;
      
      if (!package_id || !brand_id || !creator_id || !total_amount) {
        throw new Error('Missing required order data: package_id, brand_id, creator_id, total_amount');
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          package_id: BigInt(package_id),
          brand_id: BigInt(brand_id),
          creator_id: BigInt(creator_id),
          total_amount: parseFloat(total_amount),
          currency,
          quantity: orderData.quantity || 1,
          status: 'pending' // Initial status - waiting for creator approval
        },
        include: {
          package: {
            include: {
              creator: {
                include: {
                  user: { select: { name: true, email: true } }
                }
              }
            }
          },
          brand: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          creator: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        }
      });

      console.log(`✅ Order created: ID ${order.id} with status: ${order.status}`);

      // Automatically create a support ticket for this order
      const ticket = await crmService.createTicket(order.id);

      // Add initial system message with order details
      await this.addOrderDetailsMessage(ticket.id, order);

      console.log(`✅ Support ticket created: ID ${ticket.id} assigned to ${ticket.agent.name}`);

      return {
        order,
        ticket,
        message: 'Order created successfully with support ticket'
      };

    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  /**
   * Add initial message with order details to the ticket
   */
  async addOrderDetailsMessage(ticketId, order) {
    try {
      const orderDetails = `
🎫 **New Order Support Ticket**

**Order Details:**
- Order ID: #${order.id}
- Package: ${order.package.title}
- Amount: ${order.currency} ${order.total_amount}
- Status: ${order.status}

**Brand Information:**
- Company: ${order.brand.company_name}
- Contact: ${order.brand.user.name} (${order.brand.user.email})

**Creator Information:**
- Name: ${order.creator.user.name}
- Email: ${order.creator.user.email}
- Bio: ${order.creator.bio || 'No bio available'}

**Package Details:**
- Type: ${order.package.type}
- Description: ${order.package.description || 'No description available'}
- Price: ${order.package.currency} ${order.package.price}

This ticket has been automatically created to provide support for this order. Please assist the brand with any questions or issues related to this collaboration.
      `.trim();

      // Add system message with order details
      await crmService.addMessage(
        ticketId,
        order.brand.user_id, // Use brand user_id as sender for initial message
        orderDetails,
        'system'
      );

      console.log(`✅ Order details message added to ticket ${ticketId}`);

    } catch (error) {
      console.error('❌ Error adding order details message:', error);
      // Don't throw error as this is not critical for order creation
    }
  }

  /**
   * Get order with full details including ticket
   */
  async getOrderWithTicket(orderId) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: BigInt(orderId) },
        include: {
          package: {
            include: {
              creator: {
                include: {
                  user: { select: { name: true, email: true } }
                }
              }
            }
          },
          brand: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          creator: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          ticket: {
            include: {
              agent: { select: { name: true, email: true } },
              messages: {
                include: {
                  sender: { select: { name: true, user_type: true } }
                },
                orderBy: { created_at: 'asc' }
              }
            }
          }
        }
      });

      return order;
    } catch (error) {
      console.error('❌ Error getting order with ticket:', error);
      throw error;
    }
  }

  /**
   * Update order status and add status update to ticket
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      console.log(`📊 Updating order ${orderId} status to: ${newStatus}`);

      const order = await prisma.order.update({
        where: { id: BigInt(orderId) },
        data: { status: newStatus },
        include: {
          ticket: {
            include: {
              agent: { select: { name: true, email: true } }
            }
          },
          brand: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          creator: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          package: { select: { title: true } }
        }
      });

      // Add status update message to ticket if it exists
      if (order.ticket) {
        const statusMessages = {
          'pending': '⏳ **Order Status: Waiting for Creator Approval**\n\nThe creator has been notified and will review your order. You can contact support if you have any questions.',
          'accepted': '✅ **Order Status: Accepted by Creator**\n\nThe creator has accepted your order and will begin working on it.',
          'rejected': '❌ **Order Status: Rejected by Creator**\n\nThe creator has rejected this order. Please contact support for assistance.',
          'in_progress': '🚀 **Order Status: In Progress**\n\nThe creator is actively working on your order.',
          'review': '👀 **Order Status: Under Review**\n\nThe order is being reviewed before final delivery.',
          'completed': '🎉 **Order Status: Completed**\n\nYour order has been successfully completed and delivered.',
          'cancelled': '🚫 **Order Status: Cancelled**\n\nThis order has been cancelled.'
        };

        const statusMessage = statusMessages[newStatus] || `📊 **Order Status Updated**\n\nOrder #${order.id} status has been updated to: **${newStatus}**`;

        await crmService.addMessage(
          order.ticket.id.toString(),
          order.ticket.agent.id.toString(),
          statusMessage,
          'system',
          null,
          null,
          'system'
        );

        console.log(`✅ Status update message added to ticket ${order.ticket.id}`);
      }

      return order;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Get all orders with ticket information
   */
  async getAllOrdersWithTickets(status = null, limit = 50, offset = 0) {
    try {
      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          package: {
            include: {
              creator: {
                include: {
                  user: { select: { name: true, email: true } }
                }
              }
            }
          },
          brand: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          creator: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          ticket: {
            include: {
              agent: { select: { name: true, email: true } },
              messages: {
                orderBy: { created_at: 'desc' },
                take: 1
              }
            }
          }
        },
        orderBy: { order_date: 'desc' },
        take: limit,
        skip: offset
      });

      const total = await prisma.order.count({ where: whereClause });

      return { orders, total };
    } catch (error) {
      console.error('❌ Error getting orders with tickets:', error);
      throw error;
    }
  }

  /**
   * Get orders for a specific brand with tickets
   */
  async getBrandOrders(brandId, status = null) {
    try {
      const whereClause = { brand_id: BigInt(brandId) };
      if (status) {
        whereClause.status = status;
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          package: {
            include: {
              creator: {
                include: {
                  user: { select: { name: true, email: true } }
                }
              }
            }
          },
          creator: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          ticket: {
            include: {
              agent: { select: { name: true, email: true } },
              messages: {
                orderBy: { created_at: 'desc' },
                take: 1
              }
            }
          }
        },
        orderBy: { order_date: 'desc' }
      });

      return orders;
    } catch (error) {
      console.error('❌ Error getting brand orders:', error);
      throw error;
    }
  }

  /**
   * Get orders for a specific creator with tickets
   */
  async getCreatorOrders(creatorId, status = null) {
    try {
      const whereClause = { creator_id: BigInt(creatorId) };
      if (status) {
        whereClause.status = status;
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          package: true,
          brand: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          ticket: {
            include: {
              agent: { select: { name: true, email: true } },
              messages: {
                orderBy: { created_at: 'desc' },
                take: 1
              }
            }
          }
        },
        orderBy: { order_date: 'desc' }
      });

      return orders;
    } catch (error) {
      console.error('❌ Error getting creator orders:', error);
      throw error;
    }
  }

  /**
   * Creator accepts an order
   */
  async acceptOrder(orderId, creatorId) {
    try {
      console.log(`✅ Creator ${creatorId} accepting order ${orderId}`);

      // Verify the creator owns this order
      const order = await prisma.order.findUnique({
        where: { id: BigInt(orderId) },
        include: {
          creator: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          ticket: {
            include: {
              agent: { select: { name: true, email: true } }
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.creator_id.toString() !== creatorId) {
        throw new Error('Unauthorized: Only the assigned creator can accept this order');
      }

      if (order.status !== 'pending') {
        throw new Error(`Order cannot be accepted in current status: ${order.status}`);
      }

      // Update order status to accepted
      const updatedOrder = await this.updateOrderStatus(orderId, 'accepted');

      // Add creator acceptance message to ticket
      if (order.ticket) {
        await crmService.addMessage(
          order.ticket.id.toString(),
          creatorId,
          `✅ **Order Accepted**\n\nI have accepted this order and will begin working on it. I'll keep you updated on the progress!`,
          'text',
          null,
          null,
          'creator'
        );
      }

      console.log(`✅ Order ${orderId} accepted by creator ${creatorId}`);
      return updatedOrder;

    } catch (error) {
      console.error('❌ Error accepting order:', error);
      throw error;
    }
  }

  /**
   * Creator rejects an order
   */
  async rejectOrder(orderId, creatorId, rejectionReason = null) {
    try {
      console.log(`❌ Creator ${creatorId} rejecting order ${orderId}`);

      // Verify the creator owns this order
      const order = await prisma.order.findUnique({
        where: { id: BigInt(orderId) },
        include: {
          creator: {
            include: {
              user: { select: { name: true, email: true } }
            }
          },
          ticket: {
            include: {
              agent: { select: { name: true, email: true } }
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.creator_id.toString() !== creatorId) {
        throw new Error('Unauthorized: Only the assigned creator can reject this order');
      }

      if (order.status !== 'pending') {
        throw new Error(`Order cannot be rejected in current status: ${order.status}`);
      }

      // Update order status to rejected
      const updatedOrder = await this.updateOrderStatus(orderId, 'rejected');

      // Add creator rejection message to ticket
      if (order.ticket) {
        const rejectionMessage = rejectionReason 
          ? `❌ **Order Rejected**\n\nI have rejected this order.\n\n**Reason:** ${rejectionReason}\n\nPlease contact support if you have any questions.`
          : `❌ **Order Rejected**\n\nI have rejected this order. Please contact support if you have any questions.`;

        await crmService.addMessage(
          order.ticket.id.toString(),
          creatorId,
          rejectionMessage,
          'text',
          null,
          null,
          'creator'
        );
      }

      console.log(`✅ Order ${orderId} rejected by creator ${creatorId}`);
      return updatedOrder;

    } catch (error) {
      console.error('❌ Error rejecting order:', error);
      throw error;
    }
  }
}

module.exports = new OrderService(); 