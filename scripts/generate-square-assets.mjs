import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const sourceDir = "/Users/kojoukyouichi/Desktop";
const outputDir = path.join(process.cwd(), "public/yorimichi-square-assets");
const manifestPath = path.join(outputDir, "manifest.json");

const files = [
  "スクリーンショット 2026-04-30 20.30.50.png",
  "スクリーンショット 2026-04-30 20.31.07.png",
  "スクリーンショット 2026-04-30 20.31.13.png",
  "スクリーンショット 2026-04-30 20.31.19.png",
  "スクリーンショット 2026-04-30 20.31.25.png",
  "スクリーンショット 2026-04-30 20.31.31.png",
  "スクリーンショット 2026-04-30 20.31.37.png",
  "スクリーンショット 2026-04-30 20.31.58.png",
  "スクリーンショット 2026-04-30 20.32.04.png",
  "スクリーンショット 2026-04-30 20.32.09.png",
  "スクリーンショット 2026-04-30 20.32.12.png",
  "スクリーンショット 2026-04-30 20.32.16.png",
  "スクリーンショット 2026-04-30 20.32.21.png",
  "スクリーンショット 2026-04-30 20.33.49.png",
  "スクリーンショット 2026-04-30 20.33.54.png",
  "スクリーンショット 2026-04-30 20.33.55.png",
  "スクリーンショット 2026-04-30 20.34.08.png",
  "スクリーンショット 2026-04-30 20.34.12.png",
  "スクリーンショット 2026-04-30 20.34.31.png",
  "スクリーンショット 2026-04-30 20.34.35.png",
  "スクリーンショット 2026-04-30 20.34.38.png",
  "スクリーンショット 2026-04-30 20.34.42.png",
  "スクリーンショット 2026-04-30 20.34.47.png",
  "スクリーンショット 2026-04-30 20.34.50.png",
  "スクリーンショット 2026-04-30 20.34.55.png",
  "スクリーンショット 2026-04-30 20.35.01.png",
  "スクリーンショット 2026-04-30 20.35.05.png",
  "スクリーンショット 2026-04-30 20.35.09.png",
  "スクリーンショット 2026-04-30 20.35.14.png",
  "スクリーンショット 2026-04-30 20.35.18.png",
  "スクリーンショット 2026-04-30 20.35.23.png",
  "スクリーンショット 2026-04-30 20.35.27.png",
  "スクリーンショット 2026-04-30 20.35.43.png",
  "スクリーンショット 2026-04-30 20.35.50.png",
  "スクリーンショット 2026-04-30 20.35.56.png",
  "スクリーンショット 2026-04-30 20.36.08.png",
  "スクリーンショット 2026-04-30 20.36.14.png",
  "スクリーンショット 2026-04-30 20.36.20.png",
  "スクリーンショット 2026-04-30 20.36.25.png",
  "スクリーンショット 2026-04-30 20.36.32.png",
  "スクリーンショット 2026-04-30 20.36.37.png",
  "スクリーンショット 2026-04-30 20.36.42.png",
  "スクリーンショット 2026-04-30 20.36.45.png",
  "スクリーンショット 2026-04-30 20.36.51.png",
  "スクリーンショット 2026-04-30 20.37.01.png",
  "スクリーンショット 2026-04-30 20.37.07.png",
  "スクリーンショット 2026-04-30 20.37.11.png",
  "スクリーンショット 2026-04-30 20.37.14.png",
  "スクリーンショット 2026-04-30 20.37.23.png",
  "スクリーンショット 2026-04-30 20.38.04.png",
  "スクリーンショット 2026-04-30 20.38.09.png",
  "スクリーンショット 2026-04-30 20.38.18.png",
  "スクリーンショット 2026-04-30 20.38.22.png",
  "スクリーンショット 2026-04-30 20.38.31.png",
  "スクリーンショット 2026-04-30 20.38.37.png",
  "スクリーンショット 2026-04-30 20.38.46.png",
  "スクリーンショット 2026-04-30 20.38.51.png",
  "スクリーンショット 2026-04-30 20.40.47.png",
  "スクリーンショット 2026-04-30 20.40.53.png",
  "スクリーンショット 2026-04-30 20.40.59.png",
  "スクリーンショット 2026-04-30 20.41.09.png",
  "スクリーンショット 2026-04-30 20.41.13.png",
  "スクリーンショット 2026-04-30 20.41.17.png",
  "スクリーンショット 2026-04-30 20.41.25.png",
  "スクリーンショット 2026-04-30 20.41.29.png",
  "スクリーンショット 2026-04-30 20.41.33.png",
  "スクリーンショット 2026-04-30 20.41.40.png",
  "スクリーンショット 2026-04-30 20.41.44.png",
  "スクリーンショット 2026-04-30 20.41.53.png",
  "スクリーンショット 2026-04-30 20.41.58.png",
  "スクリーンショット 2026-04-30 20.42.01.png",
  "スクリーンショット 2026-04-30 20.42.05.png",
  "スクリーンショット 2026-04-30 20.42.08.png"
];

await fs.promises.mkdir(outputDir, { recursive: true });

const manifest = [];

for (const [index, file] of files.entries()) {
  const inputPath = path.join(sourceDir, file);
  const outputName = `asset-${String(index + 1).padStart(3, "0")}.png`;
  const outputPath = path.join(outputDir, outputName);
  const image = sharp(inputPath).rotate();
  const meta = await image.metadata();
  const size = Math.max(meta.width || 0, meta.height || 0, 1024);

  await image
    .resize({
      width: Math.floor(size * 0.82),
      height: Math.floor(size * 0.82),
      fit: "inside",
      withoutEnlargement: false
    })
    .extend({
      top: Math.floor(size * 0.09),
      bottom: Math.ceil(size * 0.09),
      left: Math.floor(size * 0.09),
      right: Math.ceil(size * 0.09),
      background: { r: 252, g: 249, b: 243, alpha: 1 }
    })
    .resize(1024, 1024, {
      fit: "contain",
      background: { r: 252, g: 249, b: 243, alpha: 1 }
    })
    .png()
    .toFile(outputPath);

  manifest.push({
    index: index + 1,
    source: file,
    output: `public/yorimichi-square-assets/${outputName}`
  });
}

await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

console.log(`Generated ${manifest.length} square assets in ${outputDir}`);
