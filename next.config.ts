import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These bundle their platform ffmpeg/ffprobe binary via a dynamic
  // require() that Next.js's bundler can't statically resolve — excluding
  // them lets Node's own require() load them normally at runtime.
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "@ffprobe-installer/ffprobe", "@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
