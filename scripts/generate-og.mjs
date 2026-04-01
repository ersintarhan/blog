import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import fg from "fast-glob";
import sharp from "sharp";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "src/content/blog");
const OUTPUT_DIR = path.join(ROOT, "public/og");

function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function wrapText(text, maxChars = 30, maxLines = 3) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }

  if (current && lines.length < maxLines) lines.push(current);

  const remaining = words.slice(lines.join(" ").split(/\s+/).filter(Boolean).length);
  if (remaining.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.]+$/, "")}…`;
  }

  return lines.slice(0, maxLines);
}

function createSvg({ title, description = "", tags = [] }) {
  const titleLines = wrapText(title, 32, 3);
  const subtitle = String(description).slice(0, 110);
  const tagText = Array.isArray(tags) && tags.length ? `#${tags.slice(0, 4).join("  #")}` : "software engineering  •  ai  •  devops";

  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#020617"/>
      <stop offset="1" stop-color="#0B1120"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#60A5FA"/>
      <stop offset="1" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="70" r="220" fill="#0ea5e922"/>
  <circle cx="1060" cy="540" r="180" fill="#3b82f622"/>

  <rect x="64" y="54" rx="14" width="290" height="44" fill="#0f172a" stroke="#1e293b"/>
  <text x="84" y="82" fill="#93c5fd" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700">blog.sentirum.ai</text>

  <text x="84" y="180" fill="white" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800">${escapeHtml(titleLines[0] || "Untitled")}</text>
  <text x="84" y="258" fill="white" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800">${escapeHtml(titleLines[1] || "")}</text>
  <text x="84" y="336" fill="white" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800">${escapeHtml(titleLines[2] || "")}</text>

  <text x="84" y="420" fill="#94a3b8" font-family="Inter, Arial, sans-serif" font-size="31">${escapeHtml(subtitle)}</text>

  <rect x="84" y="470" width="720" height="2" fill="#1e293b"/>
  <rect x="84" y="470" width="480" height="2" fill="url(#accent)"/>

  <text x="84" y="534" fill="#7dd3fc" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="600">${escapeHtml(tagText)}</text>
</svg>
`.trim();
}

async function writePng(svg, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, quality: 92 })
    .toFile(outputPath);
}

async function main() {
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const files = await fg("**/*.{md,mdx}", { cwd: CONTENT_DIR, absolute: true });

  // Site-level default image
  await writePng(
    createSvg({
      title: "Engineering, AI, DevOps",
      description: "Research notes, benchmarks, and real-world experiments.",
      tags: ["sentirum", "engineering", "benchmarks"],
    }),
    path.join(OUTPUT_DIR, "site.png")
  );

  for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    const { data } = matter(raw);

    const rel = path.relative(CONTENT_DIR, file).replace(/\\/g, "/");
    const slug = rel.replace(/\.(md|mdx)$/i, "");

    const title = data.title || slug;
    const description = data.description || "";
    const tags = Array.isArray(data.tags) ? data.tags : [];

    const svg = createSvg({ title, description, tags });
    await writePng(svg, path.join(OUTPUT_DIR, `${slug}.png`));
  }

  // eslint-disable-next-line no-console
  console.log(`[og] Generated ${files.length + 1} image(s) in public/og`);
}

main().catch((err) => {
  console.error("[og] Failed to generate images:", err);
  process.exit(1);
});
