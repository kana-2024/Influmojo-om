/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚡ Skip lint during production builds on the server (run lint in CI instead)
  eslint: { ignoreDuringBuilds: true },

  // ⚡ Optionally skip TS errors during build on the server.
  // Keep a separate "typecheck" step in CI to enforce types.
  typescript: { ignoreBuildErrors: true },

  swcMinify: true,

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
    // API URL now uses relative paths, no need to expose via runtime config
  },
  // Server runtime config for server-side only
  serverRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
  },
  // Disable font optimization - using hosted fonts instead
  optimizeFonts: false,
};

module.exports = nextConfig;
