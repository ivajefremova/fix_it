import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-simple-maps'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sounaeycpausfxskctfm.supabase.co',
      },
    ],
  },
};

export default nextConfig;
