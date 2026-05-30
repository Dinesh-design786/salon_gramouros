/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // Speeds up presentation compilation
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig
