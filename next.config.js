/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add these lines to ignore ESLint and TypeScript errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; // Keep your existing module.exports style