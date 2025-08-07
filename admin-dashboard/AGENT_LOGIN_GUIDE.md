# Agent Login Guide

This guide explains how to set up and log in as an agent in the Influmojo Admin Dashboard.

## 🎯 **Overview**

Agents are support staff who handle customer tickets and provide assistance. They have access to:
- **Assigned Tickets Only**: Agents can only see tickets assigned to them
- **Real-time Chat**: Communicate with customers through StreamChat
- **Ticket Management**: Update ticket status and respond to inquiries
- **Personal Dashboard**: View their own statistics and performance

## 🚀 **Setup Process**

### **Step 1: Create Agent User**

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Run the agent creation script**
   ```bash
   node create-agent.js
   ```

3. **Expected Output**
   ```
   🤖 Creating agent user...
   ✅ Agent created successfully!
   Agent ID: 123
   Agent Name: John Agent
   Agent Email: agent@influmojo.com
   Agent Type: agent
   
   🎫 JWT Token for agent login:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   📝 Use this token to login to the agent dashboard at:
   http://localhost:3000/agent
   ```

### **Step 2: Access Agent Dashboard**

1. **Open the admin dashboard**
   ```
   http://localhost:3000
   ```

2. **Paste the JWT token**
   - Copy the JWT token from the console output
   - Paste it in the login form
   - Click "Sign In"

3. **Automatic Redirect**
   - The system will automatically detect the agent role
   - You'll be redirected to `/agent` dashboard

## 🔐 **Agent Login Methods**

### **Method 1: JWT Token Login (Recommended)**

1. **Get JWT Token**
   - Run `node create-agent.js` to get a token
   - Or ask your super admin for a token

2. **Login Process**
   - Go to `http://localhost:3000`
   - Paste the JWT token in the login form
   - Click "Sign In"
   - You'll be automatically redirected to the agent dashboard

### **Method 2: Programmatic Login**

If you need to create agents programmatically:

```javascript
// Example: Create agent via API
const agentData = {
  name: 'Jane Agent',
  email: 'jane.agent@influmojo.com',
  phone: '+1234567891',
  user_type: 'agent',
  status: 'active'
};

// Use the create-agent.js script or create via database
```

## 👥 **Agent Dashboard Features**

### **Dashboard Overview**
- **Welcome Message**: Personalized greeting with agent name
- **Connection Status**: StreamChat connection indicator
- **Role Badge**: Shows "Agent" role badge
- **Logout Button**: Secure logout functionality

### **Statistics Cards**
- **My Tickets**: Total tickets assigned to the agent
- **Open Tickets**: Number of open tickets
- **Resolved**: Number of resolved tickets

### **Ticket Management**
- **Assigned Tickets**: List of tickets assigned to the agent
- **Ticket Details**: Order information, customer details
- **Status Updates**: Ability to update ticket status
- **Real-time Chat**: Direct communication with customers

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. "Access denied. Agents only." Error**
- **Cause**: User type is not 'agent'
- **Solution**: Ensure the user was created with `user_type: 'agent'`

#### **2. "Authentication failed" Error**
- **Cause**: Invalid or expired JWT token
- **Solution**: Generate a new token using `node create-agent.js`

#### **3. "No tickets assigned" Message**
- **Cause**: Agent has no tickets assigned yet
- **Solution**: Super admin needs to assign tickets to the agent

#### **4. Chat not connecting**
- **Cause**: StreamChat configuration issues
- **Solution**: Check StreamChat credentials in backend environment

### **Debug Commands**

```bash
# Check if agent exists in database
npx prisma studio

# Verify agent creation
node create-agent.js

# Check backend logs
npm run dev
```

## 📋 **Agent Management**

### **Creating Multiple Agents**

To create multiple agents, modify the `create-agent.js` script:

```javascript
// Example: Create multiple agents
const agents = [
  {
    name: 'John Agent',
    email: 'john.agent@influmojo.com',
    phone: '+1234567890'
  },
  {
    name: 'Jane Agent', 
    email: 'jane.agent@influmojo.com',
    phone: '+1234567891'
  }
];

// Run for each agent
```

### **Agent Permissions**

Agents have the following permissions:
- ✅ View assigned tickets only
- ✅ Send messages in assigned tickets
- ✅ Update ticket status
- ✅ View ticket history
- ✅ Access personal dashboard
- ❌ View other agents' tickets
- ❌ Access super admin features
- ❌ Create or delete tickets

## 🔄 **Workflow**

### **Typical Agent Workflow**

1. **Login**: Agent logs in with JWT token
2. **Dashboard**: Views assigned tickets and statistics
3. **Ticket Selection**: Clicks on a ticket to view details
4. **Chat**: Communicates with customer through real-time chat
5. **Status Update**: Updates ticket status as needed
6. **Resolution**: Marks ticket as resolved when complete

### **Super Admin Workflow**

1. **Create Agents**: Use `create-agent.js` script
2. **Assign Tickets**: Assign tickets to specific agents
3. **Monitor Performance**: View agent performance in super admin dashboard
4. **Intervene**: Join any conversation if needed

## 📞 **Support**

### **Getting Help**

1. **Technical Issues**: Check the troubleshooting section
2. **Access Problems**: Contact your super admin
3. **Feature Requests**: Submit through the development team

### **Contact Information**

- **Super Admin**: For access and permissions
- **Development Team**: For technical issues
- **Documentation**: Check this guide and README.md

## 🔒 **Security Notes**

### **Token Security**
- JWT tokens expire after 7 days
- Keep tokens secure and don't share them
- Logout when finished to invalidate session

### **Data Privacy**
- Agents can only see their assigned tickets
- Customer data is protected and isolated
- All actions are logged for audit purposes

## 📈 **Performance Tips**

### **For Agents**
- Keep chat windows open for real-time updates
- Update ticket status promptly
- Use clear, professional communication
- Logout when not actively working

### **For Super Admins**
- Monitor agent performance regularly
- Assign tickets based on agent workload
- Provide training and support as needed
- Review and optimize ticket distribution

---

**Last Updated**: December 2024
**Version**: 1.0
**Author**: Influmojo Development Team 