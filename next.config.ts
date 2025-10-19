import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    allowedDevOrigins: [
      '*.google.com',
      '*.cloud.goog',
      '*.cloud.dev',
      '*.app',
      '*.web.app',
      '*.firebaseapp.com',
      '*.cloudworkstations.dev',
    ],
  },
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
};

export default nextConfig;
