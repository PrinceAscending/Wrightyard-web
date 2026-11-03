# Wrightyard bot

The gateway process for the Wrightyard yard: public readings, private tickets,
owner controls, a rotating presence, and a signed heartbeat to the website.

This is a standalone Node service inside `bot/`. It has its own `package.json`
and lockfile and does not import from the website. The website remains the
source of truth for the public status page; the bot reports to it.

- **Runtime:** Node.js 22.12+ (Docker uses `node:22-alpine`)
- **Library:** `discord.js` 14.28.0
- **Language:** TypeScript, ESM (`"type": "module"`)
- **Intents:** `Guilds` only
- **State:** MongoDB ticket ledger when configured, with channel topics as the recovery source

## What it does

| Area | Behavior |
| --- | --- |
| Public commands | `/status`, `/stats`, `/site`, `/ask`, `/brief`, `/help`, `/ticket` |
| Owner commands | `/admin status`, `announce`, `presence`, `maintenance`, `sync`, `ticketpanel` |
| AI bench | `/ask` answers studio questions; `/brief` turns a rough idea into a structured project brief. Powered by Groq; disabled cleanly when `GROQ_API_KEY` is absent. |
| Tickets | Private channels, one open ticket per user, 30-second open cooldown, claim, close with confirmation, log, keep the record, staff delete with confirmation |
| Presence | Five-state rotation every 25 seconds; website override; local owner override; maintenance idle state |
| Heartbeat | Signed `POST` to `${SITE_URL}/api/bot/heartbeat` every 30 seconds |
| Health | `GET /health` and `GET /` on `PORT` (default `8080`) |
| Shutdown | Graceful `SIGINT` / `SIGTERM` with a 10-second forced-exit guard |

## Requirements

- Node.js 22.12 or newer
- A Discord application and bot token
- The bot invited to the target guild with `bot` and `applications.commands`
- The bot's role high enough to manage the ticket category and channel
  permission overwrites
- A persistent host for production. Vercel functions cannot hold a 24/7
  gateway connection or rich presence.

### Discord portal settings

Enable **only** the `Guilds` gateway intent. Leave these off:

- Message Content Intent
- Server Members Intent
- Presence Intent

The bot deliberately does not use `MessageContent`, `GuildMembers`, or
`GuildPresences`. Member counts come from `guild.memberCount`, staff roles come
from interaction member payloads, and approximate presence counts come from the
REST guild endpoint with `with_counts=true`.

### Bot permissions

Grant these guild permissions (no Administrator):

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Attach Files
- Manage Channels
- Manage Roles (needed to create and edit private channel overwrites)

`Manage Messages`, `Mention Everyone`, `Kick Members`, `Ban Members`, and
`Administrator` are not required.

The bot role should sit above the staff roles it grants access to.

### Channel setup

Set the IDs in the environment. Optional channels can be left empty, but the
corresponding feature will be disabled or fall back to a name lookup:

- Announcements channel: `ANNOUNCEMENTS_CHANNEL_ID`
- Ticket panel channel: `TICKET_PANEL_CHANNEL_ID`, or a channel named
  `#open-a-ticket`
- Ticket transcript/log channel: `TICKET_LOG_CHANNEL_ID`
- Ticket category: `TICKET_CATEGORY_ID`, or a category named `Tickets` that the
  bot will create on the first ticket

The bot needs View Channel, Send Messages, and Embed Links in the panel,
announcement, and log channels.

## Local setup

```powershell
cd bot
npm install
Copy-Item .env.example .env.local
# edit .env.local with real values
npm run build
npm run typecheck
```

The loader reads `.env.local` first, then `.env`. Values already present in the
process environment win, which is how Railway and Fly inject secrets.

Start the gateway in development:

```powershell
npm run dev
```

Compile and run the built output:

```powershell
npm run build
npm start
```

### Deploying slash commands

