import { revalidateTag } from "next/cache";

// Outlier's list data is cached per user for a short time (see live-data.ts).
// Anything that changes it — a pull, a favourite, a new creator — calls this
// so the very next page load shows the change instead of waiting for the
// cache to expire.
export const outlierTag = (userId: string) => `outlier:${userId}`;

export function revalidateOutlier(userId: string) {
  try {
    revalidateTag(outlierTag(userId), { expire: 0 });
  } catch {
    // Outside a request/route context there's nothing to invalidate; the
    // short TTL covers it.
  }
}
