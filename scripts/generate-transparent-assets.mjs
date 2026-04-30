import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const inputDir = path.join(process.cwd(), "public/yorimichi-square-assets");
const outputDir = path.join(process.cwd(), "public/yorimichi-transparent-assets");
const manifestPath = path.join(inputDir, "manifest.json");
const outputManifestPath = path.join(outputDir, "manifest.json");

function colorDistance(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function average(samples) {
  const total = samples.reduce(
    (acc, sample) => {
      acc[0] += sample[0];
      acc[1] += sample[1];
      acc[2] += sample[2];
      return acc;
    },
    [0, 0, 0]
  );
  return total.map((value) => Math.round(value / samples.length));
}

function getPixel(data, width, x, y) {
  const index = (y * width + x) * 4;
  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function setAlpha(data, width, x, y, alpha) {
  const index = (y * width + x) * 4;
  data[index + 3] = alpha;
}

function shouldRemove(pixel, background) {
  if (pixel[3] === 0) return false;
  const brightness = (pixel[0] + pixel[1] + pixel[2]) / 3;
  const distance = colorDistance(pixel, background);
  return distance < 44 || (distance < 64 && brightness > 232);
}

function floodRemoveBackground(data, width, height) {
  const cornerSampleSize = 24;
  const samples = [];

  for (let y = 0; y < cornerSampleSize; y += 1) {
    for (let x = 0; x < cornerSampleSize; x += 1) {
      samples.push(getPixel(data, width, x, y));
      samples.push(getPixel(data, width, width - 1 - x, y));
      samples.push(getPixel(data, width, x, height - 1 - y));
      samples.push(getPixel(data, width, width - 1 - x, height - 1 - y));
    }
  }

  const background = average(samples);
  const visited = new Uint8Array(width * height);
  const queue = [];

  function push(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    queue.push([x, y]);
  }

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const [x, y] = queue.shift();
    const pixel = getPixel(data, width, x, y);
    if (!shouldRemove(pixel, background)) continue;

    setAlpha(data, width, x, y, 0);
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  return background;
}

await fs.promises.mkdir(outputDir, { recursive: true });
const manifest = JSON.parse(await fs.promises.readFile(manifestPath, "utf8"));
const outputManifest = [];

for (const entry of manifest) {
  const inputPath = path.join(process.cwd(), entry.output);
  const outputPath = path.join(outputDir, path.basename(entry.output));

  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const mutable = Buffer.from(data);
  floodRemoveBackground(mutable, info.width, info.height);

  await sharp(mutable, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .toFile(outputPath);

  outputManifest.push({
    ...entry,
    output: `public/yorimichi-transparent-assets/${path.basename(entry.output)}`
  });
}

await fs.promises.writeFile(outputManifestPath, JSON.stringify(outputManifest, null, 2), "utf8");
console.log(`Generated ${outputManifest.length} transparent assets in ${outputDir}`);
