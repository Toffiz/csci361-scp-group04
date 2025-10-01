/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
