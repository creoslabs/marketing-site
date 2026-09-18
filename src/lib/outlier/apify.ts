const APIFY_BASE = "https://api.apify.com/v2";

export function getApifyToken(overrideToken?: string | null) {
  const token = overrideToken || process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error(
      "No Apify API token available — set one on the Account tab (Testing -> API Keys) or add APIFY_API_TOKEN to .env.local."
    );
  }
  return token;
}

export type RawPost = {
  externalId: string;
  caption: string;
  url: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number | null;
  followers: number | null;
  durationSeconds: number | null;
  postedAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Apify's dataset items are untyped JSON; each puller below narrows the fields it needs.
async function runActor(actorId: string, input: object, token: string): Promise<any[]> {
  const res = await fetch(`${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Apify actor ${actorId} failed (${res.status}): ${text.slice(0, 300) || res.statusText}`);
  }
  return res.json();
}

export async function pullTikTok(handle: string, token: string, limit = 30): Promise<RawPost[]> {
  const items = await runActor(
    "clockworks~tiktok-scraper",
    {
      profiles: [handle],
      profileScrapeSections: ["videos"],
      profileSorting: "latest",
      resultsPerPage: limit,
      excludePinnedPosts: false,
    },
    token
  );

  return items
    .filter((item) => item && item.id && !item.error)
    .map((item) => ({
      externalId: String(item.id),
      caption: item.text ?? "",
      url: item.webVideoUrl ?? "",
      videoUrl: item.videoMeta?.downloadAddr ?? null,
      thumbnailUrl: item.videoMeta?.coverUrl ?? null,
      views: Number(item.playCount ?? 0),
      likes: Number(item.diggCount ?? 0),
      comments: Number(item.commentCount ?? 0),
      shares: Number(item.shareCount ?? 0),
      saves: item.collectCount != null ? Number(item.collectCount) : null,
      followers: item.authorMeta?.fans != null ? Number(item.authorMeta.fans) : null,
      durationSeconds: item.videoMeta?.duration != null ? Number(item.videoMeta.duration) : null,
      postedAt: item.createTimeISO ?? new Date().toISOString(),
    }));
}

// Instagram's scraper returns every post type (image, carousel, video) —
// Outlier's whole model is views-vs-median, and static images have no view
// count on the platform at all, so only video/Reels posts are ingested.
export async function pullInstagram(handle: string, token: string, limit = 30): Promise<RawPost[]> {
  const items = await runActor(
    "apify~instagram-scraper",
    {
      directUrls: [`https://www.instagram.com/${handle}/`],
      resultsType: "posts",
      resultsLimit: limit,
    },
    token
  );

  return items
    .filter((item) => item && item.id && (item.videoPlayCount != null || item.videoViewCount != null))
    .map((item) => ({
      externalId: String(item.id),
      caption: item.caption ?? "",
      url: item.url ?? "",
      videoUrl: item.videoUrl ?? null,
      thumbnailUrl: item.displayUrl ?? null,
      views: Number(item.videoPlayCount ?? item.videoViewCount ?? 0),
      likes: Number(item.likesCount ?? 0),
      comments: Number(item.commentsCount ?? 0),
      shares: 0,
      saves: null,
      followers: null,
      durationSeconds: item.videoDuration != null ? Number(item.videoDuration) : null,
      postedAt: item.timestamp ?? new Date().toISOString(),
    }));
}
