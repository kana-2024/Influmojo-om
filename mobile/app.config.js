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
        projectId: "49ba98a4-78bc-4129-8235-bf893ea6f0c8"
      },
      apiBaseUrl: process.env.EXPO_PUBLIC_API_URL,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
    }
  }
}; 