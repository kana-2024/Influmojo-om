// Test script to verify Google OAuth configuration
require("dotenv").config();

console.log("🔍 Testing Google OAuth Configuration...");
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

// Check if Google Client ID is valid format
if (googleClientId) {
  const isValidFormat = googleClientId.includes(".apps.googleusercontent.com");
  console.log(
    "✅ Google Client ID format:",
    isValidFormat ? "Valid" : "Invalid"
  );

  if (!isValidFormat) {
    console.log(
      "⚠️  Google Client ID should end with .apps.googleusercontent.com"
    );
  }
}

console.log("");
console.log("📝 Troubleshooting Steps:");
console.log("1. Make sure the development server is running: npm run dev");
console.log("2. Check browser console for JavaScript errors");
console.log("3. Verify Google Cloud Console configuration:");
console.log("   - OAuth 2.0 Client ID is configured for Web application");
console.log(
  "   - Authorized JavaScript origins include: http://localhost:3000"
);
console.log("   - Authorized redirect URIs include: http://localhost:3000");
console.log("4. Check if the Google Identity Services script loads in browser");
console.log("5. Verify the backend API is accessible at:", apiUrl);

console.log("");
console.log("🔧 Common Issues:");
console.log("- Google Client ID not configured in .env file");
console.log("- Wrong Google Client ID (should be Web application type)");
console.log("- Missing authorized origins in Google Cloud Console");
console.log("- Backend API not accessible");
console.log("- CORS issues between frontend and backend");
console.log("- Google Identity Services script failing to load");

if (googleClientId && apiUrl) {
  console.log("🎉 Environment variables are configured!");
  console.log("   Check browser console for specific error messages.");
} else {
  console.log("⚠️  Some environment variables are missing.");
  console.log(
    "   Please check your .env file and restart the development server."
  );
}
