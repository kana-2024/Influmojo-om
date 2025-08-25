/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/tagjs-prod.appspot.com/**",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
      },
      {
        protocol: "https",
        hostname: "influmojo.com",
      },
      {
        protocol: "https",
        hostname: "api.influmojo.com",
      },
    ],
  },
  // Environment variable handling - only allow safe public variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Server configuration for EC2 deployment
  experimental: {
    serverComponentsExternalPackages: ['aws-sdk'],
  },
  // Public runtime config for client-side access
  publicRuntimeConfig: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Server runtime config for server-side only
  serverRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
  },
  // Allow external fonts and optimize them properly
  optimizeFonts: true,
  // Add Google Fonts domains to allowed list
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;
