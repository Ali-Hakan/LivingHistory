/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    BACKEND_IP: process.env.BACKEND_IP
  }
};

module.exports = nextConfig;
