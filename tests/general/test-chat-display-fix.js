const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testChatDisplay() {
    try {
        console.log('🔍 Testing Chat Display Fix...\n');

        // Get a ticket with messages
        const ticket = await prisma.ticket.findFirst({
            include: {
                messages: {
                    include: {
                        sender: {
                            select: {
                                name: true,
                                user_type: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                },
                order: {
                    include: {
                        package: true,
                        brand: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
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
                },
                assigned_agent: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!ticket) {
            console.log('❌ No tickets found with messages');
            return;
        }

        console.log('✅ Found ticket with messages:');
        console.log(`- Ticket ID: ${ticket.id}`);
        console.log(`- Status: ${ticket.status}`);
        console.log(`- Messages count: ${ticket.messages.length}\n`);

        // Simulate the API response structure
        const messages = ticket.messages.map(message => ({
            id: message.id.toString(),
            text: message.message_text,
            sender: message.sender.user_type,
            sender_name: message.sender.name,
            timestamp: message.created_at,
            message_type: message.message_type,
            file_url: message.file_url,
            file_name: message.file_name
        }));

        console.log('📨 Messages data structure:');
        messages.forEach((msg, index) => {
            console.log(`\nMessage ${index + 1}:`);
            console.log(`- ID: ${msg.id}`);
            console.log(`- Sender: ${msg.sender} (${msg.sender_name})`);
            console.log(`- Text: ${msg.text.substring(0, 100)}${msg.text.length > 100 ? '...' : ''}`);
            console.log(`- Timestamp: ${msg.timestamp}`);
            console.log(`- Message Type: ${msg.message_type}`);
        });

        // Simulate frontend processing
        console.log('\n🎨 Simulating frontend HTML generation:');
        messages.forEach((msg, index) => {
            const isSent = msg.sender === 'admin';
            const messageClass = isSent ? 'sent' : 'received';
            const timestamp = new Date(msg.timestamp).toLocaleString();
            
            console.log(`\nMessage ${index + 1} HTML structure:`);
            console.log(`- CSS Class: ${messageClass}`);
            console.log(`- Sender: ${msg.sender_name || msg.sender}`);
            console.log(`- Content: ${msg.text.substring(0, 50)}${msg.text.length > 50 ? '...' : ''}`);
            console.log(`- Timestamp: ${timestamp}`);
        });

        console.log('\n✅ Chat display test completed successfully!');
        console.log('💡 The CSS fix should now allow messages to display properly in the admin panel.');

    } catch (error) {
        console.error('❌ Error testing chat display:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testChatDisplay(); 