Commands are **not** deployed on `ready`. Register them explicitly after a
build:

```powershell
npm run build
npm run deploy-commands
```

`deploy-commands` runs `dist/deploy-commands.js`. For a quick source run without
building, use `npm run deploy-commands:source` (requires the `tsx` dev
dependency). This writes the command set to `DISCORD_GUILD_ID`. For first-time testing, point
`DISCORD_GUILD_ID` at a development guild and use a separate bot token. Do not
run a production command deployment until the command set and permissions have
been checked in a test guild.

After that, the owner can re-register commands from Discord with
`/admin sync`, or from the website's owner panel, which sets a sync flag that
the next heartbeat picks up. Automatic syncs from heartbeats are throttled to
one per 60 seconds.

## Environment

Copy `.env.example` and fill every required value. Never commit real values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DISCORD_TOKEN` | Yes | Bot token. Never log, commit, or paste it into chat. |
| `DISCORD_CLIENT_ID` | Yes | Application/client ID used by the deploy script. |
| `DISCORD_GUILD_ID` | Yes | The one guild this process serves. |
| `OWNER_ID` | Yes | Discord user ID allowed to run `/admin`. A role or guild administrator does not imply owner. |
| `SITE_URL` | Recommended | Public site origin, for example `https://wrightyard.com`. Used for links and the heartbeat. |
| `BOT_HEARTBEAT_SECRET` | Recommended | Shared HMAC secret. Must exactly match the website's value. |
| `ANNOUNCEMENTS_CHANNEL_ID` | Optional | Default target for `/admin announce`. |
| `TICKET_PANEL_CHANNEL_ID` | Optional | Where `/admin ticketpanel` posts. Falls back to `#open-a-ticket`. |
| `TICKET_LOG_CHANNEL_ID` | Optional | Closure, deletion, and failure notices. |
| `STAFF_ROLE_IDS` | Recommended | Comma-separated role IDs that can see and claim tickets. Ticket opening refuses while empty. |
| `TICKET_CATEGORY_ID` | Optional | Existing private category. When empty, the bot uses or creates `Tickets`. |
| `GROQ_API_KEY` | Optional | Enables `/ask` and `/brief`. Leave empty to run the bot without AI. |
| `GROQ_MODEL` | Optional | Groq model name. Defaults to `openai/gpt-oss-20b`. |
| `PORT` | Optional | Health-server port. Defaults to `8080`. |

`SITE_URL` and `BOT_HEARTBEAT_SECRET` must either both be real or both be
absent. The example placeholders are detected and disable the heartbeat with a
warning instead of sending invalid requests. `BOT_HEARTBEAT_SECRET` must be at
least 32 characters.

Generate a secret without sending it anywhere:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Put the same value in the bot host and in the website's environment.

## Commands

### Public

| Command | Description |
| --- | --- |
| `/status` | Maintenance state, gateway ping, uptime, member count, open tickets, commands served, site links |
| `/stats` | Members, approximate present members, channels, roles, boosts, guild age, open tickets |
| `/site` | Links to the website, dashboard, and status page |
| `/ask` | Groq-powered answer about the studio, its services, or how a job starts |
| `/brief` | Groq-powered private draft with the job, build shape, open questions, and a first move |
| `/help` | Command index; includes owner commands only for the owner |
| `/ticket` | Ephemeral ticket panel with an **Open a ticket** button |

All commands are guild-only. Cooldowns are in memory and per user per command
(2–10 seconds depending on the command).

### Owner only

`/admin` is registered with `default_member_permissions = Administrator` so it
is hidden from ordinary members. The owner check is repeated on every
subcommand; a guild administrator who is not `OWNER_ID` receives an ephemeral
"Owner only" refusal.

