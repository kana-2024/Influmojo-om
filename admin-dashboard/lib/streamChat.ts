import { StreamChat } from 'stream-chat';

// StreamChat client instance
let streamClient: StreamChat | null = null;

// Initialize StreamChat client
export const initializeStreamChat = async (apiKey: string) => {
  if (!streamClient) {
    streamClient = StreamChat.getInstance(apiKey);
  }
  return streamClient;
};

// Get StreamChat client instance
export const getStreamChatClient = () => {
  if (!streamClient) {
    throw new Error('StreamChat client not initialized. Call initializeStreamChat first.');
  }
  return streamClient;
};

// Connect user to StreamChat
export const connectUser = async (userId: string, token: string) => {
  const client = getStreamChatClient();
  
  try {
    await client.connectUser(
      {
        id: userId,
        name: userId,
        role: 'admin',
      },
      token
    );
    
    console.log(`✅ User ${userId} connected to StreamChat`);
    return client;
  } catch (error) {
    console.error('❌ Error connecting user to StreamChat:', error);
    throw error;
  }
};

// Disconnect user from StreamChat
export const disconnectUser = async () => {
  if (streamClient) {
    try {
      await streamClient.disconnectUser();
      console.log('✅ User disconnected from StreamChat');
    } catch (error) {
      console.error('❌ Error disconnecting user from StreamChat:', error);
    }
  }
};

// Join unified ticket channel
export const joinUnifiedTicketChannel = async (ticketId: string, userId: string, userRole: string) => {
  const client = getStreamChatClient();
  
  try {
    const channelId = `ticket_${ticketId}`;
    const channel = client.channel('messaging', channelId);
    await channel.watch();
    
    console.log(`✅ Joined unified ticket channel: ${channelId} as ${userRole}_${userId}`);
    return channel;
  } catch (error) {
    console.error('❌ Error joining unified ticket channel:', error);
    throw error;
  }
};

// Send message to unified channel with role
export const sendUnifiedMessage = async (channelId: string, message: string, userId: string, userRole: string) => {
  const client = getStreamChatClient();
  
  try {
    const channel = client.channel('messaging', channelId);
    const response = await channel.sendMessage({
      text: message,
      user_id: `${userRole}_${userId}`,
      customType: 'agent_message',
      sender_role: userRole,
      sender_id: `${userRole}_${userId}`
    });
    
    console.log(`✅ Message sent to unified channel ${channelId} as ${userRole}`);
    return response;
  } catch (error) {
    console.error('❌ Error sending message to unified channel:', error);
    throw error;
  }
};

// Get channel messages
export const getChannelMessages = async (channelId: string, limit: number = 50) => {
  const client = getStreamChatClient();
  
  try {
    const channel = client.channel('messaging', channelId);
    const response = await channel.query({ messages: { limit } });
    
    console.log(`✅ Retrieved ${response.messages?.length || 0} messages from channel ${channelId}`);
    return response.messages || [];
  } catch (error) {
    console.error('❌ Error getting channel messages:', error);
    throw error;
  }
};

// Get user's channels
export const getUserChannels = async () => {
  const client = getStreamChatClient();
  
  try {
    const response = await client.queryChannels({
      members: { $in: [client.userID!] }
    });
    
    console.log(`✅ Retrieved ${response.length} channels for user`);
    return response;
  } catch (error) {
    console.error('❌ Error getting user channels:', error);
    throw error;
  }
};

// Check if user is connected
export const isUserConnected = () => {
  return streamClient?.userID ? true : false;
};

// Get current user ID
export const getCurrentUserId = () => {
  return streamClient?.userID || null;
}; 