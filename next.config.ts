import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'oaidalleapiprodscus.blob.core.windows.net',
      'api.voidai.app',
      'replicate.delivery'
    ],
  },
};

export default nextConfig;
