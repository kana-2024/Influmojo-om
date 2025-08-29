// Test script to verify Google OAuth configuration
const path = require('path');
require("dotenv").config({ path: path.resolve(process.cwd(), '.env.local') });

console.log("🔍 Testing Google OAuth Configuration...");
console.log("");

// Check environment variables
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

console.log("📋 Environment Variables:");
console.log("- NEXT_PUBLIC_GOOGLE_CLIENT_ID:", googleClientId || "❌ Not found");
console.log("- NEXT_PUBLIC_API_URL:", apiUrl || "❌ Not found");
console.log("");

if (!googleClientId) {
  console.log("❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing!");
  console.log("Please add it to your .env.local file:");
  console.log("NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here");
  console.log("");
  process.exit(1);
}

if (!apiUrl) {
  console.log("❌ NEXT_PUBLIC_API_URL is missing!");
  console.log("Please add it to your .env.local file:");
  console.log("NEXT_PUBLIC_API_URL=http://localhost:3002");
  console.log("");
  process.exit(1);
}

console.log("✅ Environment variables are configured correctly!");
console.log("");

// Check Google Client ID format
if (googleClientId.includes('.apps.googleusercontent.com')) {
  console.log("✅ Google Client ID format is correct");
} else {
  console.log("❌ Google Client ID format appears incorrect");
  console.log("Expected format: xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com");
  console.log("");
}

console.log("");
console.log("🔧 Next Steps:");
console.log("1. Make sure your development server is running on http://localhost:3000");
console.log("2. Verify that http://localhost:3000 is added to authorized origins in Google Cloud Console");
console.log("3. Restart your development server after making changes");
console.log("4. Check the browser console for any Google OAuth errors");
console.log("");
console.log("🌐 Google Cloud Console Setup:");
console.log("- Go to: https://console.cloud.google.com/");
console.log("- Navigate to: APIs & Services > Credentials");
console.log("- Find your OAuth 2.0 client ID:", googleClientId);
console.log("- Add these to Authorized JavaScript origins:");
console.log("  • http://localhost:3000");
console.log("  • http://localhost:3001");
console.log("  • http://localhost:3002");
console.log("");
console.log("🎯 Test the Google Sign-in button in your web app");
console.log("If you still get origin errors, wait a few minutes for Google's changes to take effect.");
