import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // v2 IA: Team left the dock (now Fantasy), creating moved under Challenges
  redirects() {
    return [
      { source: "/team", destination: "/fantasy", permanent: false },
      { source: "/league/new", destination: "/challenges/new", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
