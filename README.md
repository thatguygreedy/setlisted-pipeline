# Setlisted daily pull pipeline

Pulls SiriusXM DJ show plays from xmplaylist, tags each track with a genre via
the iTunes Search API, and stores everything in Postgres.

## Setup

1. **Create a free Postgres database** at [supabase.com](https://supabase.com)
   or [neon.tech](https://neon.tech). Grab the connection string.

2. **Run the schema**: paste the contents of `schema.sql` into Supabase's SQL
   Editor (or `psql "$DATABASE_URL" -f schema.sql` for Neon).

3. **Push this folder to a new GitHub repo.**

4. **Add your database URL as a GitHub secret:**
   Repo -> Settings -> Secrets and variables -> Actions -> New repository secret
   Name: `DATABASE_URL`, value: your connection string.

5. **Test it manually first** before trusting the schedule:
   Repo -> Actions tab -> "Daily DJ track pull" -> Run workflow.
   Check the logs, then check your database to confirm rows landed in `tracks`.

6. From then on it runs automatically every day at 09:00 UTC. Edit the cron
   line in `.github/workflows/daily-pull.yml` to change the time.

## Local testing

```bash
npm install
cp .env.example .env   # fill in your real DATABASE_URL
npm run pull:dry       # logs what it would insert, writes nothing
npm run pull           # actually writes to the database
```

## Before your first real run

I wrote `normalizeFeedItem()` in `daily-pull.js` based on xmplaylist's public
docs, but I couldn't verify the exact JSON field names against a live call
from this environment. The first time you run this for real:

1. Uncomment the `console.log(JSON.stringify(data, null, 2))` line in
   `fetchFeed()`.
2. Run `npm run pull:dry` and look at one raw item in your terminal.
3. Adjust the field names in `normalizeFeedItem()` if they don't match
   (e.g. if it's `raw.songTitle` instead of `raw.track`).
4. Re-comment that log line once it's working, so you're not dumping the
   whole feed to your Actions logs every day.

## Adding more stations

Add a row to the `stations` table (matching xmplaylist's station slug as the
`id`), then add that same slug to `TRACKED_STATIONS` in `daily-pull.js`.
