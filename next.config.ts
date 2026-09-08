import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // CMS uploads (brand logos, card backgrounds, posters, video thumbnails).
      // Scoped to the public Storage path so the optimizer can never be pointed
      // at an arbitrary URL on the project host.
      {
        protocol: "https",
        hostname: "roqzxznvjcuxctaygeom.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Auto-derived YouTube poster frames for video items.
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
