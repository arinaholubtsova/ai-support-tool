/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence Prisma edge runtime warning in route handlers
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
