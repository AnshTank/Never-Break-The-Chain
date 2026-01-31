/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  }
}

module.exports = nextConfig