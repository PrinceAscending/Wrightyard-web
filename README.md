# Wrightyard

[![CI](https://github.com/PrinceAscending/Wrightyard-web/actions/workflows/ci.yml/badge.svg)](https://github.com/PrinceAscending/Wrightyard-web/actions/workflows/ci.yml)

**Production:** https://wrightyard.vercel.app
**Bot repository:** https://github.com/PrinceAscending/Wrightyard-bot

The studio site, member gate, live yard report, and the Discord bot that keeps
the line open.

- **Website:** Next.js 16, React 19, Motion, custom letterpress CSS. Deployed to
  Vercel.
- **Bot:** a standalone discord.js 14 gateway process in
  [`Wrightyard-bot`](https://github.com/PrinceAscending/Wrightyard-bot).
  Hosted on a persistent Linux machine under systemd (Docker, Railway, Fly,
  Render, and Pterodactyl also work). Vercel functions cannot hold a 24/7
  gateway connection or rich presence. `/ask` and `/brief` use Groq when
  `GROQ_API_KEY` is set.
- **Shared state:** MongoDB Atlas. The site and bot share durable state for the
  heartbeat, job book, ticket history, and dispatch archive. An in-memory
  fallback keeps local work possible when MongoDB is unavailable, but it is not
  shared between serverless instances.
- **Auth:** Discord OAuth2 (`identify` only), signed HTTP-only session cookie.
  Owner access is by Discord user ID, not role.

## Deployment status

- **Website:** live at https://wrightyard.vercel.app. Pushes to `main` deploy
  production automatically.
- **Bot:** code complete, with auto-role, the XP ladder, AI commands, and the
  website heartbeat. Published to
  [`Wrightyard-bot`](https://github.com/PrinceAscending/Wrightyard-bot). The
  local instance is the bridge until the persistent host starts. See
  [Deploy the bot](#deploy-the-bot).
- **Discord server:** 36 text channels, 9 voice rooms, 8 categories, and a
  staff/level role hierarchy. The map and pinned-message snapshot live in
  `docs/`.
- **Shared state:** MongoDB Atlas is live and shared by both processes.
- **Follow-up:** rotate credentials that were shared outside the hosting
  dashboards. See [Security notes](#security-notes).

## What is here

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Homepage: job ticket, seal, work specimen, services, rates, brief builder, live band |
| `app/login` | Discord gate |
| `app/dashboard` | Signed-in member file, guild membership, live line, job book, ticket history, command index |
| `app/admin` | Owner's bench: presence override, maintenance, announcements, job book, ticket ledger, command sync, audit marks |
| `app/status` | Public live report: services, uptime, wave, ticket count, heartbeat sparkline |
| `app/dispatch` | Public archive of owner announcements |
| `app/api/auth/*` | OAuth login, callback, logout, session read |
| `app/api/bot/heartbeat` | Signed HMAC heartbeat receiver, override delivery, command sync flag |
| `app/api/briefs` | Public job-brief intake with validation, honeypot, and rate limits |
| `app/api/admin/*` | Owner-only presence, maintenance, announce, sync, audit, brief, and ticket APIs |
| `bot/` | Local checkout of the separate [`Wrightyard-bot`](https://github.com/PrinceAscending/Wrightyard-bot) repository: gateway, commands, auto-role, XP ladder, tickets, presence, heartbeat, Mongo ledger |
| `lib/` | Auth, guards, Discord REST, Mongo store, briefs, dispatch, tickets, status assembly, validation, formatting |
| `app/account.css` | Auth, dashboard, status, admin, loading, and responsive styles |

## Local setup

```powershell
npm install
Copy-Item .env.example .env.local
# fill in the real values
npm run dev
```

The bot is a separate repository and ships a self-contained `index.js`:

```powershell
git clone https://github.com/PrinceAscending/Wrightyard-bot.git bot
cd bot
Copy-Item .env.example .env.local
# fill in the real values
node index.js
```

For source development, use `npm install`, `npm run build`, and `npm run dev`.
Register commands from the release with `node index.js --deploy-commands`, or
from a source checkout with `npm run deploy-commands`.

Open `http://localhost:3000`.

### Required website env

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin used for OAuth redirects and metadata. Must be exact. |
| `DISCORD_CLIENT_ID` | OAuth application ID: `1566784935342252032` |
| `DISCORD_CLIENT_SECRET` | OAuth client secret |
| `DISCORD_TOKEN` | Bot token for REST calls (guild snapshot, member lookup, announcements) |
| `DISCORD_GUILD_ID` | `1566778873985892442` |
| `OWNER_ID` | `971329961313046578` — the only user allowed on `/admin` |
| `ANNOUNCEMENTS_CHANNEL_ID` | `1566786878416486500` |
| `AUTH_SECRET` | 32+ byte random secret for session signing |
| `BOT_HEARTBEAT_SECRET` | 32+ byte random secret shared with the bot |
| `MONGODB_URI` | MongoDB Atlas SRV connection string. Server-only; never commit it. |
| `MONGODB_DB` | Database name, normally `wrightyard` |
| `UPSTASH_REDIS_REST_URL` | Optional fallback only; MongoDB is primary |
| `UPSTASH_REDIS_REST_TOKEN` | Optional Upstash fallback token |

Generate secrets:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Discord OAuth setup

In the [Discord Developer Portal](https://discord.com/developers/applications)
for the WrightForge application, open **OAuth2** and add both redirect URIs:

1. `http://localhost:3000/api/auth/callback`
2. `https://wrightyard.vercel.app/api/auth/callback`

They must match exactly, including protocol and path. The login route requests
the `identify` scope only. The callback exchanges the code, reads `/users/@me`,
and signs a seven-day session.

Production redirect URIs must be HTTPS. If the Vercel project ever receives a
different domain, add that callback URI in Discord, update
`NEXT_PUBLIC_SITE_URL` to the same origin, and redeploy.

## Durable state: MongoDB Atlas

1. Create a MongoDB Atlas cluster and a database user with `readWrite` on the
   `wrightyard` database.
2. Copy the SRV connection string into `MONGODB_URI` for both the website and the
   bot. Set `MONGODB_DB=wrightyard`.
3. Add the same variables in Vercel and on the bot host. Do not put the URI in a
   `NEXT_PUBLIC_*` variable.
4. Redeploy and open `/status`. The state store row should read
   **Durable / MongoDB**.

The app creates its indexes on first use. Collections:

| Collection | Owner | Purpose |
| --- | --- | --- |
| `key_values` | Site | Heartbeat, overrides, maintenance, sync flag |
| `counters` | Site | Rate limits with TTL indexes |
| `lists` | Site | Heartbeat history and audit marks |
| `briefs` | Site | Website job briefs and owner status |
| `tickets` | Bot | Durable ticket history read by the site |
| `announcements` | Site | Public dispatch archive |

The bot writes ticket history directly to `tickets`; it never depends on the
website being up to open, claim, close, or remove a ticket. If MongoDB is
unavailable, the bot logs the failure, backs off for a minute, and keeps working
from Discord channel topics. The website uses a thirty-second in-memory fallback
for small state and reports the degraded backend on `/status`.

## Product features

- **Job briefs:** the homepage form files a brief in MongoDB, returns a
  reference, and shows it on the member's file when they are signed in.
- **Owner job book:** `/admin` filters briefs by status, exposes contact details
  only to the owner, and moves a brief through New, Reviewing, Quoted, Won, or
  Archived.
- **Ticket ledger:** the bot writes openings, claims, closures, and removals to
  MongoDB. `/admin` shows the desk history; `/dashboard` shows the member's own
  tickets.
- **Dispatch archive:** every announcement sent from `/admin` is also filed at
  `/dispatch`. The Discord post and the public archive share the same text.

## Deploy the website to Vercel

Production is a Vercel project connected to this GitHub repository:

- **Project:** `wrightyard`
- **Production branch:** `main`
- **URL:** `https://wrightyard.vercel.app`
- **Framework preset:** Next.js
- **Root directory:** repository root

Every push to `main` creates a production deployment. Pull requests create
preview deployments. Set every website environment variable above in
**Project → Settings → Environment Variables** for Production, Preview, and
Development. `NEXT_PUBLIC_SITE_URL` must be the final HTTPS origin.

Initial setup:

```powershell
npx vercel login
npx vercel link
npx vercel git connect
npx vercel --prod
```

After the first deploy:

1. Add `https://wrightyard.vercel.app/api/auth/callback` in Discord.
2. Confirm `NEXT_PUBLIC_SITE_URL=https://wrightyard.vercel.app`.
3. Redeploy if either value changed.
4. Test sign-in, `/dashboard`, `/admin`, and `/status`.

### Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request for the site:
install, typecheck, and production build. The bot has its own CI in the
[`Wrightyard-bot`](https://github.com/PrinceAscending/Wrightyard-bot) repository:
install, version check, typecheck, build, smoke test, and the standalone bundle
check.

The workflow uses placeholder environment values. Real values live only in
Vercel and the bot host.

## Deploy the bot

The bot must run on a persistent Linux host. The repository ships a
self-contained `index.js`, so the host runs one command with no install or build
step:

1. Install Node.js 22.12+ on the server.
2. Clone [`Wrightyard-bot`](https://github.com/PrinceAscending/Wrightyard-bot)
   to `/opt/wrightyard-bot`, or extract the release zip there. The root must
   contain `index.js` and `deploy/wrightyard-bot.service`.
3. Put the environment in `/etc/wrightyard-bot/wrightyard-bot.env` (mode `640`),
   including `SITE_URL=https://wrightyard.vercel.app`, the exact Vercel
   `BOT_HEARTBEAT_SECRET`, the website's `MONGODB_URI` / `MONGODB_DB=wrightyard`,
   and `GROQ_API_KEY` for `/ask` and `/brief`.
4. Install the included
   [`deploy/wrightyard-bot.service`](https://github.com/PrinceAscending/Wrightyard-bot/blob/main/deploy/wrightyard-bot.service)
   unit and run `systemctl enable --now wrightyard-bot`. Its `ExecStart` is
   `/usr/bin/node index.js`.
5. Register commands once:
   `sudo -u wrightyard env WRIGHTYARD_ENV_FILE=/etc/wrightyard-bot/wrightyard-bot.env node /opt/wrightyard-bot/index.js --deploy-commands`.
6. Check `GET /health` and the journal for `Gateway ready`,
   `Community systems ready`, and `Website heartbeat accepted`.
7. Confirm the site's `/status` page receives heartbeats and the bot's rich
   presence rotates.

The full Linux walkthrough, plus Docker, Railway, Fly.io, Render, and
Pterodactyl notes, is in the
[bot README](https://github.com/PrinceAscending/Wrightyard-bot#deployment).
`Dockerfile`, `docker-compose.yml`, `railway.json`, and `fly.toml` are included
in the bot repository.

The owner can also queue a command re-registration from `/admin` using
**Queue command sync**; the bot picks it up on its next heartbeat.

## Security notes

- Never commit `.env.local`, bot tokens, client secrets, heartbeat secrets, or
  `MONGODB_URI`. The URI contains a database password.
- Use a dedicated MongoDB user with `readWrite` on `wrightyard`, not an Atlas
  organization owner.
- Rotate the Discord bot token, OAuth client secret, and MongoDB password
  whenever a credential has been shared outside the hosting dashboards. Update
  Vercel and the bot host together after rotation.
- Owner checks are by Discord user ID (`OWNER_ID`) on every page and API call.
  Server administrator does not imply owner.
- Admin APIs require a same-origin request, an owner session, and rate limits.
- Heartbeats require an HMAC-SHA256 signature over the exact raw body.
- The site sends `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  HSTS, and a restrictive permissions policy.

## Verification

```powershell
npm run typecheck
npm run build
```

The bot's checks run in its own repository:

```powershell
cd bot
npm run typecheck
npm run check-version
npm run build
npm run smoke
npm run bundle
npm run bundle:check
```

Live checks:

- `GET /api/status` returns a coherent report.
- `POST /api/bot/heartbeat` rejects a bad signature with 401 and accepts a
  correctly signed body.
- `GET /status` renders the report and refreshes without a full reload.
- Discord sign-in returns to `/dashboard` (requires registered redirect URIs).
- `/dashboard` and `/admin` redirect to `/login` when signed out.
- `/admin` returns 404 for a signed-in non-owner.
- Owner presence and maintenance overrides are delivered on the next heartbeat.
- An announcement posts to `#announcements` through Discord REST and appears on
  `/dispatch`.
- A job brief submitted from `/#brief` returns a reference and appears in the
  owner's job book.
- A ticket opened in Discord appears in `/admin` and on the opener's
  `/dashboard` after the bot writes it to MongoDB.
- The bot's `/status`, `/stats`, `/site`, `/rank`, `/leaderboard`, `/ask`,
  `/brief`, `/help`, and ticket panel work in the guild.
- A new member receives **Crew** and the welcome card; eligible messages earn XP;
  level roles arrive at 5, 15, 30, and 50.
