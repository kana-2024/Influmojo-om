export default {
  expo: {
    name: "Influ Mojo",
    slug: "influmojo-mobile",
    version: "1.0.0",
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
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.influmojo.mobile",
      buildNumber: "1"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/Asset37.png",
        backgroundColor: "#FC5213"
      },
      package: "com.influmojo.mobile",
      versionCode: 1,
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
        projectId: "18ad0b63-061b-4159-ac61-9eedeada6db4"
      },
      apiBaseUrl: process.env.EXPO_PUBLIC_API_URL,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
    }
  }
}; 