| Subcommand | Description |
| --- | --- |
| `/admin status` | Ephemeral process, memory, gateway, ticket, heartbeat, presence, and maintenance readings |
| `/admin announce title message [channel]` | Branded announcement; defaults to the announcements channel |
| `/admin presence text status` | Local rich-presence override (`online`, `idle`, `dnd`, `invisible`) |
| `/admin maintenance enabled` | Local maintenance toggle; closes ticket intake and sets idle presence |
| `/admin sync` | Re-register the guild command set immediately |
| `/admin ticketpanel` | Post or refresh the panel in the configured panel channel |

Presence precedence, highest first:

1. Maintenance: idle, "Down for maintenance"
2. Website heartbeat override
3. Local `/admin presence` override
4. Five-state rotation

Maintenance precedence is website override, then local toggle. A website
`maintenance: null` response clears the website override and lets the local
toggle take over again.

## Tickets

### Opening

`/admin ticketpanel` posts a persistent panel with a single **Open a ticket**
button. The button is also available ephemerally through `/ticket`.

When a member presses **Open a ticket**:

1. Maintenance and staff configuration are checked.
2. A 30-second per-user cooldown is checked.
3. The category is resolved by ID, then by the name `Tickets`, then created.
4. The in-memory ledger is checked for any open ticket by that member, including
   tickets found by scanning channel topics.
5. Creation is serialized through a queue so two clicks cannot allocate the
   same number or create two rooms.
6. A private text channel is created under the category.

Channel name:

```text
ticket-0001-username
```

Usernames are Unicode-normalized, lowercased, reduced to `a-z0-9-`, trimmed,
and capped so the full name stays within 90 characters. A user with no usable
characters becomes `guest`.

Channel topic:

```text
Wrightyard ticket #0001 · opener 123456789012345678 · open
```

A claim adds `· claimed by <id>`; closing changes the status to `closed`.

Permission overwrites:

- `@everyone`: deny View Channel
- Opener: allow View Channel, Send Messages, Read Message History, Attach Files
- Each configured staff role: same allow set
- Bot: View Channel, Send Messages, Read Message History, Attach Files, Manage
  Channels, Embed Links, Manage Messages

The intro embed records the opener, claim state, and open time, with **Claim
ticket** and **Close ticket** buttons.

### Claiming, closing, deleting

- **Claim** rechecks the staff role at click time, records the claim in the topic
  and intro embed, and announces it in the channel.
- **Close** is available to the opener or staff. It shows an ephemeral
  confirmation first. Confirming sets the topic and name to closed, removes the
  opener's Send Messages permission, updates the intro, posts a closed note with
  a delete control, and sends a log embed when `TICKET_LOG_CHANNEL_ID` is set.
- **Delete** is staff-only and requires the ticket to be closed. It shows an
  ephemeral confirmation first. Confirming writes a deletion log, removes the
  ledger entry, and deletes the channel.

All button actions repeat the owner/staff/opener checks. The handler also checks
the bot's current channel permissions before claiming, closing, or deleting and
returns a safe, specific refusal if a permission was removed at runtime.

### Ledger and restart behavior

There is no database. The ledger is a `Map` keyed by channel ID, and durable
fields live in each channel's topic. On startup the bot scans the ticket
category and rebuilds the ledger from topics and `closed-` names.

Consequences:

- A restart does not lose open/closed status, opener, claim, or number for
  channels that still exist.
- A deleted channel loses its ledger entry. Ticket numbers may be reused after
  deletion because there is no external counter.
- Exactly one gateway process should run. Two processes would keep separate
  in-memory ledgers and duplicate presence/heartbeat updates.
- The intro message update after a restart searches the most recent messages if
  the original intro ID was not recovered. Closing still works if the intro is
  not found.

## Website heartbeat

The bot sends a heartbeat every 30 seconds to:

```text
POST ${SITE_URL}/api/bot/heartbeat
```

Headers:

```text
content-type: application/json
x-wrightyard-signature: <hex HMAC-SHA256 of the exact raw JSON body>
user-agent: WrightyardBot/<version>
```

