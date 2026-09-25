import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
