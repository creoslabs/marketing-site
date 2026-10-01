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
  // puppeteer-core ships both its compiled lib/*.js (what actually runs)
  // and its original src/*.ts plus *.d.ts type declarations — Node never
  // requires either of those at runtime, so excluding them trims dead
  // weight from every deployed function that carries this package.
  outputFileTracingExcludes: {
    "/api/signal/report-pdf": ["./node_modules/puppeteer-core/src/**", "./node_modules/puppeteer-core/**/*.d.ts"],
  },
};

export default nextConfig;
