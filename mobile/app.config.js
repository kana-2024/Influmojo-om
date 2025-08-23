import 'dotenv/config';

// Load environment variables from the mobile directory
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.mobile') });

export default {
  expo: {
    name: process.env.MOBILE_APP_NAME || "Influ Mojo",
    slug: "influmojo-mobile",
    version: process.env.MOBILE_APP_VERSION || "1.0.0",
    orientation: "portrait",
    icon: "./assets/Asset37.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/Asset37.png",
      resizeMode: "contain",
      backgroundColor: "#FC5213"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    fonts: [
      {
        asset: "./assets/fonts/Poppins-Regular.ttf",
        family: "Poppins-Regular"
      },
      {
        asset: "./assets/fonts/Poppins-Medium.ttf",
        family: "Poppins-Medium"
      },
      {
        asset: "./assets/fonts/Poppins-SemiBold.ttf",
        family: "Poppins-SemiBold"
      },
      {
        asset: "./assets/fonts/Poppins-Bold.ttf",
        family: "Poppins-Bold"
      },
      {
        asset: "./assets/fonts/Alice-Italic.ttf",
        family: "Alice-Italic"
      }
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.MOBILE_BUNDLE_ID || "com.influmojo.mobile",
      buildNumber: process.env.MOBILE_BUILD_NUMBER || "1"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/Asset37.png",
        backgroundColor: "#FC5213"
      },
      package: process.env.MOBILE_BUNDLE_ID || "com.influmojo.mobile",
      versionCode: parseInt(process.env.MOBILE_BUILD_NUMBER) || 1,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    web: {
      favicon: "./assets/Asset37.png"
    },
    scheme: "influ-mojo",
    plugins: [
      "./plugins/withGoogleSignIn.js"
    ],
    extra: {
      eas: {
        projectId: "67d33b3a-4f6c-4440-be38-ab9129e33700"
      },
      apiBaseUrl: process.env.EXPO_PUBLIC_API_URL,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      googleClientIdAndroid: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
      googleClientIdIos: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
      streamChatApiKey: process.env.EXPO_PUBLIC_STREAMCHAT_API_KEY
    }
  }
}; 