The HMAC key is `BOT_HEARTBEAT_SECRET`. The signature is lowercase hex of the
digest. The exact serialized string that is signed is the exact request body;
do not re-serialize the payload after signing.

Request body:

```json
{
  "botId": "1566784935342252032",
  "version": "1.0.0",
  "startedAt": "2026-11-02T13:00:00.000Z",
  "uptimeSeconds": 3600,
  "ping": 42,
  "guilds": 1,
  "members": 120,
  "commandsServed": 18,
  "openTickets": 2,
  "presence": "the gate",
  "maintenance": false,
  "memoryMb": 96,
  "lastCommandAt": "2026-11-02T13:42:00.000Z"
}
```

`lastCommandAt` is `null` before the first served command. `startedAt` and
`lastCommandAt` are ISO-8601 strings. The website validates this shape with its
own schema; unknown extra fields are ignored by the receiver, but the bot sends
exactly these fields.

Response body used by the bot:

```json
{
  "ok": true,
  "presence": "the gate",
  "status": "online",
  "maintenance": null,
  "syncCommands": false
}
```

Behavior:

- `presence` string: website presence override; takes precedence over the local
  override and rotation.
- `presence: null`: clear the website presence override.
- `status`: one of `online`, `idle`, `dnd`, `invisible`; `null` clears the
  website status override.
- `maintenance: true|false`: website maintenance override.
- `maintenance: null`: no website override; the local toggle is effective.
- `syncCommands: true`: re-register guild commands on this heartbeat, at most
  once per 60 seconds.

Operational details:

- Request timeout: 10 seconds via `AbortController`.
- The heartbeat never stops the bot. Network, timeout, and non-2xx failures are
  retried on the next interval.
- Failure logging is throttled to at most once every 5 minutes. The latest
  failure time and reason are visible in `/admin status`.
- Include the heartbeat secret in the website environment under the same name.
  A 401 from the website means the two values differ or the signature was over a
  different body.
- The website rate-limits the endpoint to 240 requests per minute. A 30-second
  interval uses 2 per minute.

## Health server

The process listens on `0.0.0.0:${PORT}` (default `8080`).

```text
GET /health
GET /
```

Response:

```json
{
  "ok": true,
  "uptimeSeconds": 3600,
  "ready": true,
  "guilds": 1,
  "version": "1.0.0"
}
```

- `503` with `ok: false` until the gateway is ready. This gates Railway/Fly
  health checks until login and guild caching complete.
- `200` with `ok: true` after the client is ready.
- `HEAD` is supported. Other methods return `405`.
- No secrets, tokens, guild names, or member data are exposed.
- Docker's `HEALTHCHECK` calls this endpoint through `PORT`.

## Docker

Build from `bot/`:

```powershell
docker build -t wrightyard-bot .
docker run --rm --env-file .env -p 8080:8080 wrightyard-bot
```

The image is multi-stage, runs as the non-root `node` user, installs production
dependencies only in the final stage, and includes a health check.

## Pterodactyl

Use the packaged zip and the dedicated guide in
[`README-PTERODACTYL.md`](./README-PTERODACTYL.md). In short:

1. Create a Node.js server on Node 22.12+ with 1 GB RAM.
2. Extract the zip into the server root so `package.json`, `dist/`, and
   `start.sh` sit directly at the root.
3. Create `.env` with the values from the environment table, including
   `SITE_URL=https://wrightyard.vercel.app` and the exact website
   `BOT_HEARTBEAT_SECRET`.
4. Set the startup command to `sh start.sh` (or `node dist/index.js`).
5. Start the server, run `node dist/deploy-commands.js` once if needed, then
   verify `/status`, `/ask`, `/brief`, and the website heartbeat.
6. Stop any old bot process first. One gateway process only.

## Railway

