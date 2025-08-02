import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { ZohoSalesIQ } from 'react-native-zohosalesiq-mobilisten';
import { ENV } from '../config/env';

const ZohoInitializer: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    initializeZohoSalesIQ();
  }, [user]);

  const initializeZohoSalesIQ = async () => {
    try {
      console.log('🔧 Initializing Zoho SalesIQ Mobilisten...');
      
      // Check if ZohoSalesIQ is available
      if (!ZohoSalesIQ) {
        console.error('❌ ZohoSalesIQ module is not available');
        return;
      }

      // Check if ZohoSalesIQ.init is available
      if (typeof ZohoSalesIQ.init !== 'function') {
        console.error('❌ ZohoSalesIQ.init is not a function');
        console.log('Available ZohoSalesIQ methods:', Object.keys(ZohoSalesIQ));
        return;
      }
      
      // Get configuration from backend
      const response = await fetch(`${ENV.API_BASE_URL}/api/zoho/chat/config`);
      const configData = await response.json();
      
      if (configData.success && configData.data) {
        const config = configData.data;
        
        // Get platform-specific keys according to official documentation
        let appKey, accessKey;
        
        if (Platform.OS === 'ios') {
          appKey = config.ios.appKey;
          accessKey = config.ios.accessKey;
        } else {
          appKey = config.android.appKey;
          accessKey = config.android.accessKey;
        }

        console.log('🔑 Platform:', Platform.OS);
        console.log('🔑 App Key:', appKey ? 'Set' : 'Not set');
        console.log('🔑 Access Key:', accessKey ? 'Set' : 'Not set');

        if (appKey && accessKey) {
          // Use the simplified initialization approach
          ZohoSalesIQ.init(appKey, accessKey);
          console.log('✅ Zoho SalesIQ initialized successfully');
          
          // Wait a moment for initialization to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if initialization was successful
          if (typeof ZohoSalesIQ.setLauncherVisibility === 'function') {
            // Hide the floating launcher as per your requirements
            ZohoSalesIQ.setLauncherVisibility(false);
            console.log('✅ Zoho floating launcher hidden');
          } else {
            console.warn('⚠️ ZohoSalesIQ.setLauncherVisibility not available');
          }
          
          // Register visitor if user is available
          if (user?.email && typeof ZohoSalesIQ.registerVisitor === 'function') {
            ZohoSalesIQ.registerVisitor(user.email);
            console.log('✅ Visitor registered:', user.email);
          } else if (user?.email) {
            console.warn('⚠️ ZohoSalesIQ.registerVisitor not available');
          }
          
          console.log('✅ Zoho SalesIQ initialization completed');
        } else {
          console.error('❌ Missing Zoho SalesIQ keys for platform:', Platform.OS);
        }
      } else {
        console.error('❌ Failed to get Zoho configuration from backend');
      }
    } catch (error) {
      console.error('❌ Error initializing Zoho SalesIQ:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  };

  // This component doesn't render anything
  return null;
};

export default ZohoInitializer; 