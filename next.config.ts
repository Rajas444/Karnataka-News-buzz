
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore AI-related files from the client-side bundle.
    if (!isServer) {
      config.resolve.alias['@/ai/'] = false;
    }
    return config;
  },
};

export default nextConfig;
