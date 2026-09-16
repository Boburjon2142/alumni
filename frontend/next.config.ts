import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
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
        source: "/directory",
        destination: "/alumni",
        permanent: true,
      },
      {
        source: "/directory/:path*",
        destination: "/alumni/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const backendUrl = (process.env.API_URL || "http://127.0.0.1:8000").replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
    return { fallback: [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${backendUrl}/media/:path*`,
      },
    ] };
  },
};

export default nextConfig;