1. Create a Railway project from the repository.
2. Set the service root directory to `bot/`. Railway will use the `Dockerfile`.
3. Add every bot environment variable in the service's Variables tab.
4. Set `SITE_URL` to the production website origin and
   `BOT_HEARTBEAT_SECRET` to the exact website value.
5. Keep exactly **one replica**. A Discord gateway bot must not run twice.
6. Deploy and check `GET /health`.
7. Run `npm run deploy-commands` once from a trusted machine, or use
   `/admin sync` after the first deploy.

`railway.json` is included and points Railway at the Dockerfile and `/health`,
with an `ON_FAILURE` restart policy. Railway has deprecated config-as-code:
existing files continue to work for legacy services until **2026-12-01**, and
new projects should use the dashboard or Railway's Infrastructure as Code
format. Treat the dashboard as the source of truth and keep the file only as a
compatibility aid.

## Fly.io

The included `fly.toml` uses:

- `internal_port = 8080`
- `auto_stop_machines = "off"` and `auto_start_machines = false`
- `min_machines_running = 1`
- an HTTP `/health` check
- `SIGTERM` with a 20-second grace period

Change `app` and `primary_region` before deploying. Set secrets through the Fly
dashboard or CLI; avoid putting a token directly in a committed file:

```powershell
fly secrets set DISCORD_TOKEN=... DISCORD_CLIENT_ID=... DISCORD_GUILD_ID=...
fly secrets set OWNER_ID=... SITE_URL=... BOT_HEARTBEAT_SECRET=...
fly secrets set ANNOUNCEMENTS_CHANNEL_ID=... TICKET_PANEL_CHANNEL_ID=...
fly secrets set TICKET_LOG_CHANNEL_ID=... STAFF_ROLE_IDS=... TICKET_CATEGORY_ID=
fly deploy
```

Fly sends `SIGINT` by default; the `kill_signal` setting is set to `SIGTERM`,
and the process handles both. Do not enable autostop; a stopped machine cannot
hold the Discord gateway or rotate presence.

## Any other host

Any persistent process host works. The requirements are:

- Node.js 22.12+
- One long-running process
- Environment variables from the table above
- A routed port equal to `PORT`
- A health check on `/health`
- No serverless request timeout

Render, a VPS, or a container platform are all suitable. Do not use Vercel
functions.

## Operations

### Logging

Logs are line-oriented: timestamp, level, scope, message, and an optional JSON
field object. Sensitive field names (`token`, `secret`, `signature`,
`authorization`, `cookie`) are redacted before serialization. Errors are logged
with name, message, stack, and Discord error code/status when available.

Interaction failures are acknowledged with a generic, non-internal message.
Detailed causes stay in the logs. Expected user errors (missing permissions,
already claimed, cooldown) are shown ephemerally with safe text.

### Shutdown

`SIGINT` and `SIGTERM` stop the heartbeat and presence timers, abort an in-flight
heartbeat, close the health server, destroy the Discord client, and exit. A
10-second timer forces exit if cleanup hangs. Docker, Railway, and Fly all send
one of these signals.

### Failure behavior

- Missing `DISCORD_TOKEN`: configuration error, exit code 1, no secret printed.
- Placeholder token: clear configuration error, exit code 1.
- Invalid IDs, port, URL, or short heartbeat secret: configuration error at
  startup.
- Missing optional channels/roles: warning at startup; related features degrade.
- Missing bot permissions: warning at startup, plus runtime refusals with
  specific permission names.
- Website heartbeat failure: warning at most every 5 minutes; the bot continues.
- Ticket creation failure: safe user message, detailed log, and a staff notice in
  the ticket log channel when configured.
- Gateway error or unhandled exception: logged; uncaught exceptions trigger a
  graceful shutdown with exit code 1.

### Troubleshooting

