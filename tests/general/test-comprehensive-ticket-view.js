const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testComprehensiveTicketView() {
    console.log('🧪 Testing Comprehensive Ticket View Functionality...\n');

    try {
        // 1. Check if we have tickets to test with
        const tickets = await prisma.ticket.findMany({
            include: {
                order: {
                    include: {
                        brand: { include: { user: { select: { name: true, email: true } } } },
                        creator: { include: { user: { select: { name: true, email: true } } } },
                        package: { select: { title: true } }
                    }
                },
                agent: { select: { name: true, email: true } },
                messages: {
                    include: {
                        sender: { select: { name: true, user_type: true } }
                    },
                    orderBy: { created_at: 'asc' }
                }
            },
            take: 1
        });

        if (tickets.length === 0) {
            console.log('❌ No tickets found. Please create a ticket first.');
            return;
        }

        const ticket = tickets[0];
        console.log('✅ Found ticket for testing:', {
            id: ticket.id.toString(),
            status: ticket.status,
            priority: ticket.priority,
            agent: ticket.agent?.name || 'Unassigned',
            order_id: ticket.order_id.toString()
        });

        // 2. Test ticket data structure for modal
        console.log('\n📋 Ticket Information for Modal:');
        console.log('- Ticket ID:', ticket.id.toString());
        console.log('- Status:', ticket.status);
        console.log('- Priority:', ticket.priority);
        console.log('- Created:', ticket.created_at.toLocaleString());
        console.log('- Updated:', ticket.updated_at.toLocaleString());
        console.log('- Assigned Agent:', ticket.agent?.name || 'Unassigned');

        // 3. Test order details
        console.log('\n📦 Order Details:');
        console.log('- Order ID:', ticket.order_id.toString());
        console.log('- Package:', ticket.order?.package?.title || 'N/A');
        console.log('- Total Amount:', ticket.order?.total_amount || 'N/A');
        console.log('- Quantity:', ticket.order?.quantity || 'N/A');
        console.log('- Order Status:', ticket.order?.status || 'N/A');

        // 4. Test brand and creator information
        console.log('\n👥 Participants Information:');
        console.log('Brand:');
        console.log('  - Name:', ticket.order?.brand?.name || 'N/A');
        console.log('  - Email:', ticket.order?.brand?.user?.email || 'N/A');
        console.log('  - Phone:', ticket.order?.brand?.phone || 'N/A');
        
        console.log('Creator:');
        console.log('  - Name:', ticket.order?.creator?.name || 'N/A');
        console.log('  - Email:', ticket.order?.creator?.user?.email || 'N/A');
        console.log('  - Phone:', ticket.order?.creator?.phone || 'N/A');

        // 5. Test communication options
        console.log('\n💬 Communication Options:');
        console.log('- StreamChat Channel:', ticket.stream_channel_id);
        console.log('- Brand Phone Available:', !!(ticket.order?.brand?.phone));
        console.log('- Creator Phone Available:', !!(ticket.order?.creator?.phone));
        console.log('- Brand Email Available:', !!(ticket.order?.brand?.user?.email));
        console.log('- Creator Email Available:', !!(ticket.order?.creator?.user?.email));

        // 6. Test chat history
        console.log('\n💬 Chat History:');
        console.log('- Total Messages:', ticket.messages.length);
        
        if (ticket.messages.length > 0) {
            ticket.messages.forEach((msg, index) => {
                console.log(`  Message ${index + 1}:`);
                console.log(`    - Sender: ${msg.sender.name} (${msg.sender.user_type})`);
                console.log(`    - Type: ${msg.message_type}`);
                console.log(`    - Time: ${msg.created_at.toLocaleString()}`);
                console.log(`    - Content: ${msg.message_text.substring(0, 100)}${msg.message_text.length > 100 ? '...' : ''}`);
            });
        } else {
            console.log('  - No messages yet');
        }

        // 7. Test priority update functionality
        console.log('\n🎯 Priority Update Test:');
        const currentPriority = ticket.priority;
        const newPriority = currentPriority === 'medium' ? 'high' : 'medium';
        
        console.log(`- Current Priority: ${currentPriority}`);
        console.log(`- Would update to: ${newPriority}`);
        console.log('- Priority update endpoint: PUT /api/crm/tickets/:ticketId/priority');

        // 8. Test status update functionality
        console.log('\n📊 Status Update Test:');
        const currentStatus = ticket.status;
        const newStatus = currentStatus === 'open' ? 'in_progress' : 'open';
        
        console.log(`- Current Status: ${currentStatus}`);
        console.log(`- Would update to: ${newStatus}`);
        console.log('- Status update endpoint: PUT /api/crm/tickets/:ticketId/status');

        // 9. Test reassignment functionality
        console.log('\n🔄 Reassignment Test:');
        const agents = await prisma.user.findMany({
            where: { user_type: 'admin' },
            select: { id: true, name: true, email: true }
        });
        
        console.log(`- Current Agent: ${ticket.agent?.name || 'Unassigned'}`);
        console.log(`- Available Agents: ${agents.length}`);
        agents.forEach(agent => {
            console.log(`  - ${agent.name} (${agent.email})`);
        });
        console.log('- Reassignment endpoint: PUT /api/crm/tickets/:ticketId/reassign');

        // 10. Test telephony and email functions
        console.log('\n📞 Telephony & Email Functions:');
        console.log('- Call Brand: tel:${ticket.order?.brand?.phone}');
        console.log('- Call Creator: tel:${ticket.order?.creator?.phone}');
        console.log('- Email Brand: mailto:${ticket.order?.brand?.user?.email}');
        console.log('- Email Creator: mailto:${ticket.order?.creator?.user?.email}');
        console.log('- Schedule Call: Google Calendar integration');
        console.log('- Send Update: System message + email to both parties');

        console.log('\n✅ Comprehensive Ticket View Test Completed!');
        console.log('\n📝 Next Steps:');
        console.log('1. Open admin-panel.html in your browser');
        console.log('2. Login with your admin credentials');
        console.log('3. Go to the Tickets tab');
        console.log('4. Click "View" on any ticket');
        console.log('5. Verify all sections are displayed correctly:');
        console.log('   - Ticket Information (including priority)');
        console.log('   - Order Details');
        console.log('   - Brand & Creator Information');
        console.log('   - Communication Options (Chat, Telephony, Email)');
        console.log('   - Chat History');
        console.log('   - Ticket Actions (Status, Reassignment, Priority)');

    } catch (error) {
        console.error('❌ Error testing comprehensive ticket view:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testComprehensiveTicketView(); 