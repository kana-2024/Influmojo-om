#!/bin/bash

# Download Google Fonts locally for Influmojo webapp
# This script downloads the required fonts to avoid build issues on EC2

echo "🎨 Downloading Google Fonts for Influmojo webapp..."

# Create fonts directory
mkdir -p assets/fonts

# Download Alice font
echo "📥 Downloading Alice font..."
curl -L "https://fonts.gstatic.com/s/alice/v20/OpNCnoEEmtHa6GcOrg7-hCJ1.woff2" \
  -o "assets/fonts/alice-regular.woff2" \
  --fail --silent --show-error

# Download Poppins fonts
echo "📥 Downloading Poppins fonts..."

# Regular (400)
curl -L "https://fonts.gstatic.com/s/poppins/v23/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2" \
  -o "assets/fonts/poppins-regular.woff2" \
  --fail --silent --show-error

# Medium (500)
curl -L "https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLGT9Z1JlFd2JQEl8qw.woff2" \
  -o "assets/fonts/poppins-medium.woff2" \
  --fail --silent --show-error

# SemiBold (600)
curl -L "https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLEj6Z1JlFd2JQEl8qw.woff2" \
  -o "assets/fonts/poppins-semibold.woff2" \
  --fail --silent --show-error

# Bold (700)
curl -L "https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLCz7Z1JlFd2JQEl8qw.woff2" \
  -o "assets/fonts/poppins-bold.woff2" \
  --fail --silent --show-error

# Verify downloads
echo "🔍 Verifying downloaded fonts..."
ls -la assets/fonts/

echo "✅ Font download complete!"
echo "📁 Fonts are now available in assets/fonts/"
echo "🚀 You can now build the webapp without external font dependencies"
