// Daily pull job: xmplaylist -> genre lookup -> Postgres
//
// Run manually with:   node daily-pull.js
// Dry run (no writes): node daily-pull.js --dry-run
//
// Requires env vars (see .env.example):
//   DATABASE_URL   - Postgres connection string (Supabase/Neon)
//
// IMPORTANT: I could not test this against the live xmplaylist API from this
// environment (no network access here), so the field-mapping in
// normalizeFeedItem() is my best guess based on their public docs. The first
// time you run this for real, add a `console.log(JSON.stringify(raw, null, 2))`
// right after the fetch (see the commented line below) to confirm the actual
// field names, then adjust normalizeFeedItem() to match.

import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");

// -----------------------------------------------------------------------
// 1. Config: which xmplaylist station slugs you're tracking.
//    These IDs must match the `id` column you inserted in schema.sql.
//    Find slugs by browsing https://xmplaylist.com and checking each
//    station page's URL, e.g. xmplaylist.com/station/diplosrevolution
// -----------------------------------------------------------------------
const TRACKED_STATIONS = ["diplosrevolution", "bpm", "expertsonlyradio"];

const XMPLAYLIST_FEED_URL = "https://xmplaylist.com/api/feed";
const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

// -----------------------------------------------------------------------
// 2. Fetch the feed
// -----------------------------------------------------------------------
async function fetchFeed() {
  const res = await fetch(XMPLAYLIST_FEED_URL, {
    headers: {
      // xmplaylist's docs require a user agent on requests
      "User-Agent": "setlisted-app/1.0 (personal project; contact: you@example.com)",
    },
  });
  if (!res.ok) {
    throw new Error(`xmplaylist feed request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  // Uncomment this once, run for real, and check the shape in your terminal:
   // console.log(JSON.stringify(data, null, 2));
  return data;
}

// -----------------------------------------------------------------------
// 3. Normalize one feed item into our track shape.
//    Adjust the field names on the right if the real response differs.
// -----------------------------------------------------------------------
function normalizeFeedItem(raw) {
  const stationId = raw.channelId;
  const title = raw.track?.title;
  const artist = raw.track?.artists?.join(", ");
  const playedAtRaw = raw.timestamp;

  if (!stationId || !title || !artist || !playedAtRaw) return null;

  return {
    stationId: String(stationId),
    title: String(title).trim(),
    artist: String(artist).trim(),
    playedAt: new Date(playedAtRaw),
  };
}

// -----------------------------------------------------------------------
// 4. Genre lookup via the free iTunes Search API (no key required)
// -----------------------------------------------------------------------
const genreCache = new Map();

async function lookupGenre(title, artist) {
  const cacheKey = `${title}::${artist}`.toLowerCase();
  if (genreCache.has(cacheKey)) return genreCache.get(cacheKey);

  const term = encodeURIComponent(`${artist} ${title}`);
  const url = `${ITUNES_SEARCH_URL}?term=${term}&entity=song&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`iTunes lookup failed: ${res.status}`);
    const data = await res.json();
    const genre = data.results?.[0]?.primaryGenreName ?? null;
    genreCache.set(cacheKey, genre);
    return genre;
  } catch (err) {
    console.warn(`Genre lookup failed for "${title}" by ${artist}:`, err.message);
    genreCache.set(cacheKey, null);
    return null;
  } finally {
    // Be polite to the free API - small delay between calls
    await new Promise((r) => setTimeout(r, 150));
  }
}

// -----------------------------------------------------------------------
// 5. Main
// -----------------------------------------------------------------------
async function main() {
  console.log(`[${new Date().toISOString()}] Starting daily pull${DRY_RUN ? " (dry run)" : ""}`);

  const feed = await fetchFeed();
const rawItems = feed.results ?? [];
  console.log(`Fetched ${rawItems.length} raw feed items`);

  const normalized = rawItems
    .map(normalizeFeedItem)
    .filter((item) => item && TRACKED_STATIONS.includes(item.stationId));

  console.log(`${normalized.length} items match your tracked stations`);

  if (normalized.length === 0) {
    console.log("Nothing new to process. Done.");
    return;
  }

  const client = DRY_RUN ? null : new Client({ connectionString: process.env.DATABASE_URL });
  if (client) await client.connect();

  let inserted = 0;
  let skipped = 0;

  for (const item of normalized) {
    const genre = await lookupGenre(item.title, item.artist);
    const dedupeKey = `${item.stationId}::${item.title}::${item.artist}::${item.playedAt.toISOString()}`
      .toLowerCase();

    if (DRY_RUN) {
      console.log(`[dry-run] would insert: ${item.stationId} | ${item.title} — ${item.artist} | ${genre ?? "unknown genre"}`);
      inserted++;
      continue;
    }

    const result = await client.query(
      `insert into tracks (station_id, title, artist, genre, played_at, dedupe_key)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (dedupe_key) do nothing
       returning id`,
      [item.stationId, item.title, item.artist, genre, item.playedAt, dedupeKey]
    );

    if (result.rowCount > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  if (client) await client.end();

  console.log(`Done. Inserted ${inserted} new tracks, skipped ${skipped} duplicates.`);
}

main().catch((err) => {
  console.error("Daily pull failed:", err);
  process.exit(1);
});
