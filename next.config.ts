import type { NextConfig } from "next";

// Hosts the scrapers' thumbnails come from (TikTok, Instagram/Facebook,
// YouTube). Only these go through Next's image optimizer — see
// src/components/app/remote-image.tsx, which keeps the same list.
const THUMBNAIL_HOSTS = ["tiktokcdn.com", "tiktokcdn-us.com", "tiktokv.com", "tiktokv.us", "cdninstagram.com", "fbcdn.net", "ytimg.com", "ggpht.com"];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: THUMBNAIL_HOSTS.flatMap((host) => [
      { protocol: "https" as const, hostname: host },
      { protocol: "https" as const, hostname: `**.${host}` },
    ]),
    // Scraped URLs are signed and expire within hours or days. The resized
    // copy is kept for a week so thumbnails outlive their source link.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    formats: ["image/webp"],
  },
  // These bundle their platform ffmpeg/ffprobe binary via a dynamic
  // require() that Next.js's bundler can't statically resolve — excluding
  // them lets Node's own require() load them normally at runtime.
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "@ffprobe-installer/ffprobe", "@sparticuz/chromium", "puppeteer-core"],
  // @sparticuz/chromium's headless Chromium binary lives in bin/ as a set of
  // brotli-compressed files that are never require()'d directly, so Vercel's
  // file tracer doesn't discover them on its own and the deployed function
  // ends up missing the binary entirely. Force-including them here is the
  // fix documented at https://github.com/Sparticuz/chromium#bundler-configuration.
  outputFileTracingIncludes: {
    "/api/signal/report-pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  // puppeteer-core ships both its compiled lib/*.js (what actually runs)
  // and its original src/*.ts plus *.d.ts type declarations — Node never
  // requires either of those at runtime, so excluding them trims dead
  // weight from every deployed function that carries this package.
  outputFileTracingExcludes: {
    "/api/signal/report-pdf": ["./node_modules/puppeteer-core/src/**", "./node_modules/puppeteer-core/**/*.d.ts"],
  },
};

export default nextConfig;
