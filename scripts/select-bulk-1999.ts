/**
 * Select exactly 1999 new catalog stubs from bulk.json, deduped against ready + harvested.
 * Usage: npx tsx scripts/select-bulk-1999.ts
 */
import fs from "node:fs";
import { allAuthoredQuestions } from "../src/lib/content-registry";

type Entry = {
  id: string;
  track: string;
  level: string;
  canonicalTopic: string;
  title: string;
  status: string;
  tags: string[];
  sourceRefs: { site: string; url: string }[];
};

const bulk = JSON.parse(fs.readFileSync("content/catalog/bulk.json", "utf8")).entries as Entry[];

const readyKeys = new Set(allAuthoredQuestions().map((q) => `${q.track}:${q.canonicalTopic}`));

const catalogSrc = fs.readFileSync("src/content/catalog.ts", "utf8");
const harvestKeys = new Set<string>();
for (const m of catalogSrc.matchAll(
  /track:\s*"(quiz|dsa|system-design|behaviour|negotiation)"[\s\S]*?canonicalTopic:\s*"([^"]+)"/g,
)) {
  harvestKeys.add(`${m[1]}:${m[2]}`);
}

const blocked = new Set([...readyKeys, ...harvestKeys]);

const TARGET = 1999;
const perTrackTarget: Record<string, number> = {
  quiz: 700,
  dsa: 550,
  "system-design": 350,
  behaviour: 250,
  negotiation: 149,
};

const picked: Entry[] = [];
const counts: Record<string, number> = {
  quiz: 0,
  dsa: 0,
  "system-design": 0,
  behaviour: 0,
  negotiation: 0,
};
const seen = new Set<string>();

function tryPick(e: Entry) {
  const key = `${e.track}:${e.canonicalTopic}`;
  if (blocked.has(key) || seen.has(key)) return false;
  if ((counts[e.track] ?? 0) >= (perTrackTarget[e.track] ?? 0)) return false;
  seen.add(key);
  counts[e.track] = (counts[e.track] ?? 0) + 1;
  picked.push(e);
  return true;
}

for (const e of bulk) {
  if (picked.length >= TARGET) break;
  tryPick(e);
}

for (const e of bulk) {
  if (picked.length >= TARGET) break;
  const key = `${e.track}:${e.canonicalTopic}`;
  if (blocked.has(key) || seen.has(key)) continue;
  seen.add(key);
  counts[e.track] = (counts[e.track] ?? 0) + 1;
  picked.push(e);
}

picked.splice(TARGET);

fs.writeFileSync(
  "content/catalog/bulk-1999.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: picked.length,
      byTrack: counts,
      note: "Titles + source links only. Original answers authored separately.",
      entries: picked,
    },
    null,
    0,
  ),
);

console.log("picked", picked.length, counts);
