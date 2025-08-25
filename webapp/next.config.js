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
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NODE_ENV: process.env.NODE_ENV,
  },
  // Server configuration for EC2 deployment
  experimental: {
    serverComponentsExternalPackages: ['aws-sdk'],
  },
  // Environment variable handling
  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  serverRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
  },
};

module.exports = nextConfig;
