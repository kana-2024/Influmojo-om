import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { ZohoSalesIQ } from 'react-native-zohosalesiq-mobilisten';

const ZohoDebugTest: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const testZohoInitialization = async () => {
    try {
      addDebugInfo('🔧 Starting Zoho SalesIQ initialization test...');
      
      // Check if ZohoSalesIQ is available
      if (!ZohoSalesIQ) {
        addDebugInfo('❌ ZohoSalesIQ module is not available');
        return;
      }
      
      addDebugInfo('✅ ZohoSalesIQ module is available');
      
      // Log all available methods
      const methods = Object.keys(ZohoSalesIQ);
      addDebugInfo(`📋 Available methods: ${methods.join(', ')}`);
      
      // Test specific methods
      const testMethods = [
        'init',
        'setVisitorInfo',
        'setCustomAction',
        'showChat',
        'setLauncherVisibility',
        'registerVisitor'
      ];
      
      for (const method of testMethods) {
        const isAvailable = typeof ZohoSalesIQ[method] === 'function';
        addDebugInfo(`${isAvailable ? '✅' : '❌'} ${method}: ${isAvailable ? 'Available' : 'Not available'}`);
      }
      
      // Try to initialize with test keys
      if (typeof ZohoSalesIQ.init === 'function') {
        addDebugInfo('🔑 Attempting to initialize with test keys...');
        
        // Use test keys (these should be replaced with actual keys)
        ZohoSalesIQ.init('test_app_key', 'test_access_key');
        addDebugInfo('✅ Init method called successfully');
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test setVisitorInfo
        if (typeof ZohoSalesIQ.setVisitorInfo === 'function') {
          addDebugInfo('👤 Testing setVisitorInfo...');
          ZohoSalesIQ.setVisitorInfo({
            name: 'Test User',
            email: 'test+debug@influmojo.app',
            phone: '+1234567890',
            addInfo: 'debug_test'
          });
          addDebugInfo('✅ setVisitorInfo called successfully');
        }
        
        // Test setCustomAction
        if (typeof ZohoSalesIQ.setCustomAction === 'function') {
          addDebugInfo('🎯 Testing setCustomAction...');
          ZohoSalesIQ.setCustomAction('debug_test_action');
          addDebugInfo('✅ setCustomAction called successfully');
        }
        
        setIsInitialized(true);
        addDebugInfo('🎉 Zoho SalesIQ test completed successfully!');
      } else {
        addDebugInfo('❌ ZohoSalesIQ.init is not available');
      }
      
    } catch (error) {
      addDebugInfo(`❌ Error during test: ${error.message}`);
      console.error('Zoho debug test error:', error);
    }
  };

  const testShowChat = () => {
    try {
      if (typeof ZohoSalesIQ.showChat === 'function') {
        addDebugInfo('💬 Testing showChat...');
        ZohoSalesIQ.showChat();
        addDebugInfo('✅ showChat called successfully');
      } else {
        addDebugInfo('❌ ZohoSalesIQ.showChat is not available');
      }
    } catch (error) {
      addDebugInfo(`❌ Error showing chat: ${error.message}`);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
    setIsInitialized(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zoho SalesIQ Debug Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testZohoInitialization}>
          <Text style={styles.buttonText}>Test Zoho Initialization</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.showChatButton, !isInitialized && styles.disabledButton]} 
          onPress={testShowChat}
          disabled={!isInitialized}
        >
          <Text style={styles.buttonText}>Test Show Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearDebugInfo}>
          <Text style={styles.buttonText}>Clear Debug Info</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Information:</Text>
        {debugInfo.map((info, index) => (
          <Text key={index} style={styles.debugText}>
            {info}
          </Text>
        ))}
        {debugInfo.length === 0 && (
          <Text style={styles.noDebugText}>No debug information yet. Run the test to see results.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#20536d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  showChatButton: {
    backgroundColor: '#28a745',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    marginBottom: 5,
    color: '#666',
    fontFamily: 'monospace',
  },
  noDebugText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ZohoDebugTest; 