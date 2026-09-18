import sharp from "sharp";

const WIDTH = 1300;

async function crop(inputPath, height) {
  return sharp(inputPath).extract({ left: 0, top: 0, width: WIDTH, height }).toBuffer();
}

async function stack(pieces, outputPath) {
  const buffers = await Promise.all(pieces.map((p) => crop(p.path, p.height)));
  const totalHeight = pieces.reduce((sum, p) => sum + p.height, 0);
  let y = 0;
  const composites = buffers.map((buf, i) => {
    const entry = { input: buf, left: 0, top: y };
    y += pieces[i].height;
    return entry;
  });
  await sharp({ create: { width: WIDTH, height: totalHeight, channels: 3, background: "#0b0b0d" } })
    .composite(composites)
    .png()
    .toFile(outputPath);
  console.log("wrote", outputPath, WIDTH, "x", totalHeight);

  let offset = 0;
  for (const p of pieces) {
    console.log(`  ${p.path}: zoomOffsetY=${offset}, zoomHeight=${p.height}`);
    offset += p.height;
  }
}

await stack(
  [
    { path: "/tmp/shots/outlier-1-creator-dark.png", height: 910 },
    { path: "/tmp/shots/outlier-2-feed-dark.png", height: 580 },
    { path: "/tmp/shots/outlier-3-video-dark.png", height: 1000 },
  ],
  "public/screenshots/outlier-filmstrip.png"
);

await stack(
  [
    { path: "/tmp/shots/signal-1-report-dark.png", height: 1100 },
    { path: "/tmp/shots/signal-2-benchmarks-dark.png", height: 470 },
    { path: "/tmp/shots/signal-3-library-dark.png", height: 700 },
  ],
  "public/screenshots/signal-filmstrip.png"
);
