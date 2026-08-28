import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
  images: { remotePatterns: [
    { protocol: "http", hostname: "localhost" },
    { protocol: "http", hostname: "127.0.0.1" },
    { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-**" },
  ] },
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