| Symptom | Check |
| --- | --- |
| `DISCORD_TOKEN is missing.` | The env file is not in `bot/` or the host variable is absent. |
| Commands do not appear | Run `npm run deploy-commands` against the correct `DISCORD_GUILD_ID`; allow Discord a moment to propagate; use `/admin sync`. |
| `/admin` is hidden | It is registered for Administrators and refuses non-owners. Confirm both the guild permission and `OWNER_ID`. |
| Ticket opening says intake is not configured | `STAFF_ROLE_IDS` is empty or none of the IDs exist in the guild. |
| Ticket creation fails | Confirm Manage Channels and Manage Roles, and that the bot role is above the staff roles. |
| Heartbeat 401 | `BOT_HEARTBEAT_SECRET` differs between bot and website, or a proxy rewrote the request body. |
| Heartbeat 422 | The website's heartbeat schema rejected a field; check the response in the bot logs. |
| `/health` returns 503 | The gateway has not reached ready; check `/admin status` or logs for login/intent errors. |
| Presence stopped rotating | Maintenance is on, or a local/website override is active. |
| Bot appears offline after a while | Ensure the host is not autostopping or running the process only as a serverless function. |

## Security notes

- The bot token is read only from `DISCORD_TOKEN`; it is never hardcoded,
  printed, or included in health output.
- The owner check compares the interacting user ID to `OWNER_ID` on every admin
  subcommand. Server administrator does not imply owner.
- Staff and opener checks run at interaction time, not only when the panel was
  posted.
- Ticket channel creation and closing check current bot permissions.
- No `eval`, shell execution, arbitrary user-supplied URLs, or dynamic imports
  from user input.
- `allowedMentions: { parse: [] }` is the client default and is set explicitly
  on outgoing messages, so announcements and ticket notices cannot ping
  `@everyone`.
- Only the `Guilds` intent is requested.
- Secrets belong in `.env.local` or the host's secret manager. `.env*` is
  ignored except `.env.example`, and `.dockerignore` keeps env files out of the
  image.

If a token or heartbeat secret has ever been exposed, rotate it in the Discord
Developer Portal and in the website environment before production. Rotating the
heartbeat secret requires updating both deployments together.

## Project layout

```text
bot/
  src/
    admin/actions.ts          owner subcommand implementations
    commands/                 loaded slash command modules
    interactions/             command/button routing and safe replies
    services/                 presence, heartbeat, health, command sync
    tickets/                  ledger, topic schema, lifecycle
    views/                    embeds and component rows
    config.ts                 environment parsing and validation
    index.ts                  boot, ready, shutdown
    deploy-commands.ts        REST command registration
  Dockerfile
  railway.json
  fly.toml
  .env.example
  package.json
  package-lock.json
  tsconfig.json
```

## Verification

Run locally:

```powershell
cd bot
npm run typecheck
npm run build
npm run smoke
```

`npm run smoke` starts a stubbed health server and a local signed-heartbeat
receiver. It verifies the 503/200 health responses, the exact HMAC over the raw
request body, website presence and maintenance conversion, website-override
clearing, and the sync flag. It does not connect to Discord.

Expected startup failure without a token (exit code 1, one clear error):

```text
Configuration error {"message":"DISCORD_TOKEN is missing."}
```

The command loader can be checked without logging in by importing the built
loader and listing the six command modules: `admin`, `help`, `site`, `stats`,
`status`, and `ticket`. `/admin` serializes with
`default_member_permissions = "8"` (Administrator) and six subcommands.

Live verification still requires a real setup:

- A Discord bot token and a **development** guild
- A command deployment to that development guild
- Running `/status`, `/stats`, `/site`, `/help`, `/ticket`, and the owner
  subcommands in the guild
- Clicking through ticket open, claim, close, and delete
- Confirming a non-owner is refused by `/admin`
- Confirming a member without a staff role cannot claim or delete
- A signed heartbeat accepted by the website and a delivered presence override
- A host or Docker runtime that keeps one process alive

Those checks should be done in a test guild before pointing the deployment at
the production guild. See the repository root `README.md` for the website-side
environment and deployment notes.
