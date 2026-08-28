import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: '/directory',
        destination: '/alumni',
        permanent: true,
      },
      {
        source: '/directory/:path*',
        destination: '/alumni/:path*',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
