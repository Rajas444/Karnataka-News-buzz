
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
      config.resolve.alias['@/services/news'] = false;
    }
    return config;
  },
  watcherOptions: {
    // Ignore watching the AI directory to prevent dev server loops.
    ignored: ['**/src/ai/**'],
  }
};

export default nextConfig;
