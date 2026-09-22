/**
 * Normalize harvested YAML title lists into a deduped catalog report.
 * Usage: npm run ingest
 *
 * Legal: harvest files must contain titles + URLs only — never full article bodies.
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

type HarvestItem = {
  title: string;
  track: string;
  level?: string;
  canonicalTopic?: string;
  site: string;
  url: string;
  tags?: string[];
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function main() {
  const harvestDir = path.join(process.cwd(), "scripts", "harvest");
  const outDir = path.join(process.cwd(), "content", "catalog");
  fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(harvestDir)) {
    console.error("Missing scripts/harvest — add YAML title exports first.");
    process.exit(1);
  }

  const files = fs.readdirSync(harvestDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
  const byTopic = new Map<string, HarvestItem & { sources: { site: string; url: string }[] }>();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(harvestDir, file), "utf8");
    const doc = YAML.parse(raw) as { items?: HarvestItem[] };
    for (const item of doc.items ?? []) {
      const topic = item.canonicalTopic ?? slugify(item.title);
      const key = `${item.track}:${topic}`;
      const existing = byTopic.get(key);
      if (existing) {
        existing.sources.push({ site: item.site, url: item.url });
      } else {
        byTopic.set(key, {
          ...item,
          canonicalTopic: topic,
          sources: [{ site: item.site, url: item.url }],
        });
      }
    }
  }

  const entries = [...byTopic.values()].map((item) => ({
    id: `cat-${item.canonicalTopic}`,
    track: item.track,
    level: item.level ?? "mid",
    canonicalTopic: item.canonicalTopic,
    title: item.title,
    status: "stub",
    tags: item.tags ?? [],
    sourceRefs: item.sources,
  }));

  const outPath = path.join(outDir, "generated.yaml");
  fs.writeFileSync(outPath, YAML.stringify({ generatedAt: new Date().toISOString(), entries }));
  console.log(`Wrote ${entries.length} deduped catalog entries → ${outPath}`);
}

main();
