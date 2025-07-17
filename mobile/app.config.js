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
      ],
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      minSdkVersion: 21
    },
    web: {
      favicon: "./assets/Asset37.png"
    },
    scheme: "influ-mojo",
    extra: {
      eas: {
        projectId: "8afc029b-edd3-4998-a46a-7e7f70d7aed8"
      }
    },
    plugins: [
      "expo-dev-client"
    ]
  }
}; 