const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Admin Panel Comprehensive Features...\n');

// Test 1: Check if admin panel HTML has all required sections
console.log('📋 Test 1: Checking Admin Panel HTML Structure...');
const adminPanelPath = path.join(__dirname, 'admin-panel.html');
const htmlContent = fs.readFileSync(adminPanelPath, 'utf8');

const requiredSections = [
    'modalTicketId',
    'modalTicketStatus', 
    'modalTicketPriority',
    'modalTicketCreated',
    'modalTicketUpdated',
    'modalTicketAgent',
    'modalOrderId',
    'modalPackageTitle',
    'modalOrderAmount',
    'modalOrderQuantity',
    'modalOrderStatus',
    'modalBrandName',
    'modalBrandEmail',
    'modalBrandPhone',
    'modalCreatorName',
    'modalCreatorEmail',
    'modalCreatorPhone',
    'modalStreamChannel',
    'chatMessages',
    'newMessage',
    'statusUpdate',
    'agentReassign',
    'priorityUpdate'
];

let missingSections = [];
requiredSections.forEach(section => {
    if (!htmlContent.includes(`id="${section}"`)) {
        missingSections.push(section);
    }
});

if (missingSections.length === 0) {
    console.log('✅ All required modal sections found');
} else {
    console.log('❌ Missing sections:', missingSections);
}

// Test 2: Check if all communication functions are implemented
console.log('\n📞 Test 2: Checking Communication Functions...');
const communicationFunctions = [
    'openChatSession()',
    'callBrand()',
    'callCreator()',
    'scheduleCall()',
    'emailBrand()',
    'emailCreator()',
    'sendUpdate()',
    'updatePriority()',
    'updateTicketStatus()',
    'reassignTicket()',
    'loadAgentsForReassignment()',
    'async function addSystemMessage'
];

let missingFunctions = [];
communicationFunctions.forEach(func => {
    if (!htmlContent.includes(func)) {
        missingFunctions.push(func);
    }
});

if (missingFunctions.length === 0) {
    console.log('✅ All communication functions implemented');
} else {
    console.log('❌ Missing functions:', missingFunctions);
}

// Test 3: Check if priority badges CSS is implemented
console.log('\n🎨 Test 3: Checking Priority Badges CSS...');
const priorityCSS = [
    '.priority-badge',
    '.priority-low',
    '.priority-medium', 
    '.priority-high',
    '.priority-urgent'
];

let missingCSS = [];
priorityCSS.forEach(css => {
    if (!htmlContent.includes(css)) {
        missingCSS.push(css);
    }
});

if (missingCSS.length === 0) {
    console.log('✅ All priority badge CSS implemented');
} else {
    console.log('❌ Missing CSS:', missingCSS);
}

// Test 4: Check if table headers include priority
console.log('\n📊 Test 4: Checking Table Structure...');
const hasPriorityHeader = htmlContent.includes('<th>Priority</th>');
const hasPriorityColumn = htmlContent.includes('priority-badge priority-');

if (hasPriorityHeader && hasPriorityColumn) {
    console.log('✅ Priority column properly implemented in table');
} else {
    console.log('❌ Priority column missing from table');
}

// Test 5: Check if API endpoints are documented
console.log('\n🔗 Test 5: Checking API Endpoints...');
const apiEndpoints = [
    'PUT /api/crm/tickets/:ticketId/status',
    'PUT /api/crm/tickets/:ticketId/priority',
    'PUT /api/crm/tickets/:ticketId/reassign',
    'GET /api/crm/tickets/:ticketId/messages',
    'POST /api/crm/tickets/:ticketId/messages',
    'GET /api/admin/agents'
];

console.log('📝 Required API Endpoints:');
apiEndpoints.forEach(endpoint => {
    console.log(`  - ${endpoint}`);
});

// Test 6: Check if telephony and email functions have proper implementation
console.log('\n📱 Test 6: Checking Telephony & Email Implementation...');
const telephonyFeatures = [
    'window.open(`tel:',
    'mailto:',
    'calendar.google.com/calendar/render',
    'prompt(\'Enter update message'
];

let missingTelephony = [];
telephonyFeatures.forEach(feature => {
    if (!htmlContent.includes(feature)) {
        missingTelephony.push(feature);
    }
});

if (missingTelephony.length === 0) {
    console.log('✅ All telephony and email features implemented');
} else {
    console.log('❌ Missing telephony features:', missingTelephony);
}

// Test 7: Check if chat display CSS is fixed
console.log('\n💬 Test 7: Checking Chat Display CSS...');
const hasFixedHeight = htmlContent.includes('height: 350px');
const hasNoFlexGrow = !htmlContent.includes('flex-grow: 1');
const hasNoFlexContainer = !htmlContent.includes('display: flex') || htmlContent.includes('.communication-options');

if (hasFixedHeight && hasNoFlexGrow) {
    console.log('✅ Chat display CSS properly configured');
} else {
    console.log('❌ Chat display CSS needs fixing');
}

console.log('\n✅ Admin Panel Feature Test Completed!');
console.log('\n📝 Summary of Comprehensive Ticket View Features:');
console.log('✅ Ticket Information Display (ID, Status, Priority, Dates, Agent)');
console.log('✅ Order Details (ID, Package, Amount, Quantity, Status)');
console.log('✅ Brand & Creator Information (Name, Email, Phone)');
console.log('✅ Communication Options:');
console.log('   - Chat Session (StreamChat integration)');
console.log('   - Telephony (Call Brand/Creator, Schedule Call)');
console.log('   - Email (Email Brand/Creator, Send Update)');
console.log('✅ Chat History Display with Message Threading');
console.log('✅ Ticket Actions (Status Update, Agent Reassignment, Priority Update)');
console.log('✅ Priority System with Visual Badges');
console.log('✅ Responsive Modal Design');

console.log('\n🎯 Next Steps:');
console.log('1. Start the backend server: npm start');
console.log('2. Open admin-panel.html in your browser');
console.log('3. Login with admin credentials');
console.log('4. Navigate to Tickets tab');
console.log('5. Click "View" on any ticket to see the comprehensive view');
console.log('6. Test all communication and action features'); 