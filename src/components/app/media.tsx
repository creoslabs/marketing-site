"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import styles from "./app.module.css";
import { Avatar, Chip, cx } from "./ui";
import { RemoteImage } from "./remote-image";

// Fixed 9:16 (or set height) tile with platform chip top-left, optional label
// top-right, and a score badge bottom-left (accent when ≥ 2× or a winner,
// paper otherwise). On a failed image load it falls back to the neutral tile
// — never the caption text.
export function MediaTile({
  src,
  platform,
  label,
  score,
  scoreAccent,
  height,
  emoji,
  ring,
  children,
  className,
  imageSizes = "(max-width: 760px) 50vw, 300px",
}: {
  src?: string | null;
  platform?: string;
  label?: ReactNode;
  score?: string;
  scoreAccent?: boolean;
  height?: number;
  emoji?: string;
  ring?: boolean;
  children?: ReactNode;
  className?: string;
  // The rendered width, so the optimizer sends an appropriately small image.
  imageSizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  const showImage = Boolean(src) && !failed;
  const tile = (
    <div className={cx(styles.tile, className)} style={height ? { height } : { aspectRatio: "9 / 16" }}>
      {showImage ? (
        <RemoteImage src={src as string} className={styles.tileImg} sizes={imageSizes} onFailed={() => setFailed(true)} />
      ) : (
        emoji && (
          <span className={cx(styles.emo, styles.tileEmoji)} aria-hidden="true">
            {emoji}
          </span>
        )
      )}
      {platform && <span className={cx(styles.mono, styles.tileChip)}>{platform}</span>}
      {label && <span className={cx(styles.mono, styles.tileLabel)}>{label}</span>}
      {score && <span className={cx(styles.disp, styles.tileScore, scoreAccent && styles.tileScoreAccent)}>{score}</span>}
      {children}
    </div>
  );
  return ring ? <div className={styles.tileWrapRing}>{tile}</div> : tile;
}

export type PostCardProps = {
  href: string;
  tile: Omit<Parameters<typeof MediaTile>[0], "ring">;
  ring?: boolean;
  creator: { initials: string; handle: string; avatarUrl?: string | null };
  date: string;
  caption: string;
  views: string;
  engagement: string;
  hook?: string | null;
  overlay?: ReactNode;
  // Multi-select mode: the card toggles instead of navigating, and a checkbox
  // shows top-right of the tile.
  selectMode?: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

// Tile, then creator avatar + handle + date, caption clamped to 2 lines,
// then view, engagement and hook-style chips.
export function PostCard({ href, tile, ring, creator, date, caption, views, engagement, hook, overlay, selectMode, selected, onToggle }: PostCardProps) {
  return (
    <div className={styles.post}>
      <Link
        href={href}
        className={styles.post}
        style={{ color: "inherit" }}
        onClick={(e) => {
          if (selectMode) {
            e.preventDefault();
            onToggle?.();
          }
        }}
      >
        <MediaTile {...tile} label={selectMode ? undefined : tile.label} ring={ring || selected}>
          {selectMode && (
            <span className={cx(styles.tileCheck, selected && styles.tileCheckOn)} aria-hidden="true">
              {selected ? "✓" : ""}
            </span>
          )}
        </MediaTile>
        <div className={styles.postMeta}>
          <Avatar initials={creator.initials} src={creator.avatarUrl} size={24} />
          <span className={styles.postHandle}>{creator.handle}</span>
          <span className={styles.postDate}>{date}</span>
        </div>
        <span className={styles.postCaption}>{caption}</span>
        <div className={styles.postChips}>
          <Chip variant="soft">👁 {views}</Chip>
          <Chip variant="soft">⚡ {engagement}</Chip>
          {hook && <Chip variant="soft">{hook}</Chip>}
        </div>
      </Link>
      {overlay}
    </div>
  );
}

export function PostGrid({ children, cols = 5 }: { children: ReactNode; cols?: number }) {
  return (
    <div className={styles.postGrid} style={{ "--cols": cols } as React.CSSProperties}>
      {children}
    </div>
  );
}
