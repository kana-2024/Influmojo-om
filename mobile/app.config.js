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
      bundleIdentifier: "com.influmojo.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/Asset37.png",
        backgroundColor: "#FC5213"
      },
      package: "com.influmojo.mobile",
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    web: {
      favicon: "./assets/Asset37.png"
    },
    scheme: "influ-mojo",
    extra: {
      eas: {
        projectId: "8f28fa05-e2fd-43ad-b3f4-bdbc04c36329"
      },
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
    }
  }
}; 