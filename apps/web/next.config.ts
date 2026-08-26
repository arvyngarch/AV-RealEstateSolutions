import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@av/contracts'],
};

export default nextConfig;
