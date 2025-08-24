#!/usr/bin/env bash
set -euo pipefail

echo "🌐 Updating Nginx configuration for port 3002..."

NGINX_CONF="/etc/nginx/conf.d/api_influmojo.conf"
NGINX_BACKUP="/etc/nginx/conf.d/api_influmojo.conf.backup.$(date +%Y%m%d-%H%M%S)"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

# Backup existing configuration
if [ -f "$NGINX_CONF" ]; then
    echo "💾 Backing up existing configuration to $NGINX_BACKUP"
    cp "$NGINX_CONF" "$NGINX_BACKUP"
else
    echo "⚠️  No existing Nginx configuration found at $NGINX_CONF"
fi

# Create new Nginx configuration
echo "📝 Creating new Nginx configuration..."
cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name api.influmojo.com;
    client_max_body_size 50M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # API endpoints
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Logging
    access_log /var/log/nginx/api_influmojo_access.log;
    error_log /var/log/nginx/api_influmojo_error.log;
}
EOF

echo "✅ Nginx configuration created at $NGINX_CONF"

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    if systemctl reload nginx; then
        echo "✅ Nginx reloaded successfully"
    else
        echo "❌ Failed to reload Nginx"
        exit 1
    fi
else
    echo "❌ Nginx configuration is invalid"
    echo "🔍 Configuration errors:"
    nginx -t 2>&1 || true
    exit 1
fi

# Verify the configuration is working
echo "🔍 Verifying configuration..."
if curl -f -s "http://localhost/health" > /dev/null 2>&1; then
    echo "✅ Nginx is responding on port 80"
else
    echo "⚠️  Nginx health check failed (this might be expected if the app isn't running yet)"
fi

echo "🎉 Nginx configuration updated successfully!"
echo "🌐 API should now be accessible at: http://api.influmojo.com"
echo "🔒 Make sure your domain points to this server and SSL is configured"
