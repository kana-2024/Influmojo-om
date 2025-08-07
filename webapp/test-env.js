// Test script to verify environment variables
require("dotenv").config();

console.log("🔍 Testing Environment Variables...");
console.log("");

// Check Google Client ID
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
if (googleClientId) {
  console.log("✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID:", googleClientId);
} else {
  console.log("❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID: Not found");
}

// Check API URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  console.log("✅ NEXT_PUBLIC_API_URL:", apiUrl);
} else {
  console.log("❌ NEXT_PUBLIC_API_URL: Not found");
}

console.log("");
console.log("📝 Environment Variables Summary:");
console.log("- Google Client ID configured:", !!googleClientId);
console.log("- API URL configured:", !!apiUrl);

if (googleClientId && apiUrl) {
  console.log("🎉 All required environment variables are configured!");
} else {
  console.log("⚠️  Some environment variables are missing.");
  console.log(
    "   Please check your .env file and restart the development server."
  );
}
