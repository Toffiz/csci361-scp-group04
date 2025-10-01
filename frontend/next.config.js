/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/csci361-scp-group04' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/csci361-scp-group04' : '',
  trailingSlash: true,
};

module.exports = nextConfig;
