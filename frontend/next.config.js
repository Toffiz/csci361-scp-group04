/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/csci361-scp-group04' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/csci361-scp-group04' : '',
  trailingSlash: true,
};

module.exports = withNextIntl(nextConfig);
