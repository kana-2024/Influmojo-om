#!/usr/bin/env bash
set -euo pipefail

echo "🔗 Setting up deployment symlinks..."

DEPLOY_DIR="/home/ec2-user/deploys/influmojo-api"
CURRENT_LINK="$DEPLOY_DIR/current"
LATEST_RELEASE=$(ls -t "$DEPLOY_DIR/releases" | head -1)

if [ -z "$LATEST_RELEASE" ]; then
    echo "❌ No releases found in $DEPLOY_DIR/releases"
    exit 1
fi

echo "📁 Latest release: $LATEST_RELEASE"

# Remove existing symlink if it exists
if [ -L "$CURRENT_LINK" ]; then
    echo "🗑️  Removing existing symlink..."
    rm "$CURRENT_LINK"
fi

# Create new symlink to latest release
echo "🔗 Creating symlink: current -> $LATEST_RELEASE"
ln -sf "$DEPLOY_DIR/releases/$LATEST_RELEASE" "$CURRENT_LINK"

# Verify symlink
if [ -L "$CURRENT_LINK" ]; then
    echo "✅ Symlink created successfully: $CURRENT_LINK -> $(readlink "$CURRENT_LINK")"
else
    echo "❌ Failed to create symlink"
    exit 1
fi

echo "🎉 Deployment symlinks configured!"
