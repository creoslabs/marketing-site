"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Keep in sync with THUMBNAIL_HOSTS in next.config.ts.
const OPTIMIZABLE_HOSTS = ["tiktokcdn.com", "tiktokcdn-us.com", "tiktokv.com", "tiktokv.us", "cdninstagram.com", "fbcdn.net", "ytimg.com", "ggpht.com"];

function canOptimize(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZABLE_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

// A scraped thumbnail, resized and cached by Next's image optimizer where
// we can (much smaller than the full-size original, and it survives the
// source link expiring). If the optimizer can't serve it — host not on the
// list, over a plan's image quota, source already gone — it falls back to
// loading the original directly, and only then reports failure.
export function RemoteImage({
  src,
  className,
  sizes,
  onFailed,
}: {
  src: string;
  className?: string;
  sizes: string;
  onFailed: () => void;
}) {
  const [optimized, setOptimized] = useState(() => canOptimize(src));
  const rawRef = useRef<HTMLImageElement>(null);

  // A raw image can fail before React hydrates, in which case onError never
  // fires — check the element's own state once mounted.
  useEffect(() => {
    const img = rawRef.current;
    if (img && img.complete && img.naturalWidth === 0) onFailed();
  }, [src, optimized, onFailed]);

  if (optimized) {
    return <Image src={src} alt="" fill sizes={sizes} className={className} onError={() => setOptimized(false)} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- original scraped URL, used when the optimizer can't serve it
    <img ref={rawRef} src={src} alt="" className={className} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={onFailed} />
  );